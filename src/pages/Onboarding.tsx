import { useState, useEffect } from "react";
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
} from "lucide-react";

type UserType = "individual" | "entity";
type Role = "investor" | "intermediary" | "issuer";

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

const Onboarding = () => {
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
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      setDisplayName(session.user.user_metadata?.full_name || "");
    });
  }, [navigate]);

  const toggleRole = (role: Role) => {
    // Investor is always on for individuals
    if (role === "investor" && userType === "individual") return;
    // Issuer only for entities
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
      disabled: userType === "individual", // always on
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

  const handleComplete = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // For now, just navigate — DB tables will be created next
      toast({ title: "Profile created!", description: "Welcome to FindOO." });
      navigate("/feed");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return userType !== null;
      case 2: return selectedRoles.length > 0;
      case 3:
        return selectedRoles.every((role) => selectedSubTypes[role] !== "");
      case 4: return displayName.trim().length > 0;
      default: return false;
    }
  };

  const getSubTypesForRole = (role: Role) => {
    switch (role) {
      case "investor": return investorSubTypes;
      case "intermediary": return intermediarySubTypes;
      case "issuer": return issuerSubTypes;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
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
                  How will you use FindOO?
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
                  This is how others will see you on FinNet.
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
                </div>
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
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading || !canProceed()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Launch FindOO
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to get sub-types outside component scope
const getSubTypesForRole = (role: Role): SubTypeOption[] => {
  switch (role) {
    case "investor": return investorSubTypes;
    case "intermediary": return intermediarySubTypes;
    case "issuer": return issuerSubTypes;
  }
};

export default Onboarding;
