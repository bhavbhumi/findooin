import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface EndorsementCount {
  skill: string;
  count: number;
  endorsedByMe: boolean;
}

interface EndorsementsBadgeProps {
  profileId: string;
  specializations: string[] | null;
  isOwnProfile: boolean;
  currentUserId: string | null;
}

export const EndorsementsBadge = ({ profileId, specializations, isOwnProfile, currentUserId }: EndorsementsBadgeProps) => {
  const [endorsements, setEndorsements] = useState<EndorsementCount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEndorsements();
  }, [profileId, currentUserId]);

  const loadEndorsements = async () => {
    if (!specializations || specializations.length === 0) return;

    const { data } = await supabase
      .from("endorsements")
      .select("skill, endorser_id")
      .eq("endorsed_user_id", profileId);

    const counts: Record<string, { count: number; endorsedByMe: boolean }> = {};
    specializations.forEach((s) => { counts[s] = { count: 0, endorsedByMe: false }; });

    (data || []).forEach((e: any) => {
      if (counts[e.skill]) {
        counts[e.skill].count++;
        if (e.endorser_id === currentUserId) counts[e.skill].endorsedByMe = true;
      }
    });

    setEndorsements(
      specializations.map((s) => ({
        skill: s,
        count: counts[s]?.count || 0,
        endorsedByMe: counts[s]?.endorsedByMe || false,
      }))
    );
  };

  const handleEndorse = async (skill: string) => {
    if (!currentUserId || isOwnProfile) return;
    setLoading(true);

    const existing = endorsements.find((e) => e.skill === skill);
    if (existing?.endorsedByMe) {
      await supabase.from("endorsements").delete()
        .eq("endorser_id", currentUserId)
        .eq("endorsed_user_id", profileId)
        .eq("skill", skill);
      toast.success("Endorsement removed");
    } else {
      const { error } = await supabase.from("endorsements").insert({
        endorser_id: currentUserId,
        endorsed_user_id: profileId,
        skill,
      });
      if (error) {
        toast.error("Failed to endorse");
      } else {
        toast.success(`Endorsed for ${skill}`);
      }
    }

    await loadEndorsements();
    setLoading(false);
  };

  if (!specializations || specializations.length === 0) return null;

  return (
    <div className="space-y-2">
      {endorsements.map((e) => (
        <div key={e.skill} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-card-foreground">{e.skill}</span>
              {e.count > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  <ThumbsUp className="h-2.5 w-2.5" /> {e.count}
                </span>
              )}
            </div>
          </div>
          {!isOwnProfile && currentUserId && (
            <Button
              variant={e.endorsedByMe ? "secondary" : "outline"}
              size="sm"
              className="h-7 text-[10px] gap-1 px-2"
              disabled={loading}
              onClick={() => handleEndorse(e.skill)}
            >
              {e.endorsedByMe ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {e.endorsedByMe ? "Endorsed" : "Endorse"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
