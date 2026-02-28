import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Database } from "lucide-react";
import { useRegistryEntities, useBulkCreateInvitations } from "@/hooks/useInvitations";

interface RegistryImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistryImportDialog({ open, onOpenChange }: RegistryImportDialogProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: entities = [], isLoading } = useRegistryEntities(search);
  const bulk = useBulkCreateInvitations();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === entities.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entities.map((e) => e.id)));
    }
  };

  const handleImport = () => {
    const selectedEntities = entities.filter((e) => selected.has(e.id) && e.contact_email);
    if (selectedEntities.length === 0) return;

    bulk.mutate(
      selectedEntities.map((e) => ({
        target_name: e.entity_name,
        target_email: e.contact_email!,
        target_phone: e.contact_phone || null,
        target_role: e.entity_type === "issuer" ? "issuer" : "intermediary",
        registry_entity_id: e.id,
        notes: e.registration_number ? `Reg: ${e.registration_number}` : null,
      })),
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelected(new Set());
          setSearch("");
        },
      }
    );
  };

  const selectedWithEmail = entities.filter((e) => selected.has(e.id) && e.contact_email).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Import from Registry
          </DialogTitle>
          <DialogDescription>Select entities from the registry to create invitations. Only entities with email addresses can be invited.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, registration number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={toggleAll}>
              {selected.size === entities.length && entities.length > 0 ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-xs text-muted-foreground">{selected.size} selected ({selectedWithEmail} with email)</span>
          </div>

          <ScrollArea className="h-64 border rounded-md">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : entities.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {search ? "No entities found" : "No unmatched registry entities available"}
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {entities.map((entity) => (
                  <div
                    key={entity.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      selected.has(entity.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => toggle(entity.id)}
                  >
                    <Checkbox checked={selected.has(entity.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entity.entity_name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {entity.contact_email ? (
                          <span className="truncate">{entity.contact_email}</span>
                        ) : (
                          <span className="text-destructive">No email</span>
                        )}
                        {entity.registration_number && (
                          <span className="font-mono">#{entity.registration_number}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-[9px]">{entity.source}</Badge>
                      {entity.entity_type && (
                        <Badge variant="secondary" className="text-[9px]">{entity.entity_type}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setSelected(new Set()); }}>Cancel</Button>
          <Button onClick={handleImport} disabled={selectedWithEmail === 0 || bulk.isPending}>
            {bulk.isPending ? "Importing..." : `Import ${selectedWithEmail} Invites`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
