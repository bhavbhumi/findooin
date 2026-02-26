import { useState, useRef, useEffect } from "react";
import { GraduationCap, Search, X, Check } from "lucide-react";
import { searchCertifications, getCertificationsByCategory, type CertificationEntry } from "@/data/certifications";
import { Input } from "@/components/ui/input";

interface CertificationSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const CertificationSelector = ({ value, onChange }: CertificationSelectorProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? searchCertifications(query)
    : getCertificationsByCategory();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleCert = (cert: CertificationEntry) => {
    if (value.includes(cert.name)) {
      onChange(value.filter((v) => v !== cert.name));
    } else {
      onChange([...value, cert.name]);
    }
  };

  const renderList = () => {
    if (Array.isArray(results)) {
      // Search results (flat list)
      return (results as CertificationEntry[]).map((cert) => (
        <CertRow key={cert.id} cert={cert} selected={value.includes(cert.name)} onToggle={toggleCert} />
      ));
    }
    // Grouped by category
    const grouped = results as Record<string, CertificationEntry[]>;
    return Object.entries(grouped).map(([cat, certs]) => (
      <div key={cat}>
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/50 sticky top-0">
          {cat}
        </div>
        {certs.map((cert) => (
          <CertRow key={cert.id} cert={cert} selected={value.includes(cert.name)} onToggle={toggleCert} />
        ))}
      </div>
    ));
  };

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((name, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2.5 py-1">
              <GraduationCap className="h-3 w-3 text-muted-foreground" />
              {name}
              <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search certifications (e.g. CFA, NISM, SEBI)..."
          className="pl-8 text-sm"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto bg-popover">
          {renderList()}
        </div>
      )}
    </div>
  );
};

const CertRow = ({ cert, selected, onToggle }: { cert: CertificationEntry; selected: boolean; onToggle: (c: CertificationEntry) => void }) => (
  <button
    onClick={() => onToggle(cert)}
    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent/10 transition-colors ${selected ? "bg-accent/5" : ""}`}
  >
    <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-accent border-accent text-accent-foreground" : "border-border"}`}>
      {selected && <Check className="h-3 w-3" />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium truncate">{cert.name}</p>
      <p className="text-[10px] text-muted-foreground">{cert.issuingBody}</p>
    </div>
    <span className="text-[10px] text-muted-foreground shrink-0">{cert.shortName}</span>
  </button>
);
