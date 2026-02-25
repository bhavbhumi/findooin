import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Building2, Briefcase, MapPin, Globe, Award, Languages,
  GraduationCap, Landmark, Save, X, Plus, Trash2,
} from "lucide-react";
import type { ProfileData } from "./ProfileHeader";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData;
  onSaved: () => void;
}

const regulatoryOptions = [
  { key: "sebi", label: "SEBI Registration" },
  { key: "rbi", label: "RBI License" },
  { key: "irdai", label: "IRDAI Registration" },
  { key: "amfi", label: "AMFI ARN" },
  { key: "pfrda", label: "PFRDA Registration" },
  { key: "nse", label: "NSE Membership" },
  { key: "bse", label: "BSE Membership" },
  { key: "gstin", label: "GSTIN" },
  { key: "cin", label: "CIN" },
  { key: "pan", label: "PAN" },
];

const socialOptions = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "Twitter / X" },
  { key: "website", label: "Website" },
  { key: "youtube", label: "YouTube" },
];

export const EditProfileDialog = ({ open, onOpenChange, profile, onSaved }: EditProfileDialogProps) => {
  const [saving, setSaving] = useState(false);

  // Basic
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [bio, setBio] = useState(profile.bio || "");

  // Professional
  const [organization, setOrganization] = useState(profile.organization || "");
  const [designation, setDesignation] = useState(profile.designation || "");
  const [location, setLocation] = useState(profile.location || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [experienceYears, setExperienceYears] = useState(profile.experience_years?.toString() || "");

  // Expertise
  const [specializations, setSpecializations] = useState<string[]>(profile.specializations || []);
  const [certifications, setCertifications] = useState<string[]>(profile.certifications || []);
  const [languages, setLanguages] = useState<string[]>(profile.languages || []);
  const [newSpec, setNewSpec] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newLang, setNewLang] = useState("");

  // Regulatory
  const [regulatoryIds, setRegulatoryIds] = useState<Record<string, string>>(
    (profile.regulatory_ids as Record<string, string>) || {}
  );

  // Social
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    (profile.social_links as Record<string, string>) || {}
  );

  // Reset when profile changes
  useEffect(() => {
    setDisplayName(profile.display_name || "");
    setHeadline(profile.headline || "");
    setBio(profile.bio || "");
    setOrganization(profile.organization || "");
    setDesignation(profile.designation || "");
    setLocation(profile.location || "");
    setWebsite(profile.website || "");
    setExperienceYears(profile.experience_years?.toString() || "");
    setSpecializations(profile.specializations || []);
    setCertifications(profile.certifications || []);
    setLanguages(profile.languages || []);
    setRegulatoryIds((profile.regulatory_ids as Record<string, string>) || {});
    setSocialLinks((profile.social_links as Record<string, string>) || {});
  }, [profile]);

  const addToList = (list: string[], setter: (v: string[]) => void, value: string, clearFn: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
      clearFn("");
    }
  };

  const removeFromList = (list: string[], setter: (v: string[]) => void, index: number) => {
    setter(list.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        headline: headline || null,
        bio: bio || null,
        organization: organization || null,
        designation: designation || null,
        location: location || null,
        website: website || null,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        specializations: specializations.length > 0 ? specializations : null,
        certifications: certifications.length > 0 ? certifications : null,
        languages: languages.length > 0 ? languages : null,
        regulatory_ids: Object.keys(regulatoryIds).length > 0 ? regulatoryIds : null,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } else {
      toast.success("Profile updated successfully");
      onSaved();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading">Edit Profile</DialogTitle>
          <DialogDescription>Update your professional details to build trust and credibility.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full mt-2">
          <TabsList className="w-full grid grid-cols-4 h-10">
            <TabsTrigger value="basic" className="text-xs gap-1"><User className="h-3 w-3" /> Basic</TabsTrigger>
            <TabsTrigger value="professional" className="text-xs gap-1"><Briefcase className="h-3 w-3" /> Professional</TabsTrigger>
            <TabsTrigger value="expertise" className="text-xs gap-1"><Award className="h-3 w-3" /> Expertise</TabsTrigger>
            <TabsTrigger value="regulatory" className="text-xs gap-1"><Landmark className="h-3 w-3" /> Regulatory</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How you want to appear" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Headline</Label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Portfolio Manager | Equity Research" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." rows={5} className="mt-1 resize-none" />
            </div>

            {/* Social Links */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Social Links</Label>
              <div className="space-y-2">
                {socialOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{opt.label}</span>
                    <Input
                      value={socialLinks[opt.key] || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSocialLinks((prev) => {
                          const next = { ...prev };
                          if (v) next[opt.key] = v;
                          else delete next[opt.key];
                          return next;
                        });
                      }}
                      placeholder={`${opt.label} URL`}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Organization</Label>
                <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or firm" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Designation</Label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Your title or role" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Experience (years)</Label>
                <Input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 10" className="mt-1" min="0" max="60" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Website</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className="mt-1" />
            </div>
          </TabsContent>

          {/* Expertise Tab */}
          <TabsContent value="expertise" className="space-y-5 mt-4">
            {/* Specializations */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Specializations</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={newSpec} onChange={(e) => setNewSpec(e.target.value)} placeholder="e.g. Mutual Funds" className="text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(specializations, setSpecializations, newSpec, setNewSpec); } }} />
                <Button type="button" size="icon" variant="outline" className="shrink-0 h-9 w-9" onClick={() => addToList(specializations, setSpecializations, newSpec, setNewSpec)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {specializations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {specializations.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/5 text-primary border border-primary/10 px-2 py-1 rounded-full">
                      {s}
                      <button onClick={() => removeFromList(specializations, setSpecializations, i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Certifications</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="e.g. CFA Level III" className="text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(certifications, setCertifications, newCert, setNewCert); } }} />
                <Button type="button" size="icon" variant="outline" className="shrink-0 h-9 w-9" onClick={() => addToList(certifications, setCertifications, newCert, setNewCert)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {certifications.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {certifications.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium flex items-center gap-1.5"><GraduationCap className="h-3 w-3 text-muted-foreground" />{c}</span>
                      <button onClick={() => removeFromList(certifications, setCertifications, i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Languages */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Languages</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="e.g. Hindi" className="text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(languages, setLanguages, newLang, setNewLang); } }} />
                <Button type="button" size="icon" variant="outline" className="shrink-0 h-9 w-9" onClick={() => addToList(languages, setLanguages, newLang, setNewLang)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {languages.map((l, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      <Languages className="h-3 w-3" />{l}
                      <button onClick={() => removeFromList(languages, setLanguages, i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Regulatory Tab */}
          <TabsContent value="regulatory" className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground">Add your regulatory registration numbers to establish trust and compliance.</p>
            <div className="space-y-3">
              {regulatoryOptions.map((opt) => (
                <div key={opt.key} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-card-foreground w-36 shrink-0">{opt.label}</span>
                  <Input
                    value={regulatoryIds[opt.key] || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRegulatoryIds((prev) => {
                        const next = { ...prev };
                        if (v) next[opt.key] = v;
                        else delete next[opt.key];
                        return next;
                      });
                    }}
                    placeholder="Registration number"
                    className="text-sm font-mono"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Save */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
