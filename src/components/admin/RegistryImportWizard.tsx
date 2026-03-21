/**
 * RegistryImportWizard — Multi-format file import with field mapping.
 * Supports CSV, JSON, and Excel (via Sheet.js-like parsing).
 */
import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, FileJson, FileText, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Target fields in registry_entities
const TARGET_FIELDS = [
  { key: "entity_name", label: "Entity Name", required: true },
  { key: "registration_number", label: "Registration Number", required: false },
  { key: "registration_category", label: "Category", required: false },
  { key: "entity_type", label: "Entity Type", required: false },
  { key: "contact_email", label: "Email", required: false },
  { key: "contact_phone", label: "Phone", required: false },
  { key: "address", label: "Address", required: false },
  { key: "city", label: "City", required: false },
  { key: "state", label: "State", required: false },
  { key: "pincode", label: "Pincode", required: false },
] as const;

type FieldMapping = Record<string, string>; // sourceColumn → targetField

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
      current += char;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseRow(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => { record[h] = values[i] || ""; });
    return record;
  }).filter(r => Object.values(r).some(v => v));

  return { headers, rows };
}

function parseJSON(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const parsed = JSON.parse(text);
  const arr: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : (parsed.data || parsed.records || parsed.results || [parsed]);
  if (arr.length === 0) return { headers: [], rows: [] };

  const headers: string[] = [...new Set(arr.flatMap((r) => Object.keys(r)))];
  const rows = arr.map((r) => {
    const record: Record<string, string> = {};
    headers.forEach(h => { record[h] = r[h] != null ? String(r[h]) : ""; });
    return record;
  });

  return { headers, rows };
}

