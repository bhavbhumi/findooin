/**
 * RoleContext — Global role management for multi-role users.
 *
 * BFSI users can hold multiple roles (investor, intermediary, issuer, admin).
 * This context:
 * 1. Fetches the user's roles from `user_roles` table on auth
 * 2. Persists the active role choice in localStorage
 * 3. Provides `hasRole()` for feature gating and `setActiveRole()` for switching
 * 4. Auto-selects the highest-priority role on first load (issuer > intermediary > investor)
 *
 * Usage: `const { activeRole, hasRole, userId } = useRole();`
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "investor" | "intermediary" | "issuer" | "admin";

interface RoleContextValue {
  /** All roles the current user holds */
  availableRoles: AppRole[];
  /** The currently active role */
  activeRole: AppRole;
  /** Switch the active role */
  setActiveRole: (role: AppRole) => void;
  /** Whether user has a specific role */
  hasRole: (role: AppRole) => boolean;
  /** Whether roles have been loaded */
  loaded: boolean;
  /** Current user ID */
  userId: string | null;
  /** Re-fetch roles from the database */
  refreshRoles: () => Promise<void>;
}

const ROLE_PRIORITY: AppRole[] = ["issuer", "intermediary", "investor"];
const STORAGE_KEY = "findoo_active_role";

const RoleContext = createContext<RoleContextValue>({
  availableRoles: [],
  activeRole: "investor",
  setActiveRole: () => {},
  hasRole: () => false,
  loaded: false,
  userId: null,
  refreshRoles: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<AppRole>("investor");
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchRoles = useCallback(async (uid: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);

    const userRoles = (roles?.map((r) => r.role) || ["investor"]) as AppRole[];
    setAvailableRoles(userRoles);

    // Determine default: last used > highest priority > investor
    const stored = localStorage.getItem(STORAGE_KEY) as AppRole | null;
    if (stored && userRoles.includes(stored)) {
      setActiveRoleState(stored);
    } else {
      const defaultRole = ROLE_PRIORITY.find((r) => userRoles.includes(r)) || "investor";
      setActiveRoleState(defaultRole);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setLoaded(true);
        return;
      }

      setUserId(session.user.id);
      await fetchRoles(session.user.id);
      setLoaded(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer to avoid deadlocking Supabase auth internals
      setTimeout(() => {
        if (event === "SIGNED_OUT") {
          setAvailableRoles([]);
          setActiveRoleState("investor");
          setUserId(null);
          setLoaded(true);
        } else if (event === "SIGNED_IN" && session) {
          setUserId(session.user.id);
          fetchRoles(session.user.id).then(() => setLoaded(true));
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  const setActiveRole = useCallback((role: AppRole) => {
    if (availableRoles.includes(role)) {
      setActiveRoleState(role);
      localStorage.setItem(STORAGE_KEY, role);
    }
  }, [availableRoles]);

  const hasRole = useCallback((role: AppRole) => {
    return availableRoles.includes(role);
  }, [availableRoles]);

  const refreshRoles = useCallback(async () => {
    if (userId) {
      await fetchRoles(userId);
    }
  }, [userId, fetchRoles]);

  return (
    <RoleContext.Provider value={{ availableRoles, activeRole, setActiveRole, hasRole, loaded, userId, refreshRoles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
