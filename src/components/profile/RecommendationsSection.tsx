import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquareQuote, Plus, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { toast } from "sonner";
import { format } from "date-fns";

interface Recommendation {
  id: string;
  author_id: string;
  recipient_id: string;
  relationship: string;
  content: string;
  status: string;
  created_at: string;
  author_profile?: { full_name: string; display_name: string | null; avatar_url: string | null; headline: string | null };
}

const RELATIONSHIPS: Record<string, string> = {
  colleague: "Colleague",
  manager: "Manager",
  report: "Direct Report",
  client: "Client",
  mentor: "Mentor",
  mentee: "Mentee",
  business_partner: "Business Partner",
};

export function RecommendationsSection({ profileId, isOwnProfile, currentUserId }: {
  profileId: string;
  isOwnProfile: boolean;
  currentUserId: string | null;
}) {
  const [writeOpen, setWriteOpen] = useState(false);
  const [relationship, setRelationship] = useState("colleague");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: recommendations = [] } = useQuery({
    queryKey: ["recommendations", profileId],
    queryFn: async () => {
      const { data } = await supabase
        .from("recommendations")
        .select("*")
        .eq("recipient_id", profileId)
        .order("created_at", { ascending: false });
      if (!data?.length) return [];

      const authorIds = [...new Set(data.map((r) => r.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline")
        .in("id", authorIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return data.map((r) => ({ ...r, author_profile: profileMap.get(r.author_id) })) as Recommendation[];
    },
  });

  const writeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("recommendations").insert({
        author_id: currentUserId!,
        recipient_id: profileId,
        relationship,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", profileId] });
      toast.success("Recommendation submitted for approval");
      setWriteOpen(false);
      setContent("");
    },
    onError: () => toast.error("Failed to submit recommendation"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("recommendations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", profileId] });
      toast.success("Recommendation updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recommendations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", profileId] });
      toast.success("Recommendation removed");
    },
  });

  const accepted = recommendations.filter((r) => r.status === "accepted");
  const pending = recommendations.filter((r) => r.status === "pending");
  const canWrite = !isOwnProfile && currentUserId && currentUserId !== profileId;
  const alreadyWrote = recommendations.some((r) => r.author_id === currentUserId);

  if (!accepted.length && !pending.length && !canWrite && !isOwnProfile) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">
            Recommendations
            {accepted.length > 0 && <span className="text-xs font-normal text-muted-foreground ml-1.5">({accepted.length})</span>}
          </h3>
        </div>
        {canWrite && !alreadyWrote && (
          <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Write
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Write a Recommendation</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Your Relationship</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(RELATIONSHIPS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Recommendation *</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your experience working with this person..." rows={4} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setWriteOpen(false)}>Cancel</Button>
                  <Button size="sm" onClick={() => writeMutation.mutate()} disabled={!content.trim() || writeMutation.isPending}>Submit</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="p-5">
        {/* Pending approvals for profile owner */}
        {isOwnProfile && pending.length > 0 && (
          <div className="mb-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Pending Approval ({pending.length})</p>
            {pending.map((rec) => (
              <div key={rec.id} className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-start gap-3">
                  <AvatarWithFallback
                    src={rec.author_profile?.avatar_url}
                    initials={(rec.author_profile?.full_name || "?")[0]}
                    className="h-8 w-8 rounded-full shrink-0"
                    textClassName="text-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{rec.author_profile?.display_name || rec.author_profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground italic mt-1">"{rec.content}"</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={() => updateStatusMutation.mutate({ id: rec.id, status: "accepted" })}>
                        <Check className="h-3 w-3" /> Accept
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 text-destructive" onClick={() => updateStatusMutation.mutate({ id: rec.id, status: "rejected" })}>
                        <X className="h-3 w-3" /> Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {accepted.length === 0 && pending.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {isOwnProfile ? "No recommendations yet. Ask your connections to write one!" : "No recommendations yet."}
          </p>
        ) : (
          <div className="space-y-4">
            {accepted.map((rec, idx) => (
              <div key={rec.id} className={`${idx > 0 ? "pt-4 border-t border-border" : ""}`}>
                <div className="flex items-start gap-3">
                  <AvatarWithFallback
                    src={rec.author_profile?.avatar_url}
                    initials={(rec.author_profile?.full_name || "?")[0]}
                    className="h-10 w-10 rounded-full shrink-0"
                    textClassName="text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{rec.author_profile?.display_name || rec.author_profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{rec.author_profile?.headline}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px]">{RELATIONSHIPS[rec.relationship] || rec.relationship}</Badge>
                        {rec.author_id === currentUserId && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(rec.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-card-foreground/80 mt-2 leading-relaxed italic">"{rec.content}"</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{format(new Date(rec.created_at), "MMM yyyy")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