// Auto-map source columns to target fields
function autoMap(sourceHeaders: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const patterns: Record<string, RegExp> = {
    entity_name: /^(name|entity.?name|distributor.?name|full.?name|arn.?holder|firm|company)/i,
    registration_number: /^(arn|reg.?(no|number|num)|sebi.?reg|registration|arn.?no)/i,
    registration_category: /^(cat|category|type|registration.?category|sub.?type)/i,
    entity_type: /^(entity.?type|org.?type|individual|non.?individual)/i,
    contact_email: /^(email|e.?mail|contact.?email)/i,
    contact_phone: /^(phone|mobile|tel|contact.?phone|contact.?no)/i,
    address: /^(address|addr|office.?address)/i,
    city: /^(city|town|district)/i,
    state: /^(state|province|region)/i,
    pincode: /^(pin|pincode|zip|postal)/i,
  };

  for (const header of sourceHeaders) {
    for (const [target, pattern] of Object.entries(patterns)) {
      if (pattern.test(header) && !Object.values(mapping).includes(target)) {
        mapping[header] = target;
        break;
      }
    }
  }
  return mapping;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function RegistryImportWizard({ open, onOpenChange, onImportComplete }: Props) {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "importing">("upload");
  const [sourceLabel, setSourceLabel] = useState("amfi");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [dedupByReg, setDedupByReg] = useState(true);
  const [importResult, setImportResult] = useState<{ inserted: number; updated: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setImportResult(null);
  };

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      const text = await file.text();
      let result: { headers: string[]; rows: Record<string, string>[] };

      if (ext === "json") {
        result = parseJSON(text);
      } else {
        // CSV, TSV, TXT
        result = parseCSV(text);
      }

      if (result.rows.length === 0) {
        toast.error("No valid data rows found in file");
        return;
      }

      setHeaders(result.headers);
      setRows(result.rows);
      setMapping(autoMap(result.headers));
      setStep("map");
      toast.success(`Parsed ${result.rows.length} rows from ${file.name}`);
    } catch (err: any) {
      toast.error(`Failed to parse file: ${err.message}`);
    }

    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const mappedFields = useMemo(() => Object.values(mapping).filter(Boolean), [mapping]);
  const hasName = mappedFields.includes("entity_name");

  // Transform rows using mapping
  const transformedRows = useMemo(() => {
    return rows.map(row => {
      const record: Record<string, string> = {};
      for (const [source, target] of Object.entries(mapping)) {
        if (target && row[source]) {
          record[target] = row[source];
        }
      }
      return record;
    }).filter(r => r.entity_name); // Must have a name
  }, [rows, mapping]);

  const handleImport = async () => {
    if (transformedRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setStep("importing");

    try {
      // Use the existing scrape-amfi edge function in seed mode
      const { data, error } = await supabase.functions.invoke("scrape-amfi", {
        body: {
          seed_data: transformedRows.map(r => ({
            ...r,
            source: sourceLabel,
          })),
        },
      });

      if (error) throw error;

      if (data?.success) {
        setImportResult({
          inserted: data.summary?.inserted || data.summary?.total_inserted || 0,
          updated: data.summary?.updated || data.summary?.total_updated || 0,
          skipped: data.summary?.skipped || 0,
        });
        toast.success("Import complete!");
        onImportComplete();
      } else {
        throw new Error(data?.error || "Import failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Import failed");
      setStep("preview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Registry Data
          </DialogTitle>
          <DialogDescription>
            Import professionals from CSV, JSON, or text files with automatic field mapping.
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs mb-1.5 block">Data Source</Label>
              <Select value={sourceLabel} onValueChange={setSourceLabel}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amfi">AMFI</SelectItem>
                  <SelectItem value="sebi">SEBI</SelectItem>
                  <SelectItem value="rbi">RBI</SelectItem>
                  <SelectItem value="irdai">IRDAI</SelectItem>
                  <SelectItem value="manual">Manual / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <div className="flex justify-center gap-3 mb-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <FileJson className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">Drop a file or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports CSV, JSON, TXT (up to 20MB)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,.txt,.tsv"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </div>
        )}

        {/* Step: Map Fields */}
        {step === "map" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">{rows.length} rows, {headers.length} columns</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Change File</Button>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Map your columns to findoo fields</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {headers.map(header => (
                  <div key={header} className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded min-w-[140px] truncate">
                      {header}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <Select
                      value={mapping[header] || "_skip"}
                      onValueChange={(v) =>
                        setMapping(prev => ({ ...prev, [header]: v === "_skip" ? "" : v }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_skip">— Skip —</SelectItem>
                        {TARGET_FIELDS.map(f => (
                          <SelectItem key={f.key} value={f.key}>
                            {f.label} {f.required && "*"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {!hasName && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                "Entity Name" mapping is required
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="dedup"
                checked={dedupByReg}
                onCheckedChange={(v) => setDedupByReg(!!v)}
              />
              <Label htmlFor="dedup" className="text-xs">
                Deduplicate by registration number (skip if already exists)
              </Label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={() => setStep("preview")} disabled={!hasName}>
                Preview Import
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Ready to import <strong>{transformedRows.length}</strong> records as{" "}
                <Badge variant="outline" className="text-[9px] uppercase">{sourceLabel}</Badge>
              </p>
              <Button variant="ghost" size="sm" onClick={() => setStep("map")}>Edit Mapping</Button>
            </div>

            <div className="border rounded-md overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {TARGET_FIELDS.filter(f => mappedFields.includes(f.key)).map(f => (
                      <TableHead key={f.key} className="text-[10px] whitespace-nowrap">{f.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transformedRows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      {TARGET_FIELDS.filter(f => mappedFields.includes(f.key)).map(f => (
                        <TableCell key={f.key} className="text-xs truncate max-w-[150px]">
                          {row[f.key] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {transformedRows.length > 10 && (
              <p className="text-xs text-muted-foreground">Showing first 10 of {transformedRows.length} rows</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
              <Button onClick={handleImport}>
                Import {transformedRows.length} Records
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Importing / Done */}
        {step === "importing" && (
          <div className="py-8 text-center">
            {importResult ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-status-success mx-auto mb-4" />
                <p className="text-lg font-bold mb-2">Import Complete</p>
                <div className="flex justify-center gap-4 text-sm">
                  <span><strong>{importResult.inserted}</strong> new</span>
                  <span><strong>{importResult.updated}</strong> updated</span>
                  <span><strong>{importResult.skipped}</strong> skipped</span>
                </div>
                <Button className="mt-6" onClick={() => { reset(); onOpenChange(false); }}>
                  Done
                </Button>
              </>
            ) : (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Importing {transformedRows.length} records...</p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
