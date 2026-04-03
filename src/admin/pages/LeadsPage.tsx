import React, { useState, useMemo } from "react";
import { useLeads } from "@/admin/hooks/useLeads";
import { useStaffDropdown } from "@/admin/hooks/useStaff";
import { LeadService } from "@/admin/services/LeadService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Lead, LeadStatus } from "@/types";
import { Action, Module } from "@/constant/permissions";

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-info/10 text-info" },
  {
    value: "contacted",
    label: "Contacted",
    color: "bg-primary/10 text-primary",
  },
  {
    value: "qualified",
    label: "Qualified",
    color: "bg-warning/10 text-warning",
  },
  {
    value: "converted",
    label: "Converted",
    color: "bg-success/10 text-success",
  },
  { value: "lost", label: "Lost", color: "bg-destructive/10 text-destructive" },
];

const SOURCE_OPTIONS = [
  { value: "contact_form", label: "Contact Form" },
  { value: "phone", label: "Phone" },
  { value: "referral", label: "Referral" },
  { value: "storefront", label: "Storefront" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
];

const LeadsPage: React.FC = () => {
  const { leads, loading, refresh } = useLeads();
  const { staff: staffOptions } = useStaffDropdown();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("contact_form");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [leadErrors, setLeadErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const openCreate = () => {
    setLeadErrors({});
    setEditLead(null);
    setName("");
    setEmail("");
    setPhone("");
    setSource("contact_form");
    setStatus("new");
    setNotes("");
    setAssignedTo("");
    setModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setLeadErrors({});
    setEditLead(lead);
    setName(lead.name);
    setEmail(lead.email ?? "");
    setPhone(lead.phone);
    setSource(lead.source);
    setStatus(lead.status);
    setNotes(lead.notes ?? "");
    setAssignedTo(lead.assigned_to ?? "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const err: typeof leadErrors = {};
    if (!name.trim()) err.name = "Name is required";
    if (!phone.trim()) err.phone = "Phone is required";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      err.email = "Enter a valid email or leave blank";
    if (Object.keys(err).length) {
      setLeadErrors(err);
      return;
    }
    setLeadErrors({});
    setSaving(true);
    try {
      if (editLead) {
        await LeadService.update(editLead.id, {
          name,
          email: email || undefined,
          phone,
          source,
          status,
          notes: notes || undefined,
          assigned_to: assignedTo || undefined,
        });
      } else {
        await LeadService.create({
          name,
          email: email || undefined,
          phone,
          source,
          status,
          notes: notes || undefined,
          assigned_to: assignedTo || undefined,
        });
      }
      toast.success(editLead ? "Lead updated" : "Lead created");
      setModalOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await LeadService.delete(id);
    toast.success("Lead deleted");
    refresh();
  };

  const filtered = useMemo(() => {
    let result = leads;
    if (statusFilter !== "all")
      result = result.filter((l) => l.status === statusFilter);
    if (sourceFilter !== "all")
      result = result.filter((l) => l.source === sourceFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone.includes(q),
      );
    }
    return result;
  }, [leads, statusFilter, sourceFilter, searchQuery]);

  const columns: DataTableOneColumn<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div>
          <p className="text-[13px] font-medium text-foreground">{r.name}</p>
          <p className="text-[11px] text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.phone}</span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (r) => (
        <Badge variant="secondary" className="text-[10px]">
          {SOURCE_OPTIONS.find((s) => s.value === r.source)?.label ?? r.source}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const s = STATUS_OPTIONS.find((o) => o.value === r.status);
        return (
          <Badge
            variant="secondary"
            className={`text-[10px] ${s?.color ?? ""}`}
          >
            {s?.label ?? r.status}
          </Badge>
        );
      },
    },
    {
      key: "assigned",
      header: "Assigned To",
      render: (r) => {
        const staff = staffOptions.find((s) => s.id === r.assigned_to);
        return (
          <span className="text-[13px] text-muted-foreground">
            {staff?.name ?? "—"}
          </span>
        );
      },
    },
    {
      key: "created",
      header: "Created",
      sortable: true,
      sortValue: (r) => r.created_at,
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(r.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <PermissionGuard
            permission={{ module: Module.LEADS, action: Action.UPDATE }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEdit(r)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={{ module: Module.LEADS, action: Action.DELETE }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(r.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Lead Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage leads from contact form and other sources
          </p>
        </div>
        <PermissionGuard
          permission={{ module: Module.LEADS, action: Action.CREATE }}
        >
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Add Lead</span>
          </Button>
        </PermissionGuard>
      </div>

      <DataTableOne
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage="No leads found"
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUS_OPTIONS.map((s) => ({
              value: s.value,
              label: s.label,
            })),
          },
          {
            key: "source",
            label: "Source",
            value: sourceFilter,
            onChange: setSourceFilter,
            options: SOURCE_OPTIONS,
          },
        ]}
        toolbarFilters={
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        }
      />

      <ResponsiveModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setLeadErrors({});
        }}
        title={editLead ? "Edit Lead" : "New Lead"}
        className="sm:max-w-[500px]"
      >
        <div className="space-y-4 pb-20">
          <ModalFormField label="Name" error={leadErrors.name}>
            {(id) => (
              <Input
                id={id}
                placeholder="Full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (leadErrors.name) setLeadErrors((p) => ({ ...p, name: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalFormField label="Email" error={leadErrors.email} description="Optional">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (leadErrors.email) setLeadErrors((p) => ({ ...p, email: undefined }));
                  }}
                />
              )}
            </ModalFormField>
            <ModalFormField label="Phone" error={leadErrors.phone}>
              {(id) => (
                <Input
                  id={id}
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (leadErrors.phone) setLeadErrors((p) => ({ ...p, phone: undefined }));
                  }}
                />
              )}
            </ModalFormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalFormField label="Source">
              {(id) => (
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
            <ModalFormField label="Status">
              {(id) => (
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as LeadStatus)}
                >
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </ModalFormField>
          </div>
          <ModalFormField label="Assigned to">
            {(id) => (
              <Select
                value={assignedTo || "unassigned"}
                onValueChange={(v) => setAssignedTo(v === "unassigned" ? "" : v)}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          <ModalFormField label="Notes" description="Optional context for your team">
            {(id) => (
              <Textarea
                id={id}
                placeholder="Called — follow up next week…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            )}
          </ModalFormField>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editLead ? "Save Changes" : "Create Lead"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};

export default LeadsPage;
