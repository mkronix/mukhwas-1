import env from "@/config/env";
import type { NavItem } from "@/admin/constant/nav";
import type { ActionKey, ModuleKey } from "@/constant/permissions";

export function filterStaffNavItems(
  items: NavItem[],
  hasPermission: (module: ModuleKey, action: ActionKey) => boolean,
  isDeveloper: boolean,
): NavItem[] {
  return items.filter(
    (item) =>
      (!item.module ||
        !item.action ||
        hasPermission(item.module, item.action)) &&
      (!item.devOnly || env.IS_DEV_MODE || isDeveloper),
  );
}
