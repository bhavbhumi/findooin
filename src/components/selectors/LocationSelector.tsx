import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X, Globe, Map } from "lucide-react";
import { searchLocations, type LocationEntry } from "@/data/locations";
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const LocationSelector = ({ value, onChange, placeholder = "Search city..." }: LocationSelectorProps) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<LocationEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (open) {
      setResults(searchLocations(query, 15));
    }
  }, [query, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (loc: LocationEntry) => {
    onChange(loc.label);
    setQuery(loc.label);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-8 pr-8 text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); onChange(""); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {results.map((loc, i) => {
            const Icon = loc.type === "country" ? Globe : loc.type === "state" ? Map : MapPin;
            return (
              <button
                key={i}
                onClick={() => handleSelect(loc)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent/10 transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">{loc.label}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{loc.type}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
