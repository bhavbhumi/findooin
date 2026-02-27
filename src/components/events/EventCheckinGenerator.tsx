import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  Nfc, QrCode, Copy, Download, Smartphone, CheckCircle, AlertTriangle,
  ScanLine
} from "lucide-react";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

interface EventCheckinGeneratorProps {
  eventId: string;
  eventTitle: string;
}

export function EventCheckinGenerator({ eventId, eventTitle }: EventCheckinGeneratorProps) {
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const nfcSupported = "NDEFReader" in window;

  const checkinUrl = `${window.location.origin}/event-checkin/${eventId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkinUrl);
    toast.success("Check-in link copied!");
  };

  const handleWriteNfc = async () => {
    if (!nfcSupported) {
      toast.error("NFC not supported on this device/browser");
      return;
    }
    setNfcWriting(true);
    setNfcSuccess(false);
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: checkinUrl }] });
      setNfcSuccess(true);
      toast.success("NFC check-in tag written!");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to write NFC tag.");
      }
    } finally {
      setNfcWriting(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`event-checkin-qr-${eventId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `checkin-${eventTitle.replace(/\s+/g, "-")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="border-border mt-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-[hsl(var(--gold))]" />
          NFC / QR Check-in
        </CardTitle>
        <CardDescription className="text-xs">
          Generate a QR code or write an NFC tag for event check-in at the venue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <QRCodeSVG
              id={`event-checkin-qr-${eventId}`}
              value={checkinUrl}
              size={140}
              level="M"
              imageSettings={{
                src: findooLogoIcon,
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleCopyLink}>
            <Copy className="h-3 w-3 mr-1" /> Link
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadQR}>
            <Download className="h-3 w-3 mr-1" /> QR
          </Button>
          <Button
            variant={nfcSuccess ? "outline" : "default"}
            size="sm"
            className={`text-xs h-8 ${nfcSuccess ? "border-emerald-500 text-emerald-600" : ""}`}
            onClick={handleWriteNfc}
            disabled={nfcWriting || !nfcSupported}
          >
            {nfcWriting ? (
              <><Smartphone className="h-3 w-3 mr-1 animate-pulse" /> Hold...</>
            ) : nfcSuccess ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Done</>
            ) : (
              <><Nfc className="h-3 w-3 mr-1" /> NFC</>
            )}
          </Button>
        </div>

        {!nfcSupported && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> NFC: Chrome Android only. QR works everywhere.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
