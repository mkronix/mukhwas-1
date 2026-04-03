import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LedgerService } from "@/admin/services/LedgerService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Textarea } from "@/components/ui/textarea";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Unlink, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { BankTransaction, JournalEntry } from "@/types";
import { Action, Module } from "@/constant/permissions";

const fmt = (p: number) =>
  `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-xl font-bold mt-1 ${alert ? "text-warning" : "text-foreground"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

const BankReconciliationPage: React.FC = () => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [matchDrawer, setMatchDrawer] = useState<BankTransaction | null>(null);
  const [matchSearch, setMatchSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvError, setCsvError] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, j] = await Promise.all([
        LedgerService.getBankTransactions(),
        LedgerService.getJournalEntries(),
      ]);
      setTransactions(t);
      setJournalEntries(j);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (!search) return transactions;
    return transactions.filter((t) =>
      t.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [transactions, search]);

  const totalDebit = transactions.reduce((s, t) => s + t.debit_paisa, 0);
  const totalCredit = transactions.reduce((s, t) => s + t.credit_paisa, 0);
  const unreconciledCount = transactions.filter((t) => !t.is_reconciled).length;
  const closingBalance =
    transactions.length > 0
      ? transactions[transactions.length - 1].balance_paisa
      : 0;

  const unmatchedJournals = useMemo(() => {
    const matchedIds = new Set(
      transactions
        .filter((t) => t.matched_journal_entry_id)
        .map((t) => t.matched_journal_entry_id),
    );
    let list = journalEntries.filter((je) => !matchedIds.has(je.id));
    if (matchDrawer) {
      const amt = matchDrawer.debit_paisa || matchDrawer.credit_paisa;
      list = list.filter((je) => {
        const total = je.lines.reduce((s, l) => s + l.debit_paisa, 0);
        return Math.abs(total - amt) < amt * 0.2;
      });
    }
    if (matchSearch)
      list = list.filter((je) =>
        je.description.toLowerCase().includes(matchSearch.toLowerCase()),
      );
    return list;
  }, [journalEntries, transactions, matchDrawer, matchSearch]);

  const handleMatch = async (jeId: string) => {
    if (!matchDrawer) return;
    await LedgerService.matchBankTransaction(matchDrawer.id, jeId);
    toast.success("Transaction matched");
    setMatchDrawer(null);
    loadData();
  };

  const handleUnmatch = async (txnId: string) => {
    await LedgerService.unmatchBankTransaction(txnId);
    toast.success("Transaction unmatched");
    loadData();
  };

  const columns: DataTableOneColumn<BankTransaction>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (t) => t.date,
      render: (t) => (
        <span className="text-[13px]">
          {format(new Date(t.date), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "desc",
      header: "Description",
      render: (t) => (
        <span className="text-[13px] text-muted-foreground line-clamp-1">
          {t.description}
        </span>
      ),
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      render: (t) => (
        <span className="text-[13px] text-destructive">
          {t.debit_paisa ? fmt(t.debit_paisa) : "—"}
        </span>
      ),
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      render: (t) => (
        <span className="text-[13px] text-success">
          {t.credit_paisa ? fmt(t.credit_paisa) : "—"}
        </span>
      ),
    },
    {
      key: "ref",
      header: "Ref",
      render: (t) => (
        <span className="text-[11px] text-muted-foreground font-mono">
          {t.reference_number || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) =>
        t.is_reconciled ? (
          <Badge className="text-[10px] bg-success/10 text-success border-0">
            Reconciled
          </Badge>
        ) : (
          <Badge className="text-[10px] bg-warning/10 text-warning border-0">
            Unreconciled
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (t) =>
        t.is_reconciled ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => handleUnmatch(t.id)}
          >
            <Unlink className="h-3 w-3" />
            Unmatch
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => {
              setMatchDrawer(t);
              setMatchSearch("");
            }}
          >
            <Link2 className="h-3 w-3" />
            Match
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Bank Reconciliation
        </h2>
        <PermissionGuard
          permission={{ module: Module.LEDGER_BANK, action: Action.IMPORT }}
        >
          {" "}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="gap-1.5"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden lg:inline">Import</span>
          </Button>
        </PermissionGuard>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Debits" value={fmt(totalDebit)} />
          <StatCard label="Total Credits" value={fmt(totalCredit)} />
          <StatCard label="Closing Balance" value={fmt(closingBalance)} />
          <StatCard
            label="Unreconciled"
            value={String(unreconciledCount)}
            alert={unreconciledCount > 0}
          />
        </div>
      )}

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(t) => t.id}
        loading={loading}
        emptyMessage="No bank transactions"
        toolbarFilters={
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48 text-[13px]"
          />
        }
      />

      <Sheet open={!!matchDrawer} onOpenChange={() => setMatchDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {matchDrawer && (
            <>
              <SheetHeader>
                <SheetTitle>Match Transaction</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {matchDrawer.description}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(matchDrawer.date), "dd MMM yyyy")}
                      </span>
                      <span
                        className={
                          matchDrawer.debit_paisa
                            ? "text-destructive"
                            : "text-success"
                        }
                      >
                        {fmt(
                          matchDrawer.debit_paisa || matchDrawer.credit_paisa,
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Input
                    placeholder="Search journal entries..."
                    value={matchSearch}
                    onChange={(e) => setMatchSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {unmatchedJournals.map((je) => (
                    <Card
                      key={je.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleMatch(je.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {je.entry_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {je.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {fmt(
                                je.lines.reduce((s, l) => s + l.debit_paisa, 0),
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(je.date), "dd MMM")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {unmatchedJournals.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No matching journal entries found
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ResponsiveModal
        open={importOpen}
        onOpenChange={(v) => {
          setImportOpen(v);
          if (!v) setCsvError(undefined);
        }}
        title="Import Bank Transactions"
      >
        <div className="space-y-4 pb-20">
          <ModalFormField
            label="CSV data"
            error={csvError}
            description="Paste CSV: date, description, debit, credit, reference"
          >
            {(id) => (
              <Textarea
                id={id}
                className="min-h-[160px] font-mono text-sm"
                placeholder="2026-04-01,NEFT IN,0,15000,UTR123"
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  if (csvError) setCsvError(undefined);
                }}
              />
            )}
          </ModalFormField>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 pb-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setImportOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!csvText.trim()) {
                setCsvError("Add at least one row of CSV data");
                return;
              }
              setCsvError(undefined);
              toast.success("Import feature ready for API integration");
              setImportOpen(false);
            }}
          >
            Import
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default BankReconciliationPage;
