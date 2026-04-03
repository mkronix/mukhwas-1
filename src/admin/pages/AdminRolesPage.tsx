import React, { useMemo, useState } from "react";
import { useRoles } from "@/admin/hooks/useAdminData";
import { RoleService } from "@/admin/services/StaffService";
import { DataTableOne } from "@/components/ui/data-table";
import type { DataTableOneColumn } from "@/components/ui/data-table";
import { ModalFormField } from "@/components/ui/modal-form-field";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PermissionGuard } from "@/components/ui/permission-guard";
import { PermissionMatrix } from "@/components/ui/permission-matrix";
import type { PermissionItem } from "@/components/ui/permission-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Role, RolePermission, RolePermissionSurface } from "@/types";
import { Action, Module, buildModulePermissionMatrixItems } from "@/constant/permissions";

function permsToKeys(perms: RolePermission[]): string[] {
  const keys: string[] = [];
  for (const p of perms) {
    if (p.can_read) keys.push(`${p.module}.read`);
    if (p.can_create) keys.push(`${p.module}.create`);
    if (p.can_update) keys.push(`${p.module}.update`);
    if (p.can_delete) keys.push(`${p.module}.delete`);
    if (p.can_export) keys.push(`${p.module}.export`);
    if (p.can_view_reports) keys.push(`${p.module}.view_reports`);
    let ext = p.extended_actions;
    if (typeof ext === "string") {
      try {
        ext = JSON.parse(ext) as string[];
      } catch {
        ext = [];
      }
    }
    if (Array.isArray(ext)) {
      for (const a of ext) {
        if (typeof a === "string") keys.push(`${p.module}.${a}`);
      }
    }
  }
  return keys;
}

function keysToRolePermissions(
  roleId: string,
  surface: RolePermissionSurface,
  keys: string[],
): RolePermission[] {
  const byModule = new Map<string, Set<string>>();
  for (const key of keys) {
    const i = key.lastIndexOf(".");
    if (i <= 0) continue;
    const mod = key.slice(0, i);
    const act = key.slice(i + 1);
    if (!byModule.has(mod)) byModule.set(mod, new Set());
    byModule.get(mod)!.add(act);
  }
  const rows: RolePermission[] = [];
  for (const [mod, actions] of byModule) {
    const row: RolePermission = {
      id: `perm_${roleId}_${surface}_${mod}`,
      role_id: roleId,
      module: mod,
      surface,
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false,
      can_export: false,
      can_view_reports: false,
      extended_actions: [],
    };
    const extended: string[] = [];
    for (const a of actions) {
      if (a === "read") row.can_read = true;
      else if (a === "create") row.can_create = true;
      else if (a === "update") row.can_update = true;
      else if (a === "delete") row.can_delete = true;
      else if (a === "export") row.can_export = true;
      else if (a === "view_reports") row.can_view_reports = true;
      else extended.push(a);
    }
    row.extended_actions = extended;
    rows.push(row);
  }
  return rows;
}

export const AdminRolesPage: React.FC = () => {
  const { roles, loading, refresh } = useRoles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [adminSelected, setAdminSelected] = useState<string[]>([]);
  const [posSelected, setPosSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  const permissionItems: PermissionItem[] = useMemo(() => {
    const raw = buildModulePermissionMatrixItems();
    return raw.map((r) => ({
      key: r.key,
      module: r.groupLabel,
      subModule: r.moduleLabel,
      description: r.description,
    }));
  }, []);

  const openCreate = () => {
    setNameError(undefined);
    setEditRole(null);
    setRoleName("");
    setAdminSelected([]);
    setPosSelected([]);
    setModalOpen(true);
  };

  const openEdit = async (role: Role) => {
    setNameError(undefined);
    setEditRole(role);
    setRoleName(role.name);
    const perms = await RoleService.getPermissions(role.id);
    setAdminSelected(permsToKeys(perms.filter((p) => p.surface === "admin")));
    setPosSelected(permsToKeys(perms.filter((p) => p.surface === "pos")));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editRole?.is_system_role && !roleName.trim()) {
      setNameError("Role name is required");
      return;
    }
    setNameError(undefined);
    setSaving(true);
    try {
      let roleId: string;

      if (editRole) {
        await RoleService.update(editRole.id, {
          name: roleName,
        });
        roleId = editRole.id;
      } else {
        const created = await RoleService.create({
          name: roleName,
          description: "",
          surface: "admin",
          is_system_role: false,
          created_by: "staff_1",
        });
        roleId = created.id;
      }

      const adminRows = keysToRolePermissions(roleId, "admin", adminSelected);
      const posRows = keysToRolePermissions(roleId, "pos", posSelected);
      await RoleService.updatePermissions(roleId, [...adminRows, ...posRows]);
      toast.success(editRole ? "Role updated" : "Role created");
      setModalOpen(false);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    const count = RoleService.getStaffCountByRole(role.id);
    if (count > 0) {
      toast.error(`Cannot delete: ${count} staff members assigned`);
      return;
    }
    await RoleService.delete(role.id);
    toast.success("Role deleted");
    refresh();
  };

  const columns: DataTableOneColumn<Role>[] = [
    {
      key: "name",
      header: "Role",
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.is_system_role && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-[13px] font-medium text-foreground">{r.name}</span>
        </div>
      ),
    },
    {
      key: "desc",
      header: "Description",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">{r.description}</span>
      ),
    },
    {
      key: "staff",
      header: "Staff",
      render: (r) => (
        <span className="text-[13px] text-muted-foreground">
          {RoleService.getStaffCountByRole(r.id)}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openEdit(r)}
            title="Edit Role"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {!r.is_system_role && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(r)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const systemRole = editRole?.is_system_role === true;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Roles & Permissions</h2>
        <PermissionGuard permission={{ module: Module.ROLES, action: Action.CREATE }}>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Add Role</span>
          </Button>
        </PermissionGuard>
      </div>

      <DataTableOne
        columns={columns}
        data={roles}
        keyExtractor={(r) => r.id}
        loading={loading}
        emptyMessage="No roles"
      />

      <ResponsiveModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setNameError(undefined);
        }}
        title={editRole ? `Edit Role` : "New Role"}
        className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-5 pb-20">
          <ModalFormField
            label="Role name"
            error={nameError}
            description={systemRole ? "System roles cannot be renamed; you can still review permissions." : undefined}
          >
            {(id) => (
              <Input
                id={id}
                placeholder="e.g. Inventory Manager"
                value={roleName}
                onChange={(e) => {
                  setRoleName(e.target.value);
                  if (nameError) setNameError(undefined);
                }}
                disabled={systemRole}
              />
            )}
          </ModalFormField>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
              Admin module access
            </p>
            <PermissionMatrix
              permissions={permissionItems}
              selected={adminSelected}
              onChange={setAdminSelected}
              showSearch
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
              POS module access
            </p>
            <PermissionMatrix
              permissions={permissionItems}
              selected={posSelected}
              onChange={setPosSelected}
              showSearch
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editRole ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
};
