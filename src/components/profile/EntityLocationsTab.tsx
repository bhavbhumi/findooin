import { useState } from "react";
import { useEntityLocations, type EntityLocation } from "@/hooks/useTeamAffiliations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Plus, Building2, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EntityLocationsTabProps {
  entityProfileId: string;
  isEntityAdmin: boolean;
}

export function EntityLocationsTab({ entityProfileId, isEntityAdmin }: EntityLocationsTabProps) {
  const { data, isLoading } = useEntityLocations(entityProfileId);
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ label: "", address: "", city: "", state: "", pincode: "", is_headquarters: false });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.label.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("entity_locations").insert({
      entity_profile_id: entityProfileId,
      label: form.label.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      pincode: form.pincode.trim() || null,
      is_headquarters: form.is_headquarters,
    });
    setSaving(false);
    if (error) { toast.error("Failed to add location"); return; }
    toast.success("Location added");
    setAddOpen(false);
    setForm({ label: "", address: "", city: "", state: "", pincode: "", is_headquarters: false });
    qc.invalidateQueries({ queryKey: ["entity-locations", entityProfileId] });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const { custom = [], registry = [] } = data || {};
  const hasAny = custom.length > 0 || registry.length > 0;

  // Deduplicate registry by unique address
  const registryUnique = registry.reduce((acc: any[], r: any) => {
    const key = `${r.address || ""}_${r.city || ""}_${r.pincode || ""}`.toLowerCase();
    if (!acc.find((a: any) => `${a.address || ""}_${a.city || ""}_${a.pincode || ""}`.toLowerCase() === key)) {
      acc.push(r);
    }
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Locations</h3>
        </div>
        {isEntityAdmin && (
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Location
          </Button>
        )}
      </div>

      {!hasAny ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">No locations listed</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Custom locations first */}
          {custom.map((loc: EntityLocation) => (
            <LocationCard key={loc.id} label={loc.label} address={loc.address} city={loc.city} state={loc.state} pincode={loc.pincode} isHQ={loc.is_headquarters} source="custom" />
          ))}
          {/* Registry locations */}
          {registryUnique.map((r: any) => (
            <LocationCard
              key={r.id}
              label={r.registration_category || "Registered Office"}
              address={r.address}
              city={r.city}
              state={r.state}
              pincode={r.pincode}
              isHQ={false}
              source={r.source}
            />
          ))}
        </div>
      )}

      {/* Add location dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Office Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Label *</Label>
              <Input placeholder="e.g. Head Office - Mumbai" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.is_headquarters} onCheckedChange={(c) => setForm({ ...form, is_headquarters: !!c })} />
                  Headquarters
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.label.trim() || saving}>
              {saving ? "Saving..." : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LocationCard({ label, address, city, state, pincode, isHQ, source }: {
  label: string; address: string | null; city: string | null; state: string | null; pincode: string | null; isHQ: boolean; source: string;
}) {
  const parts = [address, city, state, pincode].filter(Boolean).join(", ");
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        {isHQ ? <Building2 className="h-4 w-4 text-primary shrink-0" /> : <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />}
        <span className="text-sm font-medium text-foreground">{label}</span>
        {isHQ && <Badge variant="default" className="text-[10px] h-5">HQ</Badge>}
        {source !== "custom" && (
          <Badge variant="outline" className="text-[10px] h-5 ml-auto">
            <Globe className="h-2.5 w-2.5 mr-1" /> {source.toUpperCase()}
          </Badge>
        )}
      </div>
      {parts && <p className="text-xs text-muted-foreground pl-6">{parts}</p>}
    </div>
  );
}
