/**
 * ContactImportDialog — Reusable dialog for importing phone contacts.
 * Supports: Contact Picker API (mobile Chrome), manual entry, CSV upload.
 * Capacitor-ready: abstraction layer for native contacts plugin.
 */
import { useState, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Smartphone, FileText, Keyboard, Upload, Users, CheckCircle2, Loader2, X, AlertCircle,
} from "lucide-react";
import { useContacts, type ContactInput } from "@/hooks/useContacts";

interface ContactImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (count: number) => void;
}

/** Check if the browser supports the Contact Picker API */
function hasContactPicker(): boolean {
  return "contacts" in navigator && "ContactsManager" in window;
}

/** Parse CSV/text input into contacts */
function parseTextContacts(text: string): ContactInput[] {
  const lines = text.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    // Try to extract name and phone: "Name - 9876543210" or just "9876543210"
    const parts = line.split(/[-–—|:]+/).map((p) => p.trim());
    if (parts.length >= 2) {
      const hasDigits = (s: string) => /\d{7,}/.test(s.replace(/\D/g, ""));
      if (hasDigits(parts[1])) return { name: parts[0], phone: parts[1] };
      if (hasDigits(parts[0])) return { name: parts[1], phone: parts[0] };
    }
    // Just a phone number
    return { phone: line.replace(/[^\d+\s()-]/g, "") };
  }).filter((c) => c.phone.replace(/\D/g, "").length >= 7);
}

export function ContactImportDialog({ open, onOpenChange, onImportComplete }: ContactImportDialogProps) {
  const { importContacts } = useContacts();
  const [tab, setTab] = useState<string>(hasContactPicker() ? "phone" : "manual");
  const [manualText, setManualText] = useState("");
  const [preview, setPreview] = useState<ContactInput[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhonePicker = useCallback(async () => {
    try {
      // Contact Picker API (Chrome Android 80+)
      const nav = navigator as any;
      const contacts = await nav.contacts.select(["name", "tel"], { multiple: true });
      const parsed: ContactInput[] = contacts
        .filter((c: any) => c.tel && c.tel.length > 0)
        .map((c: any) => ({
          name: c.name?.[0] || "",
          phone: c.tel[0],
        }));
      setPreview(parsed);
      if (parsed.length === 0) {
        toast.info("No contacts with phone numbers were selected.");
      }
    } catch (err: any) {
      if (err.name !== "InvalidStateError" && err.name !== "NotAllowedError") {
        toast.error("Could not access contacts. Try manual entry instead.");
      }
    }
  }, []);

  const handleManualParse = useCallback(() => {
    const parsed = parseTextContacts(manualText);
    setPreview(parsed);
    if (parsed.length === 0 && manualText.trim()) {
      toast.error("No valid phone numbers found. Enter one per line.");
    }
  }, [manualText]);

  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Max 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseTextContacts(text);
      setPreview(parsed);
      toast.success(`Found ${parsed.length} contacts in file.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      await importContacts.mutateAsync(preview);
      toast.success(`${preview.length} contacts imported successfully!`);
      onImportComplete?.(preview.length);
      setPreview([]);
      setManualText("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to import contacts.");
    } finally {
      setImporting(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            Add your phone contacts to find people on FindOO and invite others to join.
          </DialogDescription>
        </DialogHeader>

        {preview.length === 0 ? (
          <Tabs value={tab} onValueChange={setTab} className="flex-1">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="phone" disabled={!hasContactPicker()} className="text-xs gap-1">
                <Smartphone className="h-3 w-3" /> Phone
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs gap-1">
                <Keyboard className="h-3 w-3" /> Type
              </TabsTrigger>
              <TabsTrigger value="csv" className="text-xs gap-1">
                <FileText className="h-3 w-3" /> File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="mt-4 space-y-4">
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Access Phone Contacts</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select contacts from your phone. Only names and numbers are read — nothing is shared without your action.
                  </p>
                </div>
                <Button onClick={handlePhonePicker} className="gap-2">
                  <Users className="h-4 w-4" />
                  Select Contacts
                </Button>
              </div>
              {!hasContactPicker() && (
                <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Contact Picker requires Chrome on Android. Use "Type" or "File" tabs for other devices.</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Enter phone numbers — one per line. Optionally add names: <code className="text-[10px] bg-muted px-1 rounded">Name - 9876543210</code>
                </p>
                <Textarea
                  placeholder={"Rahul Mehta - 9876543210\nPreeti Sharma - 8765432109\n7654321098"}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={6}
                  className="text-sm font-mono"
                />
              </div>
              <Button onClick={handleManualParse} disabled={!manualText.trim()} className="w-full gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Parse {manualText.split("\n").filter(Boolean).length} entries
              </Button>
            </TabsContent>

            <TabsContent value="csv" className="mt-4 space-y-4">
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload Contact File</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV or TXT file with phone numbers. One per line or comma-separated.
                  </p>
                </div>
                <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Choose File
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  className="hidden"
                  onChange={handleCSVUpload}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* Preview imported contacts */
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                {preview.length} contacts ready to import
              </p>
              <Button variant="ghost" size="sm" onClick={() => setPreview([])}>
                Clear
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] pr-1">
              {preview.map((contact, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    {contact.name && (
                      <p className="text-xs font-medium truncate">{contact.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">{contact.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemovePreview(i)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {preview.length > 0 && (
            <Button onClick={handleImport} disabled={importing} className="w-full gap-2">
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import {preview.length} Contacts
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
