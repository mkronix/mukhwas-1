import React, { useState, useMemo } from "react";
import { mockPOSTransactions, mockPOSSessions } from "@/pos/mock";
import { formatINR } from "@/lib/format";
import { usePOSAuth } from "@/pos/auth/usePOSAuth";
import { Input } from "@/components/ui/input";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { Textarea } from "@/components/ui/textarea";

interface EndSessionModalProps {
  onClose: () => void;
  onConfirm: (actualCash: number, notes: string) => void;
}

export const EndSessionModal: React.FC<EndSessionModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const { sessionId } = usePOSAuth();
  const [step, setStep] = useState<"reconciliation" | "summary">(
    "reconciliation",
  );
  const [actualCashInput, setActualCashInput] = useState("");
  const [notes, setNotes] = useState("");
  const [cashCountError, setCashCountError] = useState<string | undefined>();

  const sessionTxns = useMemo(
    () => mockPOSTransactions.filter((t) => t.session_id === sessionId),
    [sessionId],
  );

  const openingCash = 500000;
  const cashSales = sessionTxns
    .filter((t) => t.payment_mode === "cash")
    .reduce((s, t) => s + t.total_paisa, 0);
  const cashRefunds = 0;
  const expectedCash = openingCash + cashSales - cashRefunds;
  const actualCash = Math.round(parseFloat(actualCashInput || "0") * 100);
  const variance = actualCash - expectedCash;
  const upiSales = sessionTxns
    .filter((t) => t.payment_mode === "upi")
    .reduce((s, t) => s + t.total_paisa, 0);
  const cardSales = sessionTxns
    .filter((t) => t.payment_mode === "card")
    .reduce((s, t) => s + t.total_paisa, 0);
  const totalRevenue = sessionTxns.reduce((s, t) => s + t.total_paisa, 0);
  const totalItems = sessionTxns.reduce(
    (s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );

  const productCounts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    sessionTxns.forEach((t) =>
      t.items.forEach((i) => {
        const key = i.product_name;
        const existing = map.get(key) || { name: key, qty: 0 };
        existing.qty += i.quantity;
        map.set(key, existing);
      }),
    );
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 3);
  }, [sessionTxns]);

  const varianceColor =
    variance === 0
      ? "text-success"
      : Math.abs(variance) < 5000
        ? "text-warning"
        : "text-destructive";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">End Session</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step === "reconciliation"
              ? "Cash Reconciliation"
              : "Session Summary"}
          </p>
        </div>

        {step === "reconciliation" && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Opening Cash</p>
                <p className="text-sm font-bold text-foreground">
                  {formatINR(openingCash)}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Cash Sales</p>
                <p className="text-sm font-bold text-foreground">
                  {formatINR(cashSales)}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Cash Refunds</p>
                <p className="text-sm font-bold text-foreground">
                  {formatINR(cashRefunds)}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Expected Cash</p>
                <p className="text-sm font-bold text-primary">
                  {formatINR(expectedCash)}
                </p>
              </div>
            </div>

            <ModalFormField
              label="Actual cash counted"
              error={cashCountError}
              description="Enter amount in rupees (₹)"
            >
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  step="0.01"
                  value={actualCashInput}
                  onChange={(e) => {
                    setActualCashInput(e.target.value);
                    if (cashCountError) setCashCountError(undefined);
                  }}
                  placeholder="0.00"
                  className="w-full text-lg font-bold text-right"
                  autoFocus
                />
              )}
            </ModalFormField>

            {actualCashInput && (
              <div className="flex justify-between items-center bg-secondary rounded-lg p-3">
                <span className="text-sm text-muted-foreground">Variance</span>
                <span className={`text-sm font-bold ${varianceColor}`}>
                  {variance >= 0 ? "+" : ""}
                  {formatINR(variance)}
                </span>
              </div>
            )}

            <ModalFormField label="Notes" description="Optional">
              {(id) => (
                <Textarea
                  id={id}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Variance explanation…"
                />
              )}
            </ModalFormField>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = parseFloat(actualCashInput);
                  if (
                    actualCashInput.trim() === "" ||
                    Number.isNaN(n) ||
                    n < 0
                  ) {
                    setCashCountError("Enter the cash counted in ₹");
                    return;
                  }
                  setCashCountError(undefined);
                  setStep("summary");
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "summary" && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold text-foreground">
                  {sessionTxns.length}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-foreground">
                  {formatINR(totalRevenue)}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Items Sold</p>
                <p className="text-lg font-bold text-foreground">
                  {totalItems}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Cash Variance</p>
                <p className={`text-lg font-bold ${varianceColor}`}>
                  {variance >= 0 ? "+" : ""}
                  {formatINR(variance)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground mb-2">
                Revenue by Payment Mode
              </p>
              <div className="space-y-1.5">
                {[
                  { label: "Cash", amount: cashSales },
                  { label: "UPI", amount: upiSales },
                  { label: "Card", amount: cardSales },
                ]
                  .filter((r) => r.amount > 0)
                  .map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-medium text-foreground">
                        {formatINR(r.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {productCounts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-2">
                  Top Products
                </p>
                <div className="space-y-1.5">
                  {productCounts.map((p, i) => (
                    <div key={p.name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {i + 1}. {p.name}
                      </span>
                      <span className="font-medium text-foreground">
                        {p.qty} sold
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("reconciliation")}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => onConfirm(actualCash, notes)}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
