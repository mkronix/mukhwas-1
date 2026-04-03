import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { Staff, Role } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { posStaff, posRoles, posConfig } from "@/pos/mock";
import {
  Action,
  type ActionKey,
  type ModuleKey,
  type Permission,
  Module,
} from "@/constant/permissions";
import { SYSTEM_ROLE_PERMISSIONS } from "@/constant/permissions";
import env from "@/config/env";
import { posApiClient } from "@/lib/apiClient";

interface POSAuthState {
  staff: Staff | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  sessionStartTime: string | null;
}

interface LockoutState {
  staffId: string;
  lockedUntil: number;
  attempts: number;
}

interface POSAuthContextValue extends POSAuthState {
  login: (
    staffId: string,
    pin: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    attempts?: number;
    maxAttempts?: number;
    lockedUntil?: number;
  }>;
  logout: () => void;
  hasPermission: (module: ModuleKey, action: ActionKey) => boolean;
  hasPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  getStaffList: () => Staff[];
  getLockoutState: (staffId: string) => LockoutState | null;
}

const initialState: POSAuthState = {
  staff: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  sessionId: null,
  sessionStartTime: null,
};

export const POSAuthContext = createContext<POSAuthContextValue>({
  ...initialState,
  login: async () => ({ success: false }),
  logout: () => {},
  hasPermission: () => false,
  hasPermissions: () => false,
  hasAnyPermission: () => false,
  getStaffList: () => [],
  getLockoutState: () => null,
});

