import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDrafts, PostDraft } from "@/hooks/useDrafts";
import {
  TrendingUp, BookOpen, Megaphone, Newspaper, FileText,
  Paperclip, X, Image, File, Send, Loader2, AtSign, Clock,
  Plus, Trash2, BarChart3, ClipboardList, Sparkles,
  Globe, Users, UserCheck, Heart, Lock, Hash, Search,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { uploadFile, validateFile } from "@/lib/storage";

/* ── Post Categories for Issuers/Intermediaries ── */
const POST_CATEGORIES = [
  { value: "text", label: "Insight", shortLabel: "Insight", icon: FileText },
  { value: "market_commentary", label: "Market Commentary", shortLabel: "Market", icon: TrendingUp },
  { value: "research_note", label: "Research Note", shortLabel: "Research", icon: BookOpen },
  { value: "announcement", label: "Announcement", shortLabel: "Announce", icon: Megaphone },
  { value: "article", label: "Article", shortLabel: "Article", icon: Newspaper },
] as const;

/* ── Query Categories for Investors ── */
const QUERY_CATEGORIES = [
  { value: "requirement", label: "Requirement", shortLabel: "Requirement", icon: FileText },
  { value: "expert_find", label: "Expert Find", shortLabel: "Expert", icon: Search },
] as const;

/* ── Post Kinds (Post, Poll, Survey) ── */
const POST_KINDS = [
  { value: "normal", label: "Post", shortLabel: "Post", icon: FileText, disabled: false },
  { value: "poll", label: "Poll", shortLabel: "Poll", icon: BarChart3, disabled: false },
  { value: "survey", label: "Survey", shortLabel: "Survey", icon: ClipboardList, disabled: false },
  { value: "more", label: "More Coming", shortLabel: "More", icon: Sparkles, disabled: true },
] as const;

/* ── Audience / Visibility ── */
const AUDIENCES = [
  { value: "public", label: "Public", shortLabel: "Public", icon: Globe },
  { value: "network", label: "Whole Network", shortLabel: "Network", icon: Users },
  { value: "following", label: "Following Only", shortLabel: "Following", icon: UserCheck },
  { value: "followers", label: "Followers Only", shortLabel: "Followers", icon: Heart },
  { value: "connections", label: "Connections Only", shortLabel: "Connections", icon: Users },
  { value: "private", label: "For Me Only", shortLabel: "Private", icon: Lock },
] as const;

const MAX_CONTENT_LENGTH = 3000;

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace("#", "")))];
}

