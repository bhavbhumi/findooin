import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Check, Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateFeature, useFeatureDuplicateSearch, type FeatureCategory } from "@/hooks/useFeedback";
import { useRole } from "@/contexts/RoleContext";

const STEPS = ["Title", "Description", "Impact", "Regulatory", "Review"];

const IMPACT_TAGS = [
  { value: "save_time", label: "Save Time" },
  { value: "increase_revenue", label: "Increase Revenue" },
  { value: "improve_compliance", label: "Improve Compliance" },
  { value: "better_discovery", label: "Better Discovery" },
];

const BENEFICIARY_OPTIONS = [
  { value: "investor", label: "Investors" },
  { value: "intermediary", label: "Intermediaries" },
  { value: "issuer", label: "Issuers" },
  { value: "enabler", label: "Enablers" },
  { value: "all", label: "All" },
];

const CATEGORY_OPTIONS: { value: FeatureCategory; label: string }[] = [
  { value: "ui_ux", label: "UI/UX" },
  { value: "investment", label: "Investment" },
  { value: "insurance", label: "Insurance" },
  { value: "compliance", label: "Compliance" },
  { value: "community", label: "Community" },
  { value: "data", label: "Data" },
  { value: "jobs", label: "Jobs" },
];

interface SubmitFeatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitFeatureModal({ open, onOpenChange }: SubmitFeatureModalProps) {
  const [step, setStep] = useState(0);
  const { activeRole } = useRole();
  const createFeature = useCreateFeature();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeatureCategory>("ui_ux");
  const [description, setDescription] = useState("");
  const [workaround, setWorkaround] = useState("");
  const [impactTags, setImpactTags] = useState<string[]>([]);
  const [isRegulatory, setIsRegulatory] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Duplicate search
  const { data: duplicates } = useFeatureDuplicateSearch(title);

  const resetForm = () => {
    setStep(0);
    setTitle("");
    setCategory("ui_ux");
    setDescription("");
    setWorkaround("");
    setImpactTags([]);
    setIsRegulatory(false);
    setBeneficiaries([]);
    setIsAnonymous(false);
    setSubmitted(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return title.trim().length >= 5;
      case 1: return description.trim().length >= 10 && workaround.trim().length >= 5;
      case 2: return impactTags.length >= 1;
      case 3: return beneficiaries.length >= 1;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    await createFeature.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      workaround: workaround.trim(),
      impact_tags: impactTags,
      is_regulatory: isRegulatory,
      beneficiary_roles: beneficiaries,
      is_anonymous: isAnonymous,
      category,
    });
    setSubmitted(true);
  };

  const toggleImpactTag = (tag: string) => {
    setImpactTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleBeneficiary = (val: string) => {
    if (val === "all") {
      setBeneficiaries(prev => prev.includes("all") ? [] : ["all"]);
    } else {
      setBeneficiaries(prev => {
        const next = prev.filter(v => v !== "all");
        return next.includes(val) ? next.filter(v => v !== val) : [...next, val];
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" aria-describedby="submit-feature-desc">
        <DialogHeader>
          <DialogTitle className="text-base">Suggest a Feature</DialogTitle>
          <p id="submit-feature-desc" className="sr-only">A 5-step form to submit a feature request for findoo</p>

        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Your request is live!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              You'll be notified when its status changes.
            </p>
            <Button variant="outline" size="sm" onClick={() => handleClose(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between">
                {STEPS.map((s, i) => (
                  <span key={s} className={cn(
                    "text-[10px] font-medium",
                    i === step ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s}
                  </span>
                ))}
              </div>
              <Progress value={((step + 1) / STEPS.length) * 100} className="h-1" />
            </div>

            {/* Step 1: Title */}
            {step === 0 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Feature title</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Portfolio tracking dashboard"
                    className="h-9 text-sm"
                    maxLength={100}
                  />
                  <p className="text-[10px] text-muted-foreground text-right">{title.length}/100</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={v => setCategory(v as FeatureCategory)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => (
                        <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duplicate detection */}
                {duplicates && duplicates.length > 0 && (
                  <div className="rounded-md border border-warning/20 bg-warning/5 p-3 space-y-2">
                    <p className="text-xs font-medium text-warning flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Similar requests found
                    </p>
                    {duplicates.map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between text-xs">
                        <span className="text-foreground truncate mr-2">{d.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[9px]">{d.status?.replace("_", " ")}</Badge>
                          <span className="text-muted-foreground tabular-nums">{Number(d.priority_score).toFixed(0)} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Description */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value.slice(0, 300))}
                    placeholder="Describe the feature you'd like to see..."
                    className="min-h-[80px] text-sm resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground text-right">{description.length}/300</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">How do you handle this today? <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={workaround}
                    onChange={e => setWorkaround(e.target.value.slice(0, 200))}
                    placeholder="Your current workaround..."
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Impact */}
            {step === 2 && (
              <div className="space-y-3">
                <Label className="text-xs">What impact will this have? <span className="text-muted-foreground">(select at least one)</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  {IMPACT_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => toggleImpactTag(tag.value)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-xs font-medium transition-all text-left",
                        impactTags.includes(tag.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Regulatory + Beneficiaries */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Requires regulatory approval?</Label>
                    <p className="text-[10px] text-muted-foreground">SEBI / RBI / IRDAI compliance flag</p>
                  </div>
                  <Switch checked={isRegulatory} onCheckedChange={setIsRegulatory} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Who benefits? <span className="text-muted-foreground">(select at least one)</span></Label>
                  <div className="space-y-1.5">
                    {BENEFICIARY_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={beneficiaries.includes(opt.value)}
                          onCheckedChange={() => toggleBeneficiary(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Post as</Label>
                  <RadioGroup value={isAnonymous ? "anon" : "public"} onValueChange={v => setIsAnonymous(v === "anon")}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="text-xs cursor-pointer">Verified identity</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="anon" id="anon" />
                      <Label htmlFor="anon" className="text-xs cursor-pointer">Anonymous (role still visible)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                  <h4 className="text-xs font-semibold text-foreground">Summary</h4>
                  <div className="grid grid-cols-[80px_1fr] gap-y-1 text-xs">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="text-foreground">{title}</span>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground">{CATEGORY_OPTIONS.find(c => c.value === category)?.label}</span>
                    <span className="text-muted-foreground">Impact:</span>
                    <span className="text-foreground">{impactTags.map(t => IMPACT_TAGS.find(it => it.value === t)?.label).join(", ")}</span>
                    <span className="text-muted-foreground">Regulatory:</span>
                    <span className="text-foreground">{isRegulatory ? "Yes" : "No"}</span>
                    <span className="text-muted-foreground">Role:</span>
                    <span className="text-foreground capitalize">{activeRole}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="gap-1 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={createFeature.isPending}
                  className="gap-1 text-xs"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {createFeature.isPending ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
