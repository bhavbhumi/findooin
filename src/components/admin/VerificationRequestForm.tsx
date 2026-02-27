import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Upload, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const regulators = ["SEBI", "RBI", "IRDAI", "AMFI", "PFRDA", "IBBI", "Other"];

interface VerificationRequestFormProps {
  userId: string;
  currentStatus: string;
}

export function VerificationRequestForm({ userId, currentStatus }: VerificationRequestFormProps) {
  const qc = useQueryClient();
  const [regulator, setRegulator] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch existing requests
  const { data: existingRequests } = useQuery({
    queryKey: ["my-verification-requests", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const hasPending = existingRequests?.some((r: any) => r.status === "pending");

  const submit = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a document");
      if (!regulator) throw new Error("Please select a regulator");

      setUploading(true);

      // Upload via edge function
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "verification-docs");
      formData.append("path", `${userId}/${Date.now()}_${file.name}`);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("upload-file", {
        body: formData,
      });

      if (res.error) throw new Error(res.error.message || "Upload failed");
      const docUrl = res.data?.publicUrl || res.data?.path || "";

      // Insert verification request
      const { error } = await supabase.from("verification_requests").insert({
        user_id: userId,
        document_url: docUrl,
        document_name: file.name,
        document_type: file.type,
        regulator,
        registration_number: regNumber || null,
        notes: notes || null,
      });

      if (error) throw error;

      // Update profile to pending
      await supabase.from("profiles").update({ verification_status: "pending" }).eq("id", userId);
    },
    onSuccess: () => {
      toast.success("Verification request submitted! We'll review it shortly.");
      setFile(null);
      setRegulator("");
      setRegNumber("");
      setNotes("");
      setUploading(false);
      qc.invalidateQueries({ queryKey: ["my-verification-requests"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
      setUploading(false);
    },
  });

  if (currentStatus === "verified") {
    return (
      <Card>
        <CardContent className="py-6 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <div>
            <p className="font-semibold text-sm text-accent">Verified</p>
            <p className="text-xs text-muted-foreground">Your identity has been verified by our team.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing requests */}
        {existingRequests && existingRequests.length > 0 && (
          <div className="space-y-2">
            {existingRequests.slice(0, 3).map((req: any) => (
              <div key={req.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                {req.status === "pending" && <Clock className="h-3.5 w-3.5 text-yellow-600 shrink-0" />}
                {req.status === "approved" && <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />}
                {req.status === "rejected" && <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{req.document_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {req.regulator} · {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">{req.status}</Badge>
              </div>
            ))}
          </div>
        )}

        {hasPending ? (
          <p className="text-xs text-muted-foreground">Your verification request is being reviewed. We'll notify you once it's processed.</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Upload your regulatory registration certificate to get verified. This helps build trust with other users.
            </p>

            <Select value={regulator} onValueChange={setRegulator}>
              <SelectTrigger>
                <SelectValue placeholder="Select regulator" />
              </SelectTrigger>
              <SelectContent>
                {regulators.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input
              placeholder="Registration number (e.g., INH000XXXXX)"
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
            />

            <div>
              <label className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file ? file.name : "Upload registration document"}</p>
                  <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG — max 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <Textarea
              placeholder="Additional notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />

            <Button
              onClick={() => submit.mutate()}
              disabled={!file || !regulator || submit.isPending || uploading}
              className="w-full gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              {submit.isPending ? "Submitting..." : "Submit for Verification"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
