import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROLE_CONFIG } from "@/lib/role-config";
import { Plus, X, Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";

type Role = "investor" | "intermediary" | "issuer" | "enabler";

interface SubTypeOption {
  value: string;
  label: string;
}

const investorSubTypes: SubTypeOption[] = [
  { value: "retail", label: "Retail Individual" },
  { value: "hni", label: "HNI / Ultra HNI" },
  { value: "institutional", label: "Institutional (FII/DII)" },
  { value: "nri", label: "NRI Investor" },
];

const intermediarySubTypes: SubTypeOption[] = [
  { value: "broker", label: "Broker" },
  { value: "ria", label: "Registered Investment Adviser (RIA)" },
  { value: "mfd", label: "Mutual Fund Distributor" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "research_analyst", label: "Research Analyst" },
  { value: "ca_cs", label: "CA / CS" },
];

const issuerSubTypes: SubTypeOption[] = [
  { value: "listed_company", label: "Listed Company" },
  { value: "amc", label: "Asset Management Company (AMC)" },
  { value: "nbfc", label: "NBFC" },
  { value: "insurance_company", label: "Insurance Company" },
  { value: "bank", label: "Bank" },
  { value: "government", label: "Government Entity" },
];

const enablerSubTypes: SubTypeOption[] = [
  { value: "kra", label: "KYC Registration Agency (KRA)" },
  { value: "depository", label: "Depository (CDSL/NSDL)" },
  { value: "rta", label: "Registrar & Transfer Agent (RTA)" },
  { value: "custodian", label: "Custodian" },
  { value: "pop", label: "Point of Presence (PoP)" },
  { value: "vault_manager", label: "Vault Manager" },
  { value: "asba_bank", label: "ASBA Bank" },
  { value: "esg_provider", label: "ESG Rating Provider" },
];

const getSubTypesForRole = (role: Role): SubTypeOption[] => {
  switch (role) {
    case "investor": return investorSubTypes;
    case "intermediary": return intermediarySubTypes;
    case "issuer": return issuerSubTypes;
    case "enabler": return enablerSubTypes;
  }
};

const ALL_ROLES: Role[] = ["investor", "intermediary", "issuer", "enabler"];

interface RoleRow {
  role: string;
  sub_type: string | null;
}

interface ManageRolesDialogProps {
  userId: string;
  currentRoles: RoleRow[];
  onRolesChanged?: () => void;
  trigger?: React.ReactNode;
}

export function ManageRolesDialog({ userId, currentRoles, onRolesChanged, trigger }: ManageRolesDialogProps) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<RoleRow[]>(currentRoles);
  const [adding, setAdding] = useState(false);
  const [newRole, setNewRole] = useState<Role | "">("");
  const [newSubType, setNewSubType] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const { availableRoles } = useRole();

  useEffect(() => {
    setRoles(currentRoles);
  }, [currentRoles]);

  const existingRoleNames = roles.filter(r => r.role !== "admin").map(r => r.role);
  const availableToAdd = ALL_ROLES.filter(r => !existingRoleNames.includes(r));

  const handleAddRole = async () => {
    if (!newRole || !newSubType) {
      toast.error("Please select both role and sub-type");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole as any, sub_type: newSubType });

      if (error) {
        if (error.code === "23505") {
          toast.error("You already have this role");
        } else {
          throw error;
        }
      } else {
        toast.success(`${ROLE_CONFIG[newRole]?.label || newRole} role added!`);
        setRoles(prev => [...prev, { role: newRole, sub_type: newSubType }]);
        setAdding(false);
        setNewRole("");
        setNewSubType("");
        onRolesChanged?.();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add role");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (role: string) => {
    // Don't allow removing last non-admin role
    const nonAdminRoles = roles.filter(r => r.role !== "admin");
    if (nonAdminRoles.length <= 1) {
      toast.error("You must have at least one role");
      return;
    }

    setRemoving(role);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;

      toast.success(`${ROLE_CONFIG[role]?.label || role} role removed`);
      setRoles(prev => prev.filter(r => r.role !== role));
      onRolesChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove role");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setAdding(false); setNewRole(""); setNewSubType(""); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <UserCog className="h-3.5 w-3.5" /> Manage Roles
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Manage Your Roles</DialogTitle>
          <DialogDescription>
            Add or remove roles to customize your findoo experience. Each role unlocks different features and visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Current Roles */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Roles</p>
            {roles.filter(r => r.role !== "admin").map((r) => {
              const conf = ROLE_CONFIG[r.role];
              const Icon = conf?.icon;
              const nonAdminCount = roles.filter(ro => ro.role !== "admin").length;
              return (
                <div key={r.role} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${conf?.bgColor || ""}`}>
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {conf?.label || r.role}
                    </span>
                    {r.sub_type && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {r.sub_type.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {nonAdminCount > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveRole(r.role)}
                      disabled={removing === r.role}
                    >
                      {removing === r.role ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
            {roles.some(r => r.role === "admin") && (
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2.5">
                <Badge variant="outline" className="text-xs gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Admin
                </Badge>
                <span className="text-xs text-muted-foreground">System role — cannot be modified</span>
              </div>
            )}
          </div>

          {/* Add Role Section */}
          {availableToAdd.length > 0 && !adding && (
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" /> Add a Role
            </Button>
          )}

          {adding && (
            <div className="space-y-3 rounded-lg border border-border p-3 bg-card">
              <p className="text-sm font-medium text-foreground">Add New Role</p>
              <Select value={newRole} onValueChange={(v) => { setNewRole(v as Role); setNewSubType(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((r) => {
                    const conf = ROLE_CONFIG[r];
                    const Icon = conf?.icon;
                    return (
                      <SelectItem key={r} value={r}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                          {conf?.label || r}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {newRole && (
                <Select value={newSubType} onValueChange={setNewSubType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sub-type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubTypesForRole(newRole as Role).map((st) => (
                      <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setAdding(false); setNewRole(""); setNewSubType(""); }}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1 gap-1.5" onClick={handleAddRole} disabled={saving || !newRole || !newSubType}>
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Add Role
                </Button>
              </div>
            </div>
          )}

          {availableToAdd.length === 0 && !adding && (
            <p className="text-xs text-muted-foreground text-center py-2">
              You have all available roles. No more roles to add.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
