import { useState, useRef, useEffect } from "react";
import { Languages as LanguagesIcon, Search, X, Star, ChevronDown } from "lucide-react";
import { searchLanguages, PROFICIENCY_LEVELS, type LanguageEntry, type UserLanguage, type LanguageProficiency } from "@/data/languages";
import { Input } from "@/components/ui/input";

interface LanguageSelectorProps {
  value: UserLanguage[];
  onChange: (value: UserLanguage[]) => void;
}

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const results = searchLanguages(query).filter((l) => !value.some((v) => v.code === l.code));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addLanguage = (lang: LanguageEntry) => {
    onChange([
      ...value,
      { code: lang.code, name: lang.name, proficiency: "conversational", isMotherTongue: false },
    ]);
    setQuery("");
    setOpen(false);
  };

  const removeLanguage = (code: string) => {
    onChange(value.filter((v) => v.code !== code));
  };

  const updateProficiency = (code: string, proficiency: LanguageProficiency) => {
    onChange(value.map((v) => (v.code === code ? { ...v, proficiency } : v)));
  };

  const toggleMotherTongue = (code: string) => {
    onChange(
      value.map((v) => ({
        ...v,
        isMotherTongue: v.code === code ? !v.isMotherTongue : false, // only one mother tongue
      }))
    );
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Selected languages with proficiency */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((lang) => (
            <div key={lang.code} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <LanguagesIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium flex-1 min-w-0">{lang.name}</span>

              {/* Mother tongue toggle */}
              <button
                onClick={() => toggleMotherTongue(lang.code)}
                title={lang.isMotherTongue ? "Mother tongue" : "Set as mother tongue"}
                className={`h-6 px-1.5 rounded text-[10px] flex items-center gap-0.5 transition-colors ${
                  lang.isMotherTongue
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className={`h-3 w-3 ${lang.isMotherTongue ? "fill-current" : ""}`} />
                {lang.isMotherTongue && <span>Mother tongue</span>}
              </button>

              {/* Proficiency dropdown */}
              <div className="relative">
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateProficiency(lang.code, e.target.value as LanguageProficiency)}
                  className="appearance-none bg-background border border-border rounded px-2 py-1 pr-6 text-[11px] text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PROFICIENCY_LEVELS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              {/* Remove */}
              <button onClick={() => removeLanguage(lang.code)} className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search to add */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Add a language..."
          className="pl-8 text-sm"
        />
      </div>

      {open && results.length > 0 && (
        <div className="border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto bg-popover">
          {results.slice(0, 20).map((lang) => (
            <button
              key={lang.code}
              onClick={() => addLanguage(lang)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent/10 transition-colors"
            >
              <LanguagesIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
              <span className="text-[10px] text-muted-foreground ml-auto capitalize">{lang.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
