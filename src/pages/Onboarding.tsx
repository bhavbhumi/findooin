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

type UserType = "individual" | "entity";
type Role = "investor" | "intermediary" | "issuer" | "enabler";

interface SubTypeOption {
  value: string;
  label: string;
}

const investorSubTypes: SubTypeOption[] = [
  { value: "retail", label: "Retail Individual" },
  { value: "hni", label: "HNI / Ultra HNI" },
  { value: "institutional", label: "Institutional (FII/DII)" },
  { value: "nri", label: "NRI Investor" },
];

const intermediarySubTypes: SubTypeOption[] = [
  { value: "broker", label: "Broker" },
  { value: "ria", label: "Registered Investment Adviser (RIA)" },
  { value: "mfd", label: "Mutual Fund Distributor" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "research_analyst", label: "Research Analyst" },
  { value: "ca_cs", label: "CA / CS" },
];

const issuerSubTypes: SubTypeOption[] = [
  { value: "listed_company", label: "Listed Company" },
  { value: "amc", label: "Asset Management Company (AMC)" },
  { value: "nbfc", label: "NBFC" },
  { value: "insurance_company", label: "Insurance Company" },
  { value: "bank", label: "Bank" },
  { value: "government", label: "Government Entity" },
];

const getSubTypesForRole = (role: Role): SubTypeOption[] => {
  switch (role) {
    case "investor": return investorSubTypes;
    case "intermediary": return intermediarySubTypes;
    case "issuer": return issuerSubTypes;
  }
};

const needsVerification = (roles: Role[]) =>
  roles.includes("issuer") || roles.includes("intermediary");

const TOTAL_STEPS = 5; // Step 5 = verification nudge (conditional)

