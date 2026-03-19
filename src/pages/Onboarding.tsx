import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, UserCheck, BarChart3, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  Upload, ShieldCheck, File, X, Users, Smartphone,
} from "lucide-react";
import { uploadFile } from "@/lib/storage";
import { ContactImportDialog } from "@/components/network/ContactImportDialog";
import { LocationSelector } from "@/components/selectors/LocationSelector";
import { CertificationSelector } from "@/components/selectors/CertificationSelector";
...
  const [certifications, setCertifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
...
          certifications: certifications.length > 0 ? certifications : null,
          onboarding_completed: true,
...
                  <div className="space-y-2">
                    <Label>Certifications & Licenses <span className="text-muted-foreground">(optional)</span></Label>
                    <CertificationSelector value={certifications} onChange={setCertifications} />
                  </div>

                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground mb-2">Your roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                            role === "issuer"
                              ? "bg-issuer/10 text-issuer"
                              : role === "intermediary"
                              ? "bg-intermediary/10 text-intermediary"
                              : "bg-investor/10 text-investor"
                          }`}
                        >
                          {role === "investor" && <BarChart3 className="h-3 w-3" />}
                          {role === "intermediary" && <UserCheck className="h-3 w-3" />}
                          {role === "issuer" && <Building2 className="h-3 w-3" />}
                          <span className="capitalize">{role}</span>
                          {selectedSubTypes[role] && (
                            <span className="opacity-70">
                              — {getSubTypesForRole(role).find((s) => s.value === selectedSubTypes[role])?.label}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Invite Contacts CTA */}
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Find your contacts on FindOO</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Import your phone contacts to discover who's already here and invite your professional network.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setContactImportOpen(true)}>
                        <Upload className="h-3.5 w-3.5" />
                        Import Contacts
                      </Button>
                      {contactsImported > 0 && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {contactsImported} imported
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ContactImportDialog
                  open={contactImportOpen}
                  onOpenChange={setContactImportOpen}
                  onImportComplete={(count) => setContactsImported((prev) => prev + count)}
                />
              </div>
            )}

            {/* Step 5: Verification nudge (Issuers & Intermediaries only) */}
            {step === 5 && (
              <div>
                <div className="flex items-center justify-center mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold font-heading text-foreground mb-2 text-center">
                  Get verified on FindOO
                </h1>
                <p className="text-muted-foreground mb-8 text-center">
                  Verified profiles earn more trust and visibility. Upload your regulatory registration certificate to get started.
                </p>

                <div className="space-y-4">
                  {selectedRoles.filter((r) => r !== "investor").map((role) => (
                    <div key={role} className="rounded-xl border-2 border-dashed border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        {role === "issuer" ? (
                          <Building2 className="h-5 w-5 text-issuer" />
                        ) : (
                          <UserCheck className="h-5 w-5 text-intermediary" />
                        )}
                        <div>
                          <h3 className="font-semibold font-heading text-foreground capitalize">{role} Verification</h3>
                          <p className="text-xs text-muted-foreground">
                            {role === "issuer"
                              ? "SEBI / RBI / IRDAI registration certificate"
                              : "SEBI RIA / AMFI / IRDAI / ICAI registration"}
                          </p>
                        </div>
                      </div>
                      {verificationFiles[role] ? (
                        <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
                          <File className="h-4 w-4 text-accent shrink-0" />
                          <span className="text-xs text-foreground truncate flex-1">{verificationFiles[role]!.name}</span>
                          <span className="text-[10px] text-muted-foreground">{(verificationFiles[role]!.size / 1024 / 1024).toFixed(1)}MB</span>
                          <button onClick={() => setVerificationFiles(prev => ({ ...prev, [role]: null }))} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center rounded-lg bg-muted/50 border border-border h-24 cursor-pointer hover:bg-muted transition-colors">
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" });
                                  return;
                                }
                                setVerificationFiles(prev => ({ ...prev, [role]: file }));
                              }
                              e.target.value = "";
                            }}
                          />
                          <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <Upload className="h-5 w-5" />
                            <span className="text-xs">Upload certificate (PDF / Image)</span>
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  Upload your verification documents to earn a verified badge. You can also upload later from your profile settings. Verification is reviewed manually and usually takes 1–2 business days.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : step === 4 && needsVerification(selectedRoles) ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {step === 5 && (
                <Button variant="ghost" onClick={handleComplete} disabled={loading}>
                  Skip for now
                </Button>
              )}
              <Button onClick={handleNext} disabled={loading || !canProceed()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 5 ? "Submit & Verify" : "Launch FindOO"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
