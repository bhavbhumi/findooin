import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBulkCreateInvitations } from "@/hooks/useInvitations";

interface ParsedRow {
  target_name: string;
  target_email: string;
  target_phone?: string;
  target_role: string;
  valid: boolean;
  error?: string;
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [defaultRole, setDefaultRole] = useState("intermediary");
  const fileRef = useRef<HTMLInputElement>(null);
  const bulk = useBulkCreateInvitations();

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
    const emailIdx = header.findIndex((h) => h.includes("email"));
    const nameIdx = header.findIndex((h) => h.includes("name"));
    const phoneIdx = header.findIndex((h) => h.includes("phone"));
    const roleIdx = header.findIndex((h) => h.includes("role"));

    if (emailIdx === -1) return [];

    return lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const email = cols[emailIdx]?.trim().toLowerCase() || "";
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      return {
        target_name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
        target_email: email,
        target_phone: phoneIdx >= 0 ? cols[phoneIdx] || "" : "",
        target_role: roleIdx >= 0 && ["issuer", "intermediary"].includes(cols[roleIdx]?.toLowerCase()) ? cols[roleIdx].toLowerCase() : defaultRole,
        valid: isValidEmail,
        error: !isValidEmail ? "Invalid email" : undefined,
      } as ParsedRow;
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const handleImport = () => {
    if (validRows.length === 0) return;
    bulk.mutate(
      validRows.map((r) => ({
        target_name: r.target_name || null,
        target_email: r.target_email,
        target_phone: r.target_phone || null,
        target_role: r.target_role,
      })),
      {
        onSuccess: () => {
          onOpenChange(false);
          setRows([]);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Import Invitations</DialogTitle>
          <DialogDescription>Upload a CSV file with columns: name, email, phone, role</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Default Role</Label>
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intermediary">Intermediary</SelectItem>
                  <SelectItem value="issuer">Issuer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">CSV File</Label>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>

          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{rows.length} rows parsed</span>
                <Badge variant="default" className="text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />{validRows.length} valid
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertCircle className="h-3 w-3 mr-1" />{invalidRows.length} invalid
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-48 border rounded-md">
                <div className="p-2 space-y-1">
                  {rows.slice(0, 50).map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${r.valid ? "bg-muted/50" : "bg-destructive/10"}`}>
                      <span className="w-6 text-muted-foreground">{i + 1}</span>
                      <span className="flex-1 truncate">{r.target_name || "—"}</span>
                      <span className="flex-1 truncate font-mono">{r.target_email}</span>
                      <Badge variant="outline" className="text-[9px] shrink-0">{r.target_role}</Badge>
                      {!r.valid && <span className="text-destructive text-[10px]">{r.error}</span>}
                    </div>
                  ))}
                  {rows.length > 50 && (
                    <p className="text-xs text-muted-foreground text-center py-1">... and {rows.length - 50} more</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setRows([]); }}>Cancel</Button>
          <Button onClick={handleImport} disabled={validRows.length === 0 || bulk.isPending}>
            {bulk.isPending ? "Importing..." : `Import ${validRows.length} Invites`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
