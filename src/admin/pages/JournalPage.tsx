import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DatePicker } from "@/admin/components/DatePicker";
import { LedgerService } from "@/admin/services/LedgerService";
import { DataTableOne } from "@/components/ui/data-table";
import type {
  DataTableOneColumn,
  DataTableOneFilter,
} from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, AlertTriangle, ArrowUpDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Account, JournalEntry, JournalEntryLine } from "@/types";
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
          className={`text-xl font-bold mt-1 ${alert ? "text-destructive" : "text-foreground"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [drawerEntry, setDrawerEntry] = useState<JournalEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualLines, setManualLines] = useState<
    { accountId: string; debit: string; credit: string; notes: string }[]
  >([
    { accountId: "", debit: "", credit: "", notes: "" },
    { accountId: "", debit: "", credit: "", notes: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [manualErrors, setManualErrors] = useState<{
    date?: string;
    description?: string;
    balance?: string;
    lines?: string;
  }>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [e, a] = await Promise.all([
        LedgerService.getJournalEntries(),
        LedgerService.getAccounts(),
      ]);
      setEntries(e);
      setAccounts(a);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isBalanced = (e: JournalEntry) => {
    const dr = e.lines.reduce((s, l) => s + l.debit_paisa, 0);
    const cr = e.lines.reduce((s, l) => s + l.credit_paisa, 0);
    return dr === cr;
  };

  const filtered = useMemo(() => {
    let list = entries;
    if (filterType !== "all")
      list = list.filter((e) => e.reference_type === filterType);
    if (search)
      list = list.filter((e) =>
        e.description.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [entries, filterType, search]);

  const totalDebits = filtered.reduce(
    (s, e) => s + e.lines.reduce((a, l) => a + l.debit_paisa, 0),
    0,
  );
  const totalCredits = filtered.reduce(
    (s, e) => s + e.lines.reduce((a, l) => a + l.credit_paisa, 0),
    0,
  );
  const unbalancedCount = filtered.filter((e) => !isBalanced(e)).length;

  const manualTotalDebit = manualLines.reduce(
    (s, l) => s + (parseFloat(l.debit) || 0) * 100,
    0,
  );
  const manualTotalCredit = manualLines.reduce(
    (s, l) => s + (parseFloat(l.credit) || 0) * 100,
    0,
  );
  const isManualBalanced =
    manualTotalDebit === manualTotalCredit && manualTotalDebit > 0;

  const handleSaveManual = async () => {
    const err: typeof manualErrors = {};
    if (!manualDate) err.date = "Date is required";
    if (!manualDesc.trim()) err.description = "Description is required";

    let substantive = 0;
    for (const l of manualLines) {
      const d = parseFloat(l.debit) || 0;
      const c = parseFloat(l.credit) || 0;
      if (!l.accountId && d === 0 && c === 0) continue;
      substantive++;
      if (!l.accountId || (d > 0 && c > 0) || (d <= 0 && c <= 0)) {
        err.lines =
          "Each line needs an account and either a debit or a credit amount (not both)";
        break;
      }
    }
    if (!err.lines && substantive < 2) {
      err.lines = "Add at least two lines that debit and credit accounts";
    }
    if (!isManualBalanced) {
      err.balance = "Total debits must equal total credits";
    }
    if (Object.keys(err).length) {
      setManualErrors(err);
      return;
    }
    setManualErrors({});
    setSaving(true);
    try {
      const lines: JournalEntryLine[] = manualLines
        .filter(
          (l) => l.accountId && (parseFloat(l.debit) || parseFloat(l.credit)),
        )
        .map((l, i) => {
          const acc = accounts.find((a) => a.id === l.accountId);
          return {
            id: `ml_${i}`,
            journal_entry_id: "",
            account_id: l.accountId,
            account_name: acc?.name || "",
            debit_paisa: Math.round((parseFloat(l.debit) || 0) * 100),
            credit_paisa: Math.round((parseFloat(l.credit) || 0) * 100),
            narration: l.notes || undefined,
          };
        });
      await LedgerService.createJournalEntry({
        date: manualDate,
        description: manualDesc,
        lines,
        created_by: "staff_1",
        reference_type: "Adjustment",
        reference_id: "",
      });
      toast.success("Journal entry posted");
      setModalOpen(false);
      setManualLines([
        { accountId: "", debit: "", credit: "", notes: "" },
        { accountId: "", debit: "", credit: "", notes: "" },
      ]);
      setManualDate("");
      setManualDesc("");
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const refTypes = [
    "all",
    ...new Set(entries.map((e) => e.reference_type).filter(Boolean)),
  ];

  const columns: DataTableOneColumn<JournalEntry>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (e) => e.date,
      render: (e) => (
        <span className="text-[13px]">
          {format(new Date(e.date), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "number",
      header: "Entry #",
      render: (e) => (
        <span className="text-[13px] font-medium text-foreground">
          {e.entry_number}
        </span>
      ),
    },
    {
      key: "ref_type",
      header: "Type",
      render: (e) => (
        <Badge variant="outline" className="text-[10px]">
          {e.reference_type || "Manual"}
        </Badge>
      ),
    },
    {
      key: "desc",
      header: "Description",
      render: (e) => (
        <span className="text-[13px] text-muted-foreground line-clamp-1">
          {e.description}
        </span>
      ),
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      render: (e) => (
        <span className="text-[13px] font-medium">
          {fmt(e.lines.reduce((s, l) => s + l.debit_paisa, 0))}
        </span>
      ),
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      render: (e) => (
        <span className="text-[13px] font-medium">
          {fmt(e.lines.reduce((s, l) => s + l.credit_paisa, 0))}
        </span>
      ),
    },
    {
      key: "balanced",
      header: "Status",
      render: (e) =>
        isBalanced(e) ? (
          <Badge className="text-[10px] bg-success/10 text-success border-0">
            Balanced
          </Badge>
        ) : (
          <Badge className="text-[10px] bg-destructive/10 text-destructive border-0">
            Unbalanced
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setDrawerEntry(e)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  const filters: DataTableOneFilter[] = [
    {
      key: "type",
      label: "Type",
      value: filterType,
      options: refTypes.map((t) => ({
        label: t === "all" ? "All Types" : t,
        value: t,
      })),
      onChange: setFilterType,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Journal Entries
        </h2>

        <PermissionGuard
          permission={{ module: Module.LEDGER_JOURNAL, action: Action.CREATE }}
        >
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Manual Entry</span>
          </Button>
        </PermissionGuard>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Debits" value={fmt(totalDebits)} />
          <StatCard label="Total Credits" value={fmt(totalCredits)} />
          <StatCard
            label="Unbalanced Entries"
            value={String(unbalancedCount)}
            alert={unbalancedCount > 0}
          />
        </div>
      )}

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(e) => e.id}
        loading={loading}
        emptyMessage="No journal entries"
        filters={filters}
        toolbarFilters={
          <Input
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48 text-[13px]"
          />
        }
      />

      <Sheet open={!!drawerEntry} onOpenChange={() => setDrawerEntry(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {drawerEntry && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Journal Entry {drawerEntry.entry_number}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(drawerEntry.date), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <Badge variant="outline" className="text-[10px] ml-1">
                      {drawerEntry.reference_type || "Manual"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>{" "}
                    <span className="font-medium">
                      {drawerEntry.description}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created by:</span>{" "}
                    <span className="font-medium">
                      {drawerEntry.created_by}
                    </span>
                  </div>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 text-[11px] font-medium text-muted-foreground">
                          Account
                        </th>
                        <th className="text-right p-2 text-[11px] font-medium text-muted-foreground">
                          Debit
                        </th>
                        <th className="text-right p-2 text-[11px] font-medium text-muted-foreground">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawerEntry.lines.map((l) => (
                        <tr key={l.id} className="border-t border-border">
                          <td className="p-2 text-[13px]">{l.account_name}</td>
                          <td className="p-2 text-right text-[13px]">
                            {l.debit_paisa ? fmt(l.debit_paisa) : "—"}
                          </td>
                          <td className="p-2 text-right text-[13px]">
                            {l.credit_paisa ? fmt(l.credit_paisa) : "—"}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border font-semibold">
                        <td className="p-2 text-[13px]">Total</td>
                        <td className="p-2 text-right text-[13px]">
                          {fmt(
                            drawerEntry.lines.reduce(
                              (s, l) => s + l.debit_paisa,
                              0,
                            ),
                          )}
                        </td>
                        <td className="p-2 text-right text-[13px]">
                          {fmt(
                            drawerEntry.lines.reduce(
                              (s, l) => s + l.credit_paisa,
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {!isBalanced(drawerEntry) && (
                  <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4" /> This entry is
                    unbalanced
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ResponsiveModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setManualErrors({});
        }}
        title="Manual Journal Entry"
      >
        <div className="space-y-4 pb-20">
          <div className="grid grid-cols-2 gap-3">
            <ModalFormField label="Date" error={manualErrors.date}>
              {() => (
                <DatePicker
                  value={manualDate}
                  onChange={(d) => {
                    setManualDate(d);
                    if (manualErrors.date) setManualErrors((p) => ({ ...p, date: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Description" error={manualErrors.description}>
              {(id) => (
                <Input
                  id={id}
                  value={manualDesc}
                  onChange={(e) => {
                    setManualDesc(e.target.value);
                    if (manualErrors.description) setManualErrors((p) => ({ ...p, description: undefined }));
                  }}
                  placeholder="Month-end accrual"
                />
              )}
            </ModalFormField>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Line items
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setManualLines((p) => [
                    ...p,
                    { accountId: "", debit: "", credit: "", notes: "" },
                  ]);
                  if (manualErrors.lines) setManualErrors((p) => ({ ...p, lines: undefined }));
                }}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Line
              </Button>
            </div>
            <div className="space-y-2">
              {manualLines.map((line, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_80px_28px] gap-2 items-end"
                >
                  <Select
                    value={line.accountId}
                    onValueChange={(v) => {
                      const nl = [...manualLines];
                      nl[i].accountId = v;
                      setManualLines(nl);
                      if (manualErrors.lines) setManualErrors((p) => ({ ...p, lines: undefined }));
                    }}
                  >
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem
                          key={a.id}
                          value={a.id}
                          className="text-[13px]"
                        >
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Debit"
                    value={line.debit}
                    onChange={(e) => {
                      const nl = [...manualLines];
                      nl[i].debit = e.target.value;
                      setManualLines(nl);
                      if (manualErrors.lines || manualErrors.balance)
                        setManualErrors((p) => ({ ...p, lines: undefined, balance: undefined }));
                    }}
                    className="h-9 text-[13px]"
                  />
                  <Input
                    type="number"
                    placeholder="Credit"
                    value={line.credit}
                    onChange={(e) => {
                      const nl = [...manualLines];
                      nl[i].credit = e.target.value;
                      setManualLines(nl);
                      if (manualErrors.lines || manualErrors.balance)
                        setManualErrors((p) => ({ ...p, lines: undefined, balance: undefined }));
                    }}
                    className="h-9 text-[13px]"
                  />
                  {manualLines.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setManualLines((p) => p.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div
              className={`flex justify-between mt-3 p-2 rounded-lg text-sm font-medium ${isManualBalanced ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
            >
              <span>Debit: {fmt(manualTotalDebit)}</span>
              <span>Credit: {fmt(manualTotalCredit)}</span>
            </div>
            {manualErrors.lines ? (
              <p className="text-sm font-medium text-destructive">{manualErrors.lines}</p>
            ) : null}
            {manualErrors.balance ? (
              <p className="text-sm font-medium text-destructive">{manualErrors.balance}</p>
            ) : null}
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 pb-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveManual} disabled={saving}>
            {saving ? "Posting..." : "Post Entry"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default JournalPage;