function getAcceptString() {
  return "application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

/* ── Poll option row ── */
interface PollOption {
  id: string;
  text: string;
}

/* ── Survey question ── */
interface SurveyQuestion {
  id: string;
  text: string;
  options: PollOption[];
}

function genId() {
  return crypto.randomUUID();
}

/* Dynamic placeholder per post kind */
function getPlaceholder(postKind: string): string {
  switch (postKind) {
    case "poll":
      return "Ask your poll question…";
    case "survey":
      return "Describe your survey topic…";
    default:
      return "Share an insight, research note, or market update… Use #hashtags to categorise your post.";
  }
}

interface CreatePostComposerProps {
  draftToLoad?: PostDraft | null;
  onDraftLoaded?: () => void;
}

export function CreatePostComposer({ draftToLoad, onDraftLoaded }: CreatePostComposerProps = {}) {
  const isMobile = useIsMobile();
  const { activeRole, loaded: roleLoaded, userId: roleUserId } = useRole();
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const onChange = () => setIsTablet(mql.matches);
    mql.addEventListener("change", onChange);
    setIsTablet(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const [userId, setUserId] = useState<string | null>(null);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("U");

  const [postKind, setPostKind] = useState("normal");
  const [category, setCategory] = useState("text");
  const [queryCategory, setQueryCategory] = useState<string>("requirement");
  const [audience, setAudience] = useState("public");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Schedule
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [showSchedule, setShowSchedule] = useState(false);

  // Poll state
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: genId(), text: "" },
    { id: genId(), text: "" },
  ]);

  // Survey state
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([
    { id: genId(), text: "", options: [{ id: genId(), text: "" }, { id: genId(), text: "" }] },
  ]);

  // Mention people
  const [showMentionInput, setShowMentionInput] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionResults, setMentionResults] = useState<{ id: string; full_name: string; avatar_url: string | null }[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<{ id: string; full_name: string }[]>([]);

  const queryClient = useQueryClient();
  const { saveDraft } = useDrafts(userId);

  // Derive investor mode from active role context
  const isInvestorMode = activeRole === "investor";

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      setCanPost(true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("avatar_url, full_name, display_name")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setAvatarUrl(profileData.avatar_url);
        const name = profileData.display_name || profileData.full_name || "U";
        setInitials(name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase());
      }
    });
  }, []);

  // Reset post kind when switching to investor mode (no polls/surveys for investors)
  useEffect(() => {
    if (isInvestorMode) {
      setPostKind("normal");
      setCategory("query");
    } else {
      if (category === "query") setCategory("text");
    }
  }, [isInvestorMode]);

  // Load draft into composer when draftToLoad changes
  useEffect(() => {
    if (!draftToLoad) return;
    setContent(draftToLoad.content || "");
    setPostKind(draftToLoad.post_kind || "normal");
    if (draftToLoad.post_type === "query") {
      setCategory("query");
      setQueryCategory(draftToLoad.query_category || "requirement");
    } else {
      setCategory(draftToLoad.post_type || "text");
    }
    setAudience(draftToLoad.visibility || "public");
    setActiveDraftId(draftToLoad.id);
    if (draftToLoad.poll_options && Array.isArray(draftToLoad.poll_options)) {
      setPollOptions(draftToLoad.poll_options);
    }
    if (draftToLoad.survey_questions && Array.isArray(draftToLoad.survey_questions)) {
      setSurveyQuestions(draftToLoad.survey_questions);
    }
    if (draftToLoad.mentioned_users && Array.isArray(draftToLoad.mentioned_users)) {
      setMentionedUsers(draftToLoad.mentioned_users);
    }
    if (draftToLoad.scheduled_at) {
      setScheduleDate(new Date(draftToLoad.scheduled_at));
      setShowSchedule(true);
    }
    if (draftToLoad.schedule_time) {
      setScheduleTime(draftToLoad.schedule_time);
    }
    onDraftLoaded?.();
  }, [draftToLoad]);

  // Mention search
  useEffect(() => {
    if (!mentionSearch.trim() || mentionSearch.length < 2) { setMentionResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${mentionSearch}%`)
        .neq("id", userId || "")
        .limit(5);
      setMentionResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [mentionSearch, userId]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file, "post-attachments");
    if (err) { toast.error(err); e.target.value = ""; return; }
    setAttachment(file);
    // Generate image preview
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setAttachmentPreviewUrl(url);
    } else {
      setAttachmentPreviewUrl(null);
    }
    e.target.value = "";
  }, []);

  const handleSaveDraft = async () => {
    if (!userId) return;
    setSavingDraft(true);
    const id = await saveDraft({
      id: activeDraftId || undefined,
      content,
      post_kind: postKind,
      post_type: isInvestorMode ? "query" : category,
      query_category: isInvestorMode ? queryCategory : null,
      visibility: audience,
      poll_options: postKind === "poll" ? pollOptions : null,
      survey_questions: postKind === "survey" ? surveyQuestions : null,
      mentioned_users: mentionedUsers.length > 0 ? mentionedUsers : null,
      hashtags: extractHashtags(content),
      scheduled_at: scheduleDate?.toISOString() || null,
      schedule_time: scheduleTime,
    });
    if (id) setActiveDraftId(id);
    setSavingDraft(false);
  };

  const handleSubmit = async () => {
    if (!userId || !content.trim()) return;
    if (content.length > MAX_CONTENT_LENGTH) { toast.error(`Content exceeds ${MAX_CONTENT_LENGTH} character limit.`); return; }

    if (postKind === "poll") {
      const filled = pollOptions.filter((o) => o.text.trim());
      if (filled.length < 2) { toast.error("Poll needs at least 2 options."); return; }
    }

    if (postKind === "survey") {
      for (const q of surveyQuestions) {
        if (!q.text.trim()) { toast.error("All survey questions must have text."); return; }
        const filled = q.options.filter((o) => o.text.trim());
        if (filled.length < 2) { toast.error("Each survey question needs at least 2 options."); return; }
      }
    }

    setSubmitting(true);
    try {
      const hashtags = extractHashtags(content);

      let scheduledAt: string | null = null;
      if (scheduleDate) {
        const [h, m] = scheduleTime.split(":").map(Number);
        const dt = new Date(scheduleDate);
        dt.setHours(h, m, 0, 0);
        if (dt <= new Date()) {
          toast.error("Scheduled time must be in the future.");
          setSubmitting(false);
          return;
        }
        scheduledAt = dt.toISOString();
      }

      // Upload attachment if present
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;
      let attachmentType: string | null = null;
      if (attachment) {
        const result = await uploadFile("post-attachments", attachment, userId);
        if ("error" in result) {
          toast.error(`File upload failed: ${result.error}`);
          setSubmitting(false);
          return;
        }
        attachmentUrl = result.url;
        attachmentName = attachment.name;
        attachmentType = attachment.type;
      }

      const postType = isInvestorMode ? "query" : category;
      const { data: postData, error } = await supabase.from("posts").insert({
        author_id: userId,
        content: content.trim(),
        post_type: postType as any,
        post_kind: postKind as any,
        visibility: audience as any,
        hashtags: hashtags.length > 0 ? hashtags : null,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_url: attachmentUrl,
        scheduled_at: scheduledAt,
        query_category: isInvestorMode ? queryCategory as any : null,
      }).select("id").single();

      if (error) throw error;

      if (postKind === "poll" && postData) {
        const filled = pollOptions.filter((o) => o.text.trim());
        await supabase.from("poll_options").insert(
          filled.map((o, i) => ({ post_id: postData.id, option_text: o.text.trim(), position: i }))
        );
      }

      if (postKind === "survey" && postData) {
        for (let qi = 0; qi < surveyQuestions.length; qi++) {
          const q = surveyQuestions[qi];
          const { data: qData } = await supabase.from("survey_questions").insert({
            post_id: postData.id, question_text: q.text.trim(), position: qi,
          }).select("id").single();
          if (qData) {
            const filledOpts = q.options.filter((o) => o.text.trim());
            await supabase.from("survey_options").insert(
              filledOpts.map((o, oi) => ({ question_id: qData.id, option_text: o.text.trim(), position: oi }))
            );
          }
        }
      }

      setContent("");
      setCategory("text");
      setPostKind("normal");
      setAudience("public");
      setAttachment(null);
      setAttachmentPreviewUrl(null);
      setActiveDraftId(null);
      setScheduleDate(undefined);
      setShowSchedule(false);
      setMentionedUsers([]);
      setPollOptions([{ id: genId(), text: "" }, { id: genId(), text: "" }]);
      setSurveyQuestions([{ id: genId(), text: "", options: [{ id: genId(), text: "" }, { id: genId(), text: "" }] }]);
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success(scheduledAt ? "Post scheduled!" : "Post published!");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish post.");
    } finally {
      setSubmitting(false);
    }
  };

  if (canPost === null || !canPost) return null;

  // Investors can only post normal posts (no polls/surveys)
  const activePostKinds = isInvestorMode
    ? POST_KINDS.filter((k) => k.value === "normal")
    : POST_KINDS;

  const hashtags = extractHashtags(content);
  const charCount = content.length;
  const overLimit = charCount > MAX_CONTENT_LENGTH;
  const isScheduled = !!scheduleDate;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
        {/* Top row: Avatar + dropdowns */}
        <div className="flex items-center gap-3">
          <NetworkAvatar src={avatarUrl} initials={initials} size="sm" className="shrink-0" />

          <div className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {/* Post Type */}
            <Select value={postKind} onValueChange={(v) => v !== "more" && setPostKind(v)}>
              <SelectTrigger className={cn(
                "h-8 text-xs border-primary/20 bg-primary/5 text-primary font-medium",
                isMobile ? "w-9 px-0 justify-center [&>svg:last-child]:hidden" : isTablet ? "w-[90px]" : "w-[110px]"
              )}>
                {isMobile ? (
                  (() => { const K = activePostKinds.find(k => k.value === postKind); const Icon = K?.icon || FileText; return <Icon className="h-4 w-4" />; })()
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover border border-border shadow-lg">
                {activePostKinds.map((k) => {
                  const Icon = k.icon;
                  return (
                    <SelectItem key={k.value} value={k.value} disabled={k.disabled}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {k.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Category (Issuers/Intermediaries) or Query Category (Investors) */}
            {isInvestorMode ? (
              <Select value={queryCategory} onValueChange={setQueryCategory}>
                <SelectTrigger className={cn(
                  "h-8 text-xs border-investor/20 bg-investor/5 text-investor font-medium",
                  isMobile ? "w-9 px-0 justify-center [&>svg:last-child]:hidden" : isTablet ? "w-[110px]" : "w-[170px]"
                )}>
                  {isMobile ? (
                    (() => { const C = QUERY_CATEGORIES.find(c => c.value === queryCategory); const Icon = C?.icon || FileText; return <Icon className="h-4 w-4" />; })()
                  ) : isTablet ? (
                    <span className="flex items-center gap-1.5 truncate">
                      {(() => { const C = QUERY_CATEGORIES.find(c => c.value === queryCategory); const Icon = C?.icon || FileText; return <><Icon className="h-3.5 w-3.5 shrink-0" />{C?.shortLabel}</>; })()}
                    </span>
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover border border-border shadow-lg">
                  {QUERY_CATEGORIES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {t.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={cn(
                  "h-8 text-xs border-accent/20 bg-accent/5 text-foreground font-medium",
                  isMobile ? "w-9 px-0 justify-center [&>svg:last-child]:hidden" : isTablet ? "w-[110px]" : "w-[170px]"
                )}>
                  {isMobile ? (
                    (() => { const C = POST_CATEGORIES.find(c => c.value === category); const Icon = C?.icon || FileText; return <Icon className="h-4 w-4" />; })()
                  ) : isTablet ? (
                    <span className="flex items-center gap-1.5 truncate">
                      {(() => { const C = POST_CATEGORIES.find(c => c.value === category); const Icon = C?.icon || FileText; return <><Icon className="h-3.5 w-3.5 shrink-0" />{C?.shortLabel}</>; })()}
                    </span>
                  ) : (
                    <SelectValue />
                  )}
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover border border-border shadow-lg">
                  {POST_CATEGORIES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {t.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {/* Audience */}
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className={cn(
                "h-8 text-xs",
                isMobile ? "w-9 px-0 justify-center [&>svg:last-child]:hidden" : isTablet ? "w-[115px]" : "w-[155px]"
              )}>
                {isMobile ? (
                  (() => { const A = AUDIENCES.find(a => a.value === audience); const Icon = A?.icon || Globe; return <Icon className="h-4 w-4" />; })()
                ) : isTablet ? (
                  <span className="flex items-center gap-1.5 truncate">
                    {(() => { const A = AUDIENCES.find(a => a.value === audience); const Icon = A?.icon || Globe; return <><Icon className="h-3.5 w-3.5 shrink-0" />{A?.shortLabel}</>; })()}
                  </span>
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover border border-border shadow-lg">
                {AUDIENCES.map((a) => {
                  const Icon = a.icon;
                  return (
                    <SelectItem key={a.value} value={a.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {a.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content area */}
        <Textarea
          placeholder={getPlaceholder(postKind)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "resize-none text-sm border-none shadow-none focus-visible:ring-0 p-0",
            isMobile ? "min-h-[100px] text-base" : "min-h-[80px]"
          )}
          maxLength={MAX_CONTENT_LENGTH + 100}
        />

        {/* ── Poll options ── */}
        {postKind === "poll" && (
          <div className="space-y-2 rounded-lg border border-primary/15 bg-primary/[0.03] p-3">
            <p className="text-xs font-medium text-primary/70">Poll Options</p>
            {pollOptions.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...pollOptions];
                    next[i] = { ...next[i], text: e.target.value };
                    setPollOptions(next);
                  }}
                  className="h-8 text-xs"
                />
                {pollOptions.length > 2 && (
                  <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setPollOptions([...pollOptions, { id: genId(), text: "" }])}>
                <Plus className="h-3 w-3" /> Add Option
              </Button>
            )}
          </div>
        )}

        {/* ── Survey questions ── */}
        {postKind === "survey" && (
          <div className="space-y-3">
            {surveyQuestions.map((q, qi) => (
              <div key={q.id} className="rounded-lg border border-primary/15 bg-primary/[0.03] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Question ${qi + 1}`}
                    value={q.text}
                    onChange={(e) => {
                      const next = [...surveyQuestions];
                      next[qi] = { ...next[qi], text: e.target.value };
                      setSurveyQuestions(next);
                    }}
                    className="h-8 text-xs font-medium"
                  />
                  {surveyQuestions.length > 1 && (
                    <button onClick={() => setSurveyQuestions(surveyQuestions.filter((_, j) => j !== qi))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {q.options.map((opt, oi) => (
                  <div key={opt.id} className="flex items-center gap-2 pl-4">
                    <span className="text-[10px] text-muted-foreground w-4">{oi + 1}.</span>
                    <Input
                      placeholder={`Option ${oi + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...surveyQuestions];
                        const opts = [...next[qi].options];
                        opts[oi] = { ...opts[oi], text: e.target.value };
                        next[qi] = { ...next[qi], options: opts };
                        setSurveyQuestions(next);
                      }}
                      className="h-7 text-xs"
                    />
                    {q.options.length > 2 && (
                      <button onClick={() => {
                        const next = [...surveyQuestions];
                        next[qi] = { ...next[qi], options: next[qi].options.filter((_, j) => j !== oi) };
                        setSurveyQuestions(next);
                      }} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 ml-4" onClick={() => {
                    const next = [...surveyQuestions];
                    next[qi] = { ...next[qi], options: [...next[qi].options, { id: genId(), text: "" }] };
                    setSurveyQuestions(next);
                  }}>
                    <Plus className="h-3 w-3" /> Add Option
                  </Button>
                )}
              </div>
            ))}
            {surveyQuestions.length < 10 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                setSurveyQuestions([...surveyQuestions, { id: genId(), text: "", options: [{ id: genId(), text: "" }, { id: genId(), text: "" }] }]);
              }}>
                <Plus className="h-3 w-3" /> Add Question
              </Button>
            )}
          </div>
        )}

        {/* Mentioned users */}
        {mentionedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mentionedUsers.map((u) => (
              <Badge key={u.id} variant="secondary" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20">
                @{u.full_name}
                <button onClick={() => setMentionedUsers(mentionedUsers.filter((t) => t.id !== u.id))}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Mention search dropdown */}
        {showMentionInput && (
          <div className="relative">
            <Input
              placeholder="Search people to mention…"
              value={mentionSearch}
              onChange={(e) => setMentionSearch(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
            {mentionResults.length > 0 && (
              <div className="absolute top-9 left-0 right-0 z-50 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                {mentionResults.map((r) => (
                  <button
                    key={r.id}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/10 text-left"
                    onClick={() => {
                      if (!mentionedUsers.find((t) => t.id === r.id)) {
                        setMentionedUsers([...mentionedUsers, { id: r.id, full_name: r.full_name }]);
                      }
                      setMentionSearch("");
                      setMentionResults([]);
                      setShowMentionInput(false);
                    }}
                  >
                    {r.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Extracted hashtags preview */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent font-medium border-accent/20">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attachment preview */}
        {attachment && (
          <div className="rounded-lg border border-border bg-secondary/50 p-3 space-y-2">
            {/* Image thumbnail */}
            {attachmentPreviewUrl && (
              <div className="relative w-full max-h-48 rounded-md overflow-hidden bg-muted">
                <img
                  src={attachmentPreviewUrl}
                  alt="Preview"
                  className="w-full h-full max-h-48 object-cover rounded-md"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              {attachment.type.startsWith("image") ? (
                <Image className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <File className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-xs text-muted-foreground truncate flex-1">{attachment.name}</span>
              <span className="text-[10px] text-muted-foreground">{(attachment.size / 1024 / 1024).toFixed(1)}MB</span>
              <button onClick={() => { setAttachment(null); setAttachmentPreviewUrl(null); }} className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Schedule picker */}
        {showSchedule && (
          <div className="rounded-lg border border-accent/20 bg-accent/[0.04] p-3 space-y-2">
            <p className="text-xs font-medium text-accent">Schedule for later</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {scheduleDate ? format(scheduleDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="h-8 w-[110px] text-xs"
              />
              <button onClick={() => { setShowSchedule(false); setScheduleDate(undefined); }} className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border">
          {/* Character count */}
          <span className={cn(
            "text-[10px] tabular-nums mr-1",
            overLimit ? "text-destructive font-semibold" : charCount > MAX_CONTENT_LENGTH * 0.8 ? "text-destructive/70" : "text-muted-foreground"
          )}>
            {charCount}/{MAX_CONTENT_LENGTH}
          </span>

          {/* Attachment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="cursor-pointer text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-primary/5">
                <Paperclip className="h-4 w-4" />
                <input type="file" className="hidden" accept={getAcceptString()} onChange={handleFileChange} />
              </label>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Attach file (PDF, Images, DOCX · Max 10MB)
            </TooltipContent>
          </Tooltip>

          {/* Mention icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowMentionInput(!showMentionInput)}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  showMentionInput ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <AtSign className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Mention people</TooltipContent>
          </Tooltip>

          {/* Hashtag hint */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  if (!content.endsWith(" ") && content.length > 0) setContent(content + " #");
                  else setContent(content + "#");
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
              >
                <Hash className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Add hashtag — type #topic in your post</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Schedule icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  showSchedule ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                )}
              >
                <Clock className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Schedule for later</TooltipContent>
          </Tooltip>

          {/* Save Draft */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft || (!content.trim() && postKind === "normal")}
                className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
              >
                {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Save as draft</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            className={cn(
              "h-8 sm:h-9 px-3 sm:px-4 gap-1.5 font-medium text-xs sm:text-sm",
              isScheduled && "bg-accent hover:bg-accent/90 text-accent-foreground"
            )}
            disabled={!content.trim() || overLimit || submitting}
            onClick={handleSubmit}
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {isMobile ? "" : isScheduled ? "Post Later" : "Post Now"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