const Onboarding = () => {
  usePageMeta({ title: "Onboarding", description: "Complete your findoo profile setup.", path: "/onboarding" });
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(["investor"]);
  const [selectedSubTypes, setSelectedSubTypes] = useState<Record<Role, string>>({
    investor: "",
    intermediary: "",
    issuer: "",
  });
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [verificationFiles, setVerificationFiles] = useState<Record<string, File | null>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [contactImportOpen, setContactImportOpen] = useState(false);
  const [contactsImported, setContactsImported] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check auth + guard against re-onboarding (with retry for DB timeouts)
  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    const MAX_RETRIES = 3;

    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        if (!session) {
          navigate("/auth", { replace: true });
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        if (cancelled) return;

        // On DB error, retry instead of showing blank page
        if (error) {
          console.warn("Onboarding profile check failed:", error.message);
          if (retries < MAX_RETRIES) {
            retries++;
            setTimeout(check, 1500);
            return;
          }
          // After retries, proceed to onboarding (user can complete it)
        }

        if (profile?.onboarding_completed) {
          navigate("/feed", { replace: true });
          return;
        }

        setUserId(session.user.id);
        setDisplayName(session.user.user_metadata?.full_name || "");
        setInitialLoading(false);
      } catch (err) {
        console.error("Onboarding session check failed:", err);
        if (!cancelled && retries < MAX_RETRIES) {
          retries++;
          setTimeout(check, 1500);
          return;
        }
        if (!cancelled) navigate("/auth", { replace: true });
      }
    };

    check();
    return () => { cancelled = true; };
  }, [navigate]);

  const toggleRole = (role: Role) => {
    if (role === "investor" && userType === "individual") return;
    if (role === "issuer" && userType === "individual") return;

    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const availableRoles: { role: Role; icon: typeof Building2; label: string; description: string; disabled: boolean }[] = [
    {
      role: "investor",
      icon: BarChart3,
      label: "Investor",
      description: "Discover opportunities & insights",
      disabled: userType === "individual",
    },
    {
      role: "intermediary",
      icon: UserCheck,
      label: "Intermediary",
      description: "Offer regulated financial services",
      disabled: false,
    },
    {
      role: "issuer",
      icon: Building2,
      label: "Issuer",
      description: "Raise capital & publish information",
      disabled: userType === "individual",
    },
  ];

  const actualTotalSteps = needsVerification(selectedRoles) ? TOTAL_STEPS : 4;

  const handleComplete = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: displayName,
          display_name: displayName,
          bio,
          user_type: userType!,
          organization: userType === "entity" ? organization : null,
          designation: designation || null,
          location: location || null,
          certifications: certifications.length > 0 ? certifications : null,
          
          onboarding_completed: true,
          verification_status: Object.values(verificationFiles).some(f => f) ? "pending" : "unverified",
        } as any, { onConflict: "id" });
      if (profileError) throw profileError;

      // Upload verification documents and create verification_requests
      let uploadFailures: string[] = [];
      for (const [role, file] of Object.entries(verificationFiles)) {
        if (file) {
          const result = await uploadFile("verification-docs", file, userId);
          if ("error" in result) {
            uploadFailures.push(`${role}: ${result.error}`);
          } else {
            // Create verification_request so admins can see it in the queue
            const { error: vrError } = await supabase.from("verification_requests").insert({
              user_id: userId,
              document_url: result.url,
              document_name: file.name,
              document_type: file.type,
              regulator: role === "issuer" ? "SEBI / RBI / IRDAI" : "SEBI / AMFI / IRDAI",
              notes: `Uploaded during onboarding for ${role} role`,
              status: "pending",
            });
            if (vrError) {
              console.warn("Failed to create verification request:", vrError.message);
              uploadFailures.push(`${role}: verification request failed`);
            }
          }
        }
      }

      if (uploadFailures.length > 0) {
        toast({
          title: "Verification documents",
          description: `Some uploads failed: ${uploadFailures.join("; ")}. You can retry from profile settings.`,
          variant: "destructive",
        });
      }

      await supabase.from("user_roles").delete().eq("user_id", userId);

      const roleInserts = selectedRoles.map((role) => ({
        user_id: userId,
        role,
        sub_type: selectedSubTypes[role] || null,
      }));
      const { error: rolesError } = await supabase.from("user_roles").insert(roleInserts);
      if (rolesError) throw rolesError;

      toast({ title: "Profile created!", description: "Welcome to findoo." });
      navigate("/feed");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 4 && !needsVerification(selectedRoles)) {
      handleComplete();
    } else if (step === 5) {
      handleComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return userType !== null;
      case 2: return selectedRoles.length > 0;
      case 3: return selectedRoles.every((role) => selectedSubTypes[role] !== "");
      case 4: return displayName.trim().length > 0;
      case 5: return true; // verification nudge is optional
      default: return false;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: actualTotalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step 1: User Type */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground mb-2">
                  How will you use findoo?
                </h1>
                <p className="text-muted-foreground mb-8">
                  This helps us tailor your experience. You can add more roles later.
                </p>
                <div className="grid gap-4">
                  {[
                    {
                      type: "individual" as UserType,
                      title: "Individual",
                      desc: "Personal account — you start as an Investor and can become an Intermediary",
                    },
                    {
                      type: "entity" as UserType,
                      title: "Entity / Organization",
                      desc: "For companies, firms & institutions — can be Investor, Intermediary, and/or Issuer",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => {
                        setUserType(opt.type);
                        if (opt.type === "individual") {
                          setSelectedRoles(["investor"]);
                        }
                      }}
                      className={`text-left rounded-xl border-2 p-5 transition-all ${
                        userType === opt.type
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <h3 className="font-semibold font-heading text-foreground">{opt.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Roles */}
            {step === 2 && (
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground mb-2">
                  Select your roles
                </h1>
                <p className="text-muted-foreground mb-8">
                  {userType === "individual"
                    ? "You're an Investor by default. Add Intermediary if you're a registered professional."
                    : "Select all roles that apply to your organization."
                  }
                </p>
                <div className="grid gap-4">
                  {availableRoles.map((item) => {
                    const isSelected = selectedRoles.includes(item.role);
                    const isDisabledRole = item.disabled;
                    const isAlwaysOn = item.role === "investor" && userType === "individual";

                    return (
                      <button
                        key={item.role}
                        onClick={() => !isAlwaysOn && toggleRole(item.role)}
                        disabled={item.role === "issuer" && userType === "individual"}
                        className={`flex items-center gap-4 text-left rounded-xl border-2 p-5 transition-all ${
                          isSelected
                            ? "border-accent bg-accent/5"
                            : isDisabledRole && !isAlwaysOn
                            ? "border-border opacity-40 cursor-not-allowed"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold font-heading text-foreground">{item.label}</h3>
                            {isAlwaysOn && (
                              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Always on</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Sub-types */}
            {step === 3 && (
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground mb-2">
                  Tell us more
                </h1>
                <p className="text-muted-foreground mb-8">
                  Select your specific category for each role.
                </p>
                <div className="space-y-6">
                  {selectedRoles.map((role) => (
                    <div key={role}>
                      <Label className="text-sm font-medium capitalize mb-3 block">
                        {role} Type
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {getSubTypesForRole(role).map((sub) => (
                          <button
                            key={sub.value}
                            onClick={() =>
                              setSelectedSubTypes((prev) => ({ ...prev, [role]: sub.value }))
                            }
                            className={`text-left text-sm rounded-lg border-2 px-4 py-3 transition-all ${
                              selectedSubTypes[role] === sub.value
                                ? "border-accent bg-accent/5 text-foreground"
                                : "border-border text-muted-foreground hover:border-muted-foreground/30"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Profile details */}
            {step === 4 && (
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground mb-2">
                  Complete your profile
                </h1>
                <p className="text-muted-foreground mb-8">
                  This is how others will see you on findoo.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">
                      {userType === "entity" ? "Entity Name" : "Display Name"}
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={userType === "entity" ? "Your company name" : "Your name"}
                    />
                  </div>

                  {userType === "entity" && (
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization / Firm</Label>
                      <Input
                        id="organization"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Parent organization or firm name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="designation">
                      Designation <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder={userType === "entity" ? "e.g. Fund Manager, CEO" : "e.g. Portfolio Manager, RIA"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio <span className="text-muted-foreground">(optional)</span></Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the network about yourself or your organization..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <LocationSelector value={location} onChange={setLocation} placeholder="Search your city..." />
                  </div>

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
                      <h3 className="text-sm font-semibold text-foreground">Find your contacts on findoo</h3>
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
                  Get verified on findoo
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
                {step === 5 ? "Submit & Verify" : "Launch findoo"}
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
