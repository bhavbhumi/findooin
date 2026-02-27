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
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<AppRole>("investor");
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setLoaded(true);
        return;
      }

      setUserId(session.user.id);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

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

      setLoaded(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setAvailableRoles([]);
        setActiveRoleState("investor");
        setUserId(null);
        setLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setActiveRole = useCallback((role: AppRole) => {
    if (availableRoles.includes(role)) {
      setActiveRoleState(role);
      localStorage.setItem(STORAGE_KEY, role);
    }
  }, [availableRoles]);

  const hasRole = useCallback((role: AppRole) => {
    return availableRoles.includes(role);
  }, [availableRoles]);

  return (
    <RoleContext.Provider value={{ availableRoles, activeRole, setActiveRole, hasRole, loaded, userId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
