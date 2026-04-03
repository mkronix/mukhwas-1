import { useRolePermissions, useStaff } from "@/admin/hooks/useAdminData";
import { StaffService } from "@/admin/services/StaffService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { DataTableOne } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Action, Module, MODULE_LABELS, type ModuleKey } from "@/constant/permissions";
import type { Staff } from "@/types";
import { format } from "date-fns";
import { Pencil, Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const AdminStaffPage: React.FC = () => {
  const { staff, roles, loading, refresh } = useStaff();
  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formAdminAccess, setFormAdminAccess] = useState(true);
  const [formPosAccess, setFormPosAccess] = useState(false);
  const [formPin, setFormPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    role?: string;
    pin?: string;
    surfaces?: string;
  }>({});

  const previewPerms = useRolePermissions(formRole || null);

  const openModal = (s?: Staff) => {
    setFieldErrors({});
    setEditStaff(s || null);
    setFormName(s?.name || "");
    setFormEmail(s?.email || "");
    setFormRole(s?.role_id || "");
    setFormActive(s ? !s.is_locked : true);
    setFormAdminAccess(s?.admin_access ?? true);
    setFormPosAccess(s?.pos_access ?? false);
    setFormPin("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const err: typeof fieldErrors = {};
    if (!formName.trim()) err.name = "Full name is required";
    if (!formEmail.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) err.email = "Enter a valid email";
    if (!formRole) err.role = "Select a role";
    if (!formAdminAccess && !formPosAccess) {
      err.surfaces = "Enable at least Admin or POS access, or turn off access via Active instead";
    }
    if (formPosAccess && formPin.length > 0 && formPin.length !== 4) {
      err.pin = "POS PIN must be exactly 4 digits when provided";
    }
    if (Object.keys(err).length) {
      setFieldErrors(err);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (editStaff) {
        await StaffService.update(editStaff.id, {
          name: formName,
          email: formEmail,
          role_id: formRole,
          is_locked: !formActive,
          admin_access: formAdminAccess,
          pos_access: formPosAccess,
        });
        toast.success("Staff updated");
      } else {
        await StaffService.create({
          name: formName,
          email: formEmail,
          phone: "",
          role_id: formRole,
          admin_access: formAdminAccess,
          pos_access: formPosAccess,
        } as Omit<
          Staff,
          "id" | "created_at" | "updated_at" | "pin_failed_attempts" | "is_locked" | "is_developer"
        >);
        toast.success("Staff created");
      }
      setModalOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const readModulesForSurface = (surface: "admin" | "pos"): ModuleKey[] => {
    const keys = new Set<ModuleKey>();
    for (const p of previewPerms.permissions) {
      if (p.surface !== surface || !p.can_read) continue;
      if (p.module in MODULE_LABELS) keys.add(p.module as ModuleKey);
    }
    return Array.from(keys);
  };

  const columns: DataTableOneColumn<Staff>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {s.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[13px] font-medium text-foreground">{s.name}</p>
            <p className="text-[11px] text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (s) => (
        <Badge variant="outline" className="text-[10px]">
          {roles.find((r) => r.id === s.role_id)?.name ?? "—"}
        </Badge>
      ),
    },
    {
      key: "surfaces",
      header: "Access",
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.admin_access && (
            <Badge variant="secondary" className="text-[10px]">
              Admin
            </Badge>
          )}
          {s.pos_access && (
            <Badge variant="secondary" className="text-[10px]">
              POS
            </Badge>
          )}
          {!s.admin_access && !s.pos_access && (
            <span className="text-[11px] text-muted-foreground">None</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge
          variant="secondary"
          className={`text-[10px] ${s.is_locked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}
        >
          {s.is_locked ? "Locked" : "Active"}
        </Badge>
      ),
    },
    {
      key: "created",
      header: "Joined",
      render: (s) => (
        <span className="text-[13px] text-muted-foreground">
          {format(new Date(s.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <PermissionGuard permission={{ module: Module.STAFF, action: Action.UPDATE }}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(s)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Staff</h2>
        <PermissionGuard permission={{ module: Module.STAFF, action: Action.CREATE }}>
          <Button size="sm" onClick={() => openModal()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="lg:inline hidden">Add Staff</span>
          </Button>
        </PermissionGuard>
      </div>
      <DataTableOne
        columns={columns}
        data={staff}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyMessage="No staff found"
      />
      <ResponsiveModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setFieldErrors({});
        }}
        title={editStaff ? "Edit Staff" : "Add Staff"}
      >
        <div className="space-y-4 pb-20">
          <ModalFormField label="Full name" error={fieldErrors.name}>
            {(id) => (
              <Input
                id={id}
                placeholder="Jane Doe"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Email" error={fieldErrors.email} description="Used for admin password login and notifications">
            {(id) => (
              <Input
                id={id}
                placeholder="name@company.com"
                type="email"
                value={formEmail}
                onChange={(e) => {
                  setFormEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
              />
            )}
          </ModalFormField>
          <ModalFormField label="Role" error={fieldErrors.role}>
            {(id) => (
              <Select
                value={formRole}
                onValueChange={(v) => {
                  setFormRole(v);
                  if (fieldErrors.role) setFieldErrors((p) => ({ ...p, role: undefined }));
                }}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter((r) => !r.is_system_role || r.id === "role_admin")
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </ModalFormField>
          {fieldErrors.surfaces ? <p className="text-sm font-medium text-destructive">{fieldErrors.surfaces}</p> : null}
          <div className="flex items-center gap-3">
            <Switch
              checked={formActive}
              onCheckedChange={(v) => {
                setFormActive(v);
                if (fieldErrors.surfaces) setFieldErrors((p) => ({ ...p, surfaces: undefined }));
              }}
              id="staff-active"
            />
            <label htmlFor="staff-active" className="text-sm font-medium">
              Active
            </label>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium text-foreground">Admin panel access</p>
              <p className="text-xs text-muted-foreground">Allow password login to /admin</p>
            </div>
            <Switch
              checked={formAdminAccess}
              onCheckedChange={(v) => {
                setFormAdminAccess(v);
                if (fieldErrors.surfaces) setFieldErrors((p) => ({ ...p, surfaces: undefined }));
              }}
            />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium text-foreground">POS access</p>
              <p className="text-xs text-muted-foreground">Allow PIN login to /pos</p>
            </div>
            <Switch
              checked={formPosAccess}
              onCheckedChange={(v) => {
                setFormPosAccess(v);
                if (fieldErrors.surfaces) setFieldErrors((p) => ({ ...p, surfaces: undefined }));
              }}
            />
          </div>
          {formPosAccess && (
            <ModalFormField label="POS PIN" error={fieldErrors.pin} description="Optional for mock; leave blank or enter 4 digits">
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  placeholder="••••"
                  value={formPin}
                  onChange={(e) => {
                    setFormPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                    if (fieldErrors.pin) setFieldErrors((p) => ({ ...p, pin: undefined }));
                  }}
                  maxLength={4}
                  inputMode="numeric"
                />
              )}
            </ModalFormField>
          )}
          {formRole && previewPerms.permissions.length > 0 && (formAdminAccess || formPosAccess) && (
            <div className="space-y-3 border border-border rounded-lg p-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground">Module preview (read access)</p>
              {formAdminAccess && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Admin surface
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {readModulesForSurface("admin").map((m) => (
                      <Badge key={`adm-${m}`} variant="secondary" className="text-[10px]">
                        {MODULE_LABELS[m]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {formPosAccess && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    POS surface
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {readModulesForSurface("pos").map((m) => (
                      <Badge key={`pos-${m}`} variant="secondary" className="text-[10px]">
                        {MODULE_LABELS[m]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editStaff ? "Update" : "Create"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};
