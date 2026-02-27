import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Nfc, QrCode, Copy, Download, Smartphone, Share2, CheckCircle,
  AlertTriangle
} from "lucide-react";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

interface DigitalCardManagerProps {
  profileId: string;
  digitalCardFields: Record<string, boolean> | null;
  onFieldsUpdated: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full Name",
  designation: "Designation / Title",
  organization: "Organization",
  headline: "Headline / Bio",
  location: "Location",
  website: "Website",
  social_links: "Social Links",
  certifications: "Certifications",
  specializations: "Specializations",
  email: "Email Address",
  phone: "Phone Number",
};

const DEFAULT_FIELDS: Record<string, boolean> = {
  full_name: true, designation: true, organization: true, headline: true,
  location: true, website: true, social_links: true, certifications: true,
  specializations: true, email: false, phone: false,
};

export const DigitalCardManager = ({ profileId, digitalCardFields, onFieldsUpdated }: DigitalCardManagerProps) => {
  const [fields, setFields] = useState<Record<string, boolean>>(digitalCardFields ?? DEFAULT_FIELDS);
  const [saving, setSaving] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);

  const cardUrl = `${window.location.origin}/card/${profileId}`;

  useEffect(() => {
    setNfcSupported("NDEFReader" in window);
  }, []);

  const handleToggle = (field: string) => {
    if (field === "full_name") return; // Always shown
    setFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ digital_card_fields: fields } as any)
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      toast.error("Failed to save card settings");
    } else {
      toast.success("Digital card updated");
      onFieldsUpdated();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    toast.success("Card link copied!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "My FindOO Digital Card", url: cardUrl });
    } else {
      handleCopyLink();
    }
  };

  const handleWriteNfc = async () => {
    if (!("NDEFReader" in window)) {
      toast.error("NFC not supported on this device/browser");
      return;
    }
    setNfcWriting(true);
    setNfcSuccess(false);
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: cardUrl }] });
      setNfcSuccess(true);
      toast.success("NFC tag written successfully!");
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast.info("NFC write cancelled");
      } else {
        toast.error("Failed to write NFC tag. Make sure NFC is enabled.");
      }
    } finally {
      setNfcWriting(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("findoo-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = "findoo-card-qr.png";
      a.href = pngUrl;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-5">
      {/* QR Code + NFC Writer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[hsl(var(--gold))]" />
            Your Digital Card
          </CardTitle>
          <CardDescription>Share your professional identity paperlessly via NFC tap or QR scan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <QRCodeSVG
                id="findoo-qr-code"
                value={cardUrl}
                size={180}
                level="M"
                imageSettings={{
                  src: findooLogoIcon,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-1.5" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1.5" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="h-4 w-4 mr-1.5" /> Save QR
            </Button>
            <Button
              variant={nfcSuccess ? "outline" : "default"}
              size="sm"
              onClick={handleWriteNfc}
              disabled={nfcWriting || !nfcSupported}
              className={nfcSuccess ? "border-green-500 text-green-600" : ""}
            >
              {nfcWriting ? (
                <><Smartphone className="h-4 w-4 mr-1.5 animate-pulse" /> Hold tag...</>
              ) : nfcSuccess ? (
                <><CheckCircle className="h-4 w-4 mr-1.5" /> Written!</>
              ) : (
                <><Nfc className="h-4 w-4 mr-1.5" /> Write NFC</>
              )}
            </Button>
          </div>

          {!nfcSupported && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>NFC writing is available on Chrome for Android only. Use QR code as a universal alternative.</span>
            </div>
          )}

          <div className="text-center">
            <a href={cardUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-accent hover:underline">
              Preview your card →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Field Visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Card Fields</CardTitle>
          <CardDescription>Choose what information appears on your digital card.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`card-field-${key}`} className="text-sm">
                {label}
                {key === "full_name" && (
                  <Badge variant="secondary" className="ml-2 text-xs">Always shown</Badge>
                )}
              </Label>
              <Switch
                id={`card-field-${key}`}
                checked={fields[key] !== false}
                onCheckedChange={() => handleToggle(key)}
                disabled={key === "full_name"}
              />
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving} className="w-full mt-2" size="sm">
            {saving ? "Saving..." : "Save Card Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