function getLockouts(): Record<string, LockoutState> {
  try {
    const stored = sessionStorage.getItem("pos_lockouts");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLockouts(lockouts: Record<string, LockoutState>) {
  sessionStorage.setItem("pos_lockouts", JSON.stringify(lockouts));
}

function buildPOSPermissions(roleId: string): Permission[] {
  const roleKey = Object.keys(SYSTEM_ROLE_PERMISSIONS).find(
    (key) => SYSTEM_ROLE_PERMISSIONS[key].roleId === roleId,
  );
  if (roleKey) return SYSTEM_ROLE_PERMISSIONS[roleKey].posPermissions;

  return [
    { module: Module.POS_PRODUCT_BROWSER, action: Action.READ },
    { module: Module.POS_PRODUCT_BROWSER, action: Action.POS_LOGIN },
    { module: Module.POS_CART, action: Action.POS_ADD_TO_CART },
    { module: Module.POS_CART, action: Action.POS_REMOVE_FROM_CART },
    { module: Module.POS_CART, action: Action.POS_UPDATE_QUANTITY },
    { module: Module.POS_CART, action: Action.POS_CLEAR_CART },
    { module: Module.POS_PAYMENT, action: Action.POS_SELECT_PAYMENT_MODE },
    { module: Module.POS_PAYMENT, action: Action.POS_PROCESS_CASH },
    { module: Module.POS_PAYMENT, action: Action.POS_PROCESS_CARD },
    { module: Module.POS_PAYMENT, action: Action.POS_PROCESS_UPI },
    { module: Module.POS_PAYMENT, action: Action.POS_CHARGE },
    { module: Module.POS_RECEIPT, action: Action.POS_PRINT_RECEIPT },
    { module: Module.POS_RECEIPT, action: Action.POS_DOWNLOAD_RECEIPT },
    { module: Module.POS_SESSION, action: Action.READ },
    { module: Module.POS_SESSION, action: Action.POS_CLOSE_SESSION },
    { module: Module.POS_SESSION, action: Action.POS_VIEW_SESSION_SUMMARY },
    { module: Module.POS_REPORTS, action: Action.READ },
    { module: Module.POS_REPORTS, action: Action.POS_VIEW_REPORTS },
    { module: Module.INVENTORY_FINISHED, action: Action.READ },
    { module: Module.ORDERS, action: Action.READ },
    { module: Module.ORDERS, action: Action.CREATE },
  ];
}

export const POSAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setPermissions, hasPermission, hasPermissions, hasAnyPermission } =
    useAuthStore();
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval>>();

  const [state, setState] = useState<POSAuthState>(() => {
    const stored = sessionStorage.getItem("pos_auth");
    if (stored) {
      const data = JSON.parse(stored);
      setPermissions(data.permissions || [], Boolean(data.staff?.is_developer));
      return {
        staff: data.staff,
        role: data.role,
        isAuthenticated: true,
        isLoading: false,
        sessionId: data.sessionId,
        sessionStartTime: data.sessionStartTime,
      };
    }
    return { ...initialState, isLoading: false };
  });

  useEffect(() => {
    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, []);

  const getStaffList = useCallback((): Staff[] => {
    if (env.IS_MOCK_MODE) {
      return posStaff.filter((s) => {
        if (s.is_developer) return false;
        return s.pos_access === true;
      });
    }
    // In API mode, staff list is fetched separately via hook
    return [];
  }, []);

  const getLockoutState = useCallback(
    (staffId: string): LockoutState | null => {
      const lockouts = getLockouts();
      const lockout = lockouts[staffId];
      if (!lockout) return null;
      if (Date.now() > lockout.lockedUntil) {
        delete lockouts[staffId];
        saveLockouts(lockouts);
        return null;
      }
      return lockout;
    },
    [],
  );

  const login = useCallback(
    async (staffId: string, pin: string) => {
      if (env.IS_MOCK_MODE) {
        // Mock mode: validate against mock data
        const maxAttempts = posConfig.pin_lockout_attempts;
        const lockoutMs = posConfig.lockout_duration_minutes * 60 * 1000;

        const lockout = getLockoutState(staffId);
        if (lockout && Date.now() < lockout.lockedUntil) {
          return {
            success: false,
            error: "Account locked",
            lockedUntil: lockout.lockedUntil,
            attempts: lockout.attempts,
            maxAttempts,
          };
        }

        await new Promise((r) => setTimeout(r, 300));

        const staff = posStaff.find((s) => s.id === staffId);
        if (!staff) return { success: false, error: "Staff not found" };

        if (staff.pin_hash !== pin) {
          const lockouts = getLockouts();
          const current = lockouts[staffId] || {
            staffId,
            lockedUntil: 0,
            attempts: 0,
          };
          current.attempts += 1;

          if (current.attempts >= maxAttempts) {
            current.lockedUntil = Date.now() + lockoutMs;
            lockouts[staffId] = current;
            saveLockouts(lockouts);
            return {
              success: false,
              error: "Account locked",
              lockedUntil: current.lockedUntil,
              attempts: current.attempts,
              maxAttempts,
            };
          }

          lockouts[staffId] = current;
          saveLockouts(lockouts);
          return {
            success: false,
            error: "Incorrect PIN",
            attempts: current.attempts,
            maxAttempts,
          };
        }

        const lockouts = getLockouts();
        delete lockouts[staffId];
        saveLockouts(lockouts);

        const role = posRoles.find((r) => r.id === staff.role_id);
        const sessionId = `session_${Date.now()}`;
        const sessionStartTime = new Date().toISOString();
        const permissions = buildPOSPermissions(staff.role_id);

        const authData = {
          staff,
          role,
          permissions,
          sessionId,
          sessionStartTime,
        };
        sessionStorage.setItem("pos_auth", JSON.stringify(authData));
        setPermissions(permissions, Boolean(staff.is_developer));
        setState({
          staff,
          role: role || null,
          isAuthenticated: true,
          isLoading: false,
          sessionId,
          sessionStartTime,
        });
        return { success: true };
      } else {
        // API mode: call backend
        try {
          const res = await posApiClient.post<{
            staff: Staff;
            role: Role;
            permissions: Permission[];
            sessionId: string;
            sessionStartTime: string;
            token: string;
          }>('/auth/pos/login', { staffId, pin });
          const { staff, role, permissions, sessionId, sessionStartTime, token } = res.data;
          const authData = { staff, role, permissions, sessionId, sessionStartTime, token };
          sessionStorage.setItem("pos_auth", JSON.stringify(authData));
          setPermissions(permissions, Boolean(staff.is_developer));
          setState({
            staff,
            role,
            isAuthenticated: true,
            isLoading: false,
            sessionId,
            sessionStartTime,
          });
          return { success: true };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed';
          return { success: false, error: message };
        }
      }
    },
    [setPermissions, getLockoutState],
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("pos_auth");
    localStorage.removeItem("pos_cart");
    setPermissions([]);
    setState({ ...initialState, isLoading: false });
  }, [setPermissions]);

  return (
    <POSAuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasPermission,
        hasPermissions,
        hasAnyPermission,
        getStaffList,
        getLockoutState,
      }}
    >
      {children}
    </POSAuthContext.Provider>
  );
};
