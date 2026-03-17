import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, BookOpen, Code2, Server, Rocket, ChevronRight, Database, Shield, Zap, Layers, AlertTriangle, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ── Architecture Content (Public) ── */
const ArchitectureTab = () => (
  <div className="space-y-8">
    {/* System Overview */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`┌──────────────────────────────────────────────┐
│              React SPA (Vite)                │
│                                              │
│  Pages ──▶ Contexts ──▶ UI Components        │
│              │                               │
│         Custom Hooks (20+)                   │
│              │                               │
│        TanStack React Query                  │
│              │                               │
│         Supabase SDK                         │
└──────────────┼───────────────────────────────┘
               │
   ┌───────────┴───────────┐
   │    Lovable Cloud       │
   │  ├── PostgreSQL (30+)  │
   │  ├── Auth              │
   │  ├── Storage (5)       │
   │  ├── Edge Functions (4)│
   │  ├── Realtime          │
   │  └── RLS Policies      │
   └────────────────────────┘`}
        </pre>
      </CardContent>
    </Card>

    {/* Module Map */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-primary" />
          Module Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Module</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Route</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Hook(s)</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Components</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { module: "Feed", route: "/feed", hooks: "useFeedPosts, usePostInteractions, useDrafts, useScheduledPosts, useTrendingHashtags, useViralPosts", folder: "components/feed/" },
                { module: "Profile", route: "/profile", hooks: "useConnectionActions, usePostInteractions, useTabPrivacy, useProfileFlair", folder: "components/profile/" },
                { module: "Network", route: "/network", hooks: "useConnectionActions", folder: "components/network/" },
                { module: "Jobs", route: "/jobs", hooks: "useJobs (11 exports)", folder: "components/jobs/" },
                { module: "Events", route: "/events", hooks: "useEvents (9 exports)", folder: "components/events/" },
                { module: "Showcase", route: "/showcase", hooks: "useListings (8 exports)", folder: "components/directory/" },
                { module: "Vault", route: "/vault", hooks: "useVault", folder: "components/vault/" },
                { module: "Gamification", route: "/leaderboard", hooks: "useGamification, useProfileFlair", folder: "components/gamification/" },
                { module: "Blog", route: "/blog", hooks: "useBlogPosts, useBlogInteractions", folder: "components/blog/" },
                { module: "Admin", route: "/admin", hooks: "useAdmin (8 exports), useInvitations", folder: "components/admin/" },
              ].map((row) => (
                <tr key={row.module} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">{row.module}</td>
                  <td className="py-2.5 px-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.route}</code></td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">{row.hooks}</td>
                  <td className="py-2.5 px-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.folder}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Data Flow Patterns */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Data Flow Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {[
          {
            title: "Standard CRUD",
            desc: "Jobs, Events, Listings",
            flow: "Page → useQuery → supabase.from().select() → batch profiles → useMutation → invalidateQueries → toast",
          },
          {
            title: "Optimistic Updates",
            desc: "Feed Interactions (Like, Bookmark)",
            flow: "Click → setLiked(true) → patch TanStack cache → insert to DB → on error: rollback + toast.error()",
          },
          {
            title: "Batch Loading",
            desc: "Post Interactions (50ms debounce)",
            flow: "10 PostCards mount → queue requests for 50ms → single DB query WHERE post_id IN (...) → dispatch results",
          },
          {
            title: "Infinite Scroll",
            desc: "Feed pagination",
            flow: "useInfiniteQuery → get_feed_posts RPC → PAGE_SIZE=15 → IntersectionObserver → fetchNextPage",
          },
          {
            title: "Realtime",
            desc: "Messages, Notifications",
            flow: "Initial load → supabase.channel() → postgres_changes INSERT → prepend to state + increment count",
          },
        ].map((pattern) => (
          <div key={pattern.title} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">{pattern.title}</h4>
              <Badge variant="secondary" className="text-[10px]">{pattern.desc}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono bg-muted/40 rounded-md px-3 py-2">{pattern.flow}</p>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Database Tables & Functions */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-primary" />
          Database Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">40+ tables organized across 8 domains with RLS policies on every table.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { domain: "User", tables: "profiles, user_roles, active_sessions, user_settings, profile_views, endorsements, card_exchanges, profile_tab_privacy, profile_flair" },
            { domain: "Content", tables: "posts, comments, post_interactions, poll_options, poll_votes, survey_questions, survey_options, survey_responses, featured_posts, post_drafts" },
            { domain: "Jobs", tables: "jobs, job_applications, saved_jobs" },
            { domain: "Events", tables: "events, event_registrations, event_speakers" },
            { domain: "Showcase", tables: "listings, listing_reviews, listing_enquiries" },
            { domain: "Gamification", tables: "user_xp, xp_transactions, badge_definitions, user_badges, weekly_challenges, user_challenge_progress, social_proof_events, referral_links, referral_conversions" },
            { domain: "Blog", tables: "blog_posts, blog_poll_options, blog_poll_votes, blog_survey_questions, blog_survey_options, blog_survey_responses" },
            { domain: "Platform", tables: "messages, notifications, connections, reports, file_uploads, invitations, registry_entities, campaigns, sales_leads, support_tickets" },
          ].map((d) => (
            <div key={d.domain} className="border border-border rounded-lg p-3">
              <h4 className="text-sm font-semibold text-foreground mb-1">{d.domain}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{d.tables}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

/* ── Getting Started Content (Public) ── */
const GettingStartedTab = () => (
  <div className="space-y-8">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-primary" />
          Quick Start
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto">
{`# Clone the repo
git clone <YOUR_GIT_URL>
cd findoo

# Install dependencies
npm install   # or: bun install

# Start dev server
npm run dev   # or: bun dev`}
        </pre>
        <p className="text-sm text-muted-foreground">
          The app opens at <code className="bg-muted px-1.5 py-0.5 rounded text-xs">http://localhost:5173</code>. 
          Backend is automatically connected via Lovable Cloud.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tech Stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { layer: "Framework", tech: "React 18 + TypeScript" },
            { layer: "Build", tech: "Vite" },
            { layer: "Styling", tech: "Tailwind CSS + shadcn/ui" },
            { layer: "State", tech: "TanStack React Query" },
            { layer: "Routing", tech: "React Router v6" },
            { layer: "Animation", tech: "Framer Motion" },
            { layer: "Backend", tech: "Lovable Cloud (Supabase)" },
            { layer: "Auth", tech: "Email + Password" },
          ].map((item) => (
            <div key={item.layer} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
              <span className="text-xs font-semibold text-foreground w-20 shrink-0">{item.layer}</span>
              <span className="text-xs text-muted-foreground">{item.tech}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Conventions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { title: "Components", rule: "PascalCase (PostCard.tsx). Each module has its own folder under src/components/." },
          { title: "Hooks", rule: "camelCase with 'use' prefix (useJobs.ts). One hook file per module. TanStack useQuery for reads, useMutation for writes." },
          { title: "State", rule: "Server state via React Query. Auth/role via RoleContext. Local state only for UI-specific concerns. No Redux/Zustand." },
          { title: "Design System", rule: "Never use raw color values. All colors via HSL CSS custom properties. Both light and dark modes supported." },
          { title: "Error Handling", rule: "Always include toast.error() in onError callbacks. Optimistic updates must implement rollback." },
        ].map((conv) => (
          <div key={conv.title} className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">{conv.title}</h4>
            <p className="text-xs text-muted-foreground">{conv.rule}</p>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto">
{`# Run all tests
npm test

# Run specific test file
npx vitest run src/test/useFeedPosts.test.ts`}
        </pre>
        <p className="text-sm text-muted-foreground">
          20+ unit tests using Vitest covering feed normalization, optimistic updates, connection state transitions, and session management.
        </p>
      </CardContent>
    </Card>
  </div>
);

/* ── Protected Content Wrapper (Admin-only) ── */
const ProtectedSection = ({ children, label }: { children: React.ReactNode; label: string }) => {
  const [access, setAccess] = useState<"loading" | "denied" | "no-auth" | "granted">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAccess("no-auth");
        return;
      }
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      setAccess(data ? "granted" : "denied");
    });
  }, []);

  if (access === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (access === "no-auth") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-semibold text-foreground">Authentication Required</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The {label} section is restricted to platform administrators. Please sign in first.
            </p>
          </div>
          <a href="/auth" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Sign In <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>
    );
  }

  if (access === "denied") {
    return (
      <Card className="border-dashed border-destructive/30">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-semibold text-foreground">Admin Access Only</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The {label} section contains sensitive technical details and is restricted to administrators.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

/* ── API Reference Content (Protected) ── */
const ApiReferenceTab = () => (
  <ProtectedSection label="API Reference">
    <div className="space-y-8">
      {/* Feed Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feed Hooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <HookDoc
            name="useFeedPosts()"
            file="src/hooks/useFeedPosts.ts"
            desc="Infinite-scroll feed data using get_feed_posts RPC."
            returns={[
              { name: "flatPosts", type: "FeedPost[]", desc: "Flattened array of all loaded pages" },
              { name: "fetchNextPage", type: "() => void", desc: "Load next 15 posts" },
              { name: "hasNextPage", type: "boolean", desc: "Whether more pages are available" },
              { name: "isLoading", type: "boolean", desc: "Initial load state" },
            ]}
          />
          <HookDoc
            name="usePostInteractions(postId)"
            file="src/hooks/usePostInteractions.ts"
            desc="Like/bookmark state with optimistic updates and 50ms batch loading."
            returns={[
              { name: "liked", type: "boolean", desc: "Whether current user liked the post" },
              { name: "bookmarked", type: "boolean", desc: "Whether current user bookmarked the post" },
              { name: "toggleLike", type: "() => void", desc: "Toggle like with optimistic update" },
              { name: "toggleBookmark", type: "() => void", desc: "Toggle bookmark with optimistic update" },
            ]}
          />
          <HookDoc
            name="useTrendingPosts()"
            file="src/hooks/useTrendingPosts.ts"
            desc="Posts from the last 7 days containing top 5 most-used hashtags. staleTime: 60s."
            returns={[{ name: "data", type: "FeedPost[]", desc: "Sorted by trending hashtag frequency" }]}
          />
          <HookDoc
            name="useDrafts(userId)"
            file="src/hooks/useDrafts.ts"
            desc="CRUD for post drafts stored in post_drafts table."
            returns={[
              { name: "drafts", type: "PostDraft[]", desc: "List of user drafts" },
              { name: "saveDraft", type: "(data) => string | null", desc: "Save/update a draft" },
              { name: "deleteDraft", type: "(id) => void", desc: "Delete a draft" },
            ]}
          />
        </CardContent>
      </Card>

      {/* Job Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Hooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <HookDoc
            name="useJobs(filters?)"
            file="src/hooks/useJobs.ts"
            desc="Filterable job listings with poster profiles. 11 exports total."
            returns={[
              { name: "data", type: "Job[]", desc: "Filtered job listings" },
              { name: "isLoading", type: "boolean", desc: "Loading state" },
            ]}
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Additional exports:</p>
            {["useJob(id)", "useMyPostedJobs()", "useMyApplications()", "useJobApplications(jobId)", "useSavedJobs()", "useCreateJob()", "useUpdateJob()", "useApplyToJob()", "useToggleSaveJob()", "useUpdateApplicationStatus()"].map(h => (
              <p key={h} className="font-mono">• {h}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Event Hooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <HookDoc
            name="useEvents(filters?)"
            file="src/hooks/useEvents.ts"
            desc="Event listings with organizer profiles and user registration status. 9 exports."
            returns={[
              { name: "data", type: "EventData[]", desc: "Filtered events with organizer info" },
            ]}
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Additional exports:</p>
            {["useMyEvents()", "useMyRegistrations()", "useEventSpeakers(eventId)", "useEventRegistrations(eventId)", "useCreateEvent()", "useUpdateEvent()", "useRegisterForEvent()", "useCancelRegistration()"].map(h => (
              <p key={h} className="font-mono">• {h}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Showcase, Vault, Network, Gamification, Privacy, Notification, Admin, Utility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Other Hooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <HookDoc
            name="useListings(filters?)"
            file="src/hooks/useListings.ts"
            desc="Showcase listings with owner profiles. 8 exports including reviews and enquiries."
            returns={[{ name: "data", type: "Listing[]", desc: "Filtered listings" }]}
          />
          <HookDoc
            name="useVault(userId)"
            file="src/hooks/useVault.ts"
            desc="Secure document storage with share links and verification sync."
            returns={[
              { name: "files", type: "VaultFile[]", desc: "User's vault files" },
              { name: "uploadFile", type: "(file, category, desc?, tags?) => VaultFile | null", desc: "Upload to vault" },
              { name: "toggleShare", type: "(fileId, shared) => void", desc: "Toggle share link" },
            ]}
          />
          <HookDoc
            name="useConnectionActions(myId, theirId)"
            file="src/hooks/useConnectionActions.ts"
            desc="Follow/connect/disconnect with optimistic status tracking."
            returns={[
              { name: "connectionStatus", type: "{ following, connected }", desc: "Current relationship state" },
              { name: "follow/unfollow/connect/disconnect", type: "() => Promise<void>", desc: "Mutation actions" },
            ]}
          />
          <HookDoc
            name="useTabPrivacy(userId)"
            file="src/hooks/useTabPrivacy.ts"
            desc="Per-tab visibility settings for Activity, Network & Vault tabs. Supports Everyone, Logged-in, Connections, Only Me."
            returns={[
              { name: "settings", type: "TabPrivacySettings", desc: "Current visibility settings per tab" },
              { name: "updateSettings", type: "(settings) => Promise<void>", desc: "Upsert new visibility settings" },
              { name: "isSaving", type: "boolean", desc: "Mutation pending state" },
            ]}
          />
          <HookDoc
            name="useGamification(userId)"
            file="src/hooks/useGamification.ts"
            desc="XP, level, streak, badges, weekly challenges — full gamification state for a user."
            returns={[
              { name: "xpData", type: "UserXP", desc: "Total XP, level, streak, multiplier" },
              { name: "badges", type: "UserBadge[]", desc: "Earned badges with definitions" },
              { name: "challenges", type: "ChallengeProgress[]", desc: "Weekly challenge progress" },
            ]}
          />
          <HookDoc
            name="useProfileFlair(userId)"
            file="src/hooks/useProfileFlair.ts"
            desc="Profile flair (avatar border, name effect, theme) auto-assigned at Level 3+."
            returns={[{ name: "flair", type: "ProfileFlair", desc: "Current flair settings (border, effect, theme)" }]}
          />
          <HookDoc
            name="useNotifications()"
            file="src/hooks/useNotifications.ts"
            desc="Realtime notifications with auto-subscription to postgres_changes INSERT."
            returns={[
              { name: "notifications", type: "Notification[]", desc: "50 most recent" },
              { name: "unreadCount", type: "number", desc: "Unread count" },
              { name: "markAsRead/markAllAsRead", type: "() => void", desc: "Mark operations" },
            ]}
          />
          <HookDoc
            name="useIsAdmin()"
            file="src/hooks/useAdmin.ts"
            desc="Admin role check + verification queue, reports, user management. 8 exports."
            returns={[{ name: "isAdmin", type: "boolean", desc: "Whether current user has admin role" }]}
          />
          <HookDoc
            name="usePageMeta({ title, description })"
            file="src/hooks/usePageMeta.ts"
            desc="Sets document.title and OG/Twitter meta tags. Resets on unmount."
            returns={[]}
          />
        </CardContent>
      </Card>

      {/* Library Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Library Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "src/lib/storage.ts", exports: "validateFile(), uploadFile(), deleteFile()", desc: "File upload via upload-file edge function with client-side validation." },
            { name: "src/lib/session-manager.ts", exports: "registerSession(), removeSession(), touchSession()", desc: "Multi-device session management (max 3 concurrent). Heartbeat every 5min." },
            { name: "src/lib/gamification.ts", exports: "LEVEL_CONFIG, getLevelConfig(), getXPProgress(), TIER_COLORS, BADGE_CATEGORY_LABELS", desc: "Gamification constants: 5-tier level config, XP thresholds, badge categories & tier colors." },
            { name: "src/lib/profile-flair.ts", exports: "getFlairStyles(), getNameEffectClass(), getBorderClass()", desc: "Profile flair rendering: avatar borders (fire/diamond/legendary), name effects (glow/shimmer)." },
            { name: "src/lib/role-config.ts", exports: "ROLE_CONFIG, getRoleIcon(), getRoleBadgeClasses()", desc: "Role metadata: labels, icons, colors, CSS variables." },
            { name: "src/lib/vcard.ts", exports: "generateVCard(), downloadVCard()", desc: "vCard (.vcf) generation for digital business cards." },
            { name: "src/lib/sanitize.ts", exports: "sanitizeText(), sanitizeHtml()", desc: "Input sanitization for user-generated content to prevent XSS." },
            { name: "src/lib/throttle.ts", exports: "throttle()", desc: "Generic throttle utility for rate-limiting client-side operations." },
          ].map((mod) => (
            <div key={mod.name} className="space-y-1 p-3 rounded-lg bg-muted/30">
              <code className="text-xs font-semibold text-foreground">{mod.name}</code>
              <p className="text-xs text-muted-foreground">{mod.desc}</p>
              <p className="text-[11px] font-mono text-primary/80">{mod.exports}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </ProtectedSection>
);

/* ── Edge Functions Content (Protected) ── */
const EdgeFunctionsTab = () => (
  <ProtectedSection label="Edge Functions">
    <div className="space-y-6">
      {[
        {
          name: "upload-file",
          auth: true,
          trigger: "HTTP POST",
          purpose: "Secure file upload with MIME validation and size limits (10MB max).",
          request: "POST /functions/v1/upload-file\nAuthorization: Bearer <token>\nContent-Type: multipart/form-data\n\nFields: file (required), bucket (required)",
          response: '{ "url": "...", "path": "userId/timestamp_file.ext", "file_name": "doc.pdf", "file_type": "application/pdf", "file_size": 1048576 }',
          buckets: "avatars (JPEG/PNG/WebP), banners (JPEG/PNG/WebP), verification-docs (PDF/JPEG/PNG/WebP), resumes (PDF/DOCX)",
        },
        {
          name: "publish-scheduled-posts",
          auth: false,
          trigger: "Cron / Manual",
          purpose: "Finds posts where scheduled_at <= now() and clears the timestamp to publish them.",
          request: "POST /functions/v1/publish-scheduled-posts\n(No auth header — uses service key internally)",
          response: '{ "message": "Published scheduled posts", "count": 3, "ids": ["uuid-1", ...] }',
          buckets: null,
        },
        {
          name: "seed-users",
          auth: false,
          trigger: "Manual (dev only)",
          purpose: "Creates 8 sample BFSI users with realistic profiles and roles. Password: Test@1234",
          request: "POST /functions/v1/seed-users",
          response: '{ "success": true, "results": [{ "email": "...", "status": "created", "roles": [...] }] }',
          buckets: null,
        },
        {
          name: "seed-data",
          auth: false,
          trigger: "Manual (dev only)",
          purpose: "Seeds posts, jobs, events, listings, connections, messages. Run seed-users first.",
          request: "POST /functions/v1/seed-data",
          response: '{ "success": true, "seeded": { "posts": 19, "jobs": 8, "events": 7, "listings": 8, ... } }',
          buckets: null,
        },
      ].map((fn) => (
        <Card key={fn.name}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg font-mono">{fn.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={fn.auth ? "default" : "secondary"} className="text-[10px]">
                  {fn.auth ? "Auth Required" : "Service Key"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{fn.trigger}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{fn.purpose}</p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Request</p>
              <pre className="bg-muted/50 border border-border rounded-lg p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">{fn.request}</pre>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Response (200)</p>
              <pre className="bg-muted/50 border border-border rounded-lg p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">{fn.response}</pre>
            </div>
            {fn.buckets && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Allowed Buckets</p>
                <p className="text-xs text-muted-foreground">{fn.buckets}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </ProtectedSection>
);

/* ── Hook Documentation Component ── */
const HookDoc = ({
  name,
  file,
  desc,
  returns,
}: {
  name: string;
  file: string;
  desc: string;
  returns: { name: string; type: string; desc: string }[];
}) => (
  <div className="space-y-2 pb-4 border-b border-border last:border-0 last:pb-0">
    <div className="flex flex-wrap items-center gap-2">
      <code className="text-sm font-bold text-foreground">{name}</code>
      <Badge variant="outline" className="text-[10px] font-mono">{file}</Badge>
    </div>
    <p className="text-xs text-muted-foreground">{desc}</p>
    {returns.length > 0 && (
      <div className="overflow-x-auto">
        <table className="w-full text-xs mt-1">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Return</th>
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Type</th>
              <th className="text-left py-1.5 px-2 font-medium text-muted-foreground">Description</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.name} className="border-b border-border/50">
                <td className="py-1.5 px-2 font-mono text-foreground">{r.name}</td>
                <td className="py-1.5 px-2 font-mono text-primary/80">{r.type}</td>
                <td className="py-1.5 px-2 text-muted-foreground">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ── Troubleshooting Content (Public) ── */
const TroubleshootingTab = () => (
  <div className="space-y-6">
    {[
      {
        title: "RLS Policy Error: \"new row violates row-level security policy\"",
        severity: "error",
        symptoms: ["Insert/update fails silently or throws RLS error", "Data appears in DB but can't be read back"],
        causes: [
          "Missing or incorrect user_id in the insert statement",
          "User is not authenticated when performing the operation",
          "RLS policy uses a column that's nullable — ensure user_id is NOT NULL",
        ],
        fixes: [
          "Verify auth.uid() matches the user_id column in your insert: .insert({ user_id: session.user.id, ... })",
          "Check that the user is logged in before performing mutations",
          "Review the RLS policy in Lovable Cloud → Database → RLS Policies",
        ],
      },
      {
        title: "Realtime Subscription Not Receiving Events",
        severity: "warning",
        symptoms: ["Channel subscribes successfully but no events fire", "Works in one table but not another"],
        causes: [
          "Table not added to the supabase_realtime publication",
          "RLS policy blocks SELECT for the subscribing user",
          "Channel name collision (two subscriptions with same name)",
        ],
        fixes: [
          "Add table to publication: ALTER PUBLICATION supabase_realtime ADD TABLE public.your_table;",
          "Verify RLS allows SELECT for the authenticated user",
          "Use unique channel names: supabase.channel('my-unique-channel-name')",
          "Clean up channels on unmount: return () => supabase.removeChannel(channel);",
        ],
      },
      {
        title: "Infinite Re-renders / Performance Issues",
        severity: "warning",
        symptoms: ["Component keeps re-rendering", "Browser becomes unresponsive", "React DevTools shows excessive renders"],
        causes: [
          "Creating new objects/arrays in render (breaks reference equality)",
          "Missing useCallback/useMemo on expensive computations",
          "Passing inline functions as props to memoized components",
        ],
        fixes: [
          "Wrap callbacks in useCallback: const handleClick = useCallback(() => {...}, [deps]);",
          "Memoize derived data: const filtered = useMemo(() => items.filter(...), [items]);",
          "Use React.memo on card components (PostCard, JobCard, EventCard, ListingCard)",
          "Move static arrays/objects outside the component body",
        ],
      },
      {
        title: "Stale Data After Mutation",
        severity: "info",
        symptoms: ["UI doesn't update after creating/updating/deleting", "Data appears after page refresh but not immediately"],
        causes: [
          "Missing query invalidation in mutation onSuccess",
          "Query key mismatch between invalidation and the query",
          "Using broad invalidation that misses nested query keys",
        ],
        fixes: [
          "Invalidate specific query keys: queryClient.invalidateQueries({ queryKey: ['jobs'] });",
          "For optimistic updates, use queryClient.setQueryData to patch cache directly",
          "Check that query keys match exactly — ['jobs', filters] won't match ['jobs'] invalidation unless using exact: false",
        ],
      },
      {
        title: "Auth Session Lost / Redirect to Login",
        severity: "error",
        symptoms: ["User gets logged out unexpectedly", "API calls return 401", "Redirect to /auth on page refresh"],
        causes: [
          "Calling supabase.auth.getSession() during render (should be in useEffect)",
          "Multiple Supabase client instances (should import from @/integrations/supabase/client)",
          "localStorage cleared or session cookie expired",
        ],
        fixes: [
          "Use supabase.auth.getSession() only in useEffect or event handlers",
          "Always import { supabase } from '@/integrations/supabase/client' — never create new clients",
          "The client auto-refreshes tokens; don't manually manage refresh tokens",
          "Check ProtectedRoute.tsx for the auth guard flow",
        ],
      },
      {
        title: "TypeScript Errors with Database Types",
        severity: "info",
        symptoms: ["Type 'X' is not assignable to type 'Y'", "Property does not exist on type 'Database'"],
        causes: [
          "Database schema changed but types.ts hasn't regenerated",
          "Manually editing types.ts (it's auto-generated)",
          "Using wrong table/column names",
        ],
        fixes: [
          "Never edit src/integrations/supabase/types.ts — it regenerates automatically",
          "Use the Tables, TablesInsert, TablesUpdate helper types from types.ts",
          "After schema changes, the types file will update automatically on next sync",
        ],
      },
      {
        title: "File Upload Fails",
        severity: "warning",
        symptoms: ["Upload returns 400 or 500", "File appears to upload but URL is broken"],
        causes: [
          "File exceeds 10MB size limit",
          "MIME type not allowed for the target bucket",
          "User not authenticated (upload-file edge function requires Bearer token)",
        ],
        fixes: [
          "Use validateFile() from src/lib/storage.ts before uploading",
          "Check allowed types: avatars/banners (JPEG/PNG/WebP), verification-docs (PDF/JPEG/PNG/WebP)",
          "Ensure user is logged in — the edge function extracts user ID from the auth token",
          "Check edge function logs in Lovable Cloud for detailed error messages",
        ],
      },
    ].map((issue) => (
      <Card key={issue.title}>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              issue.severity === "error" ? "bg-destructive/10 text-destructive" :
              issue.severity === "warning" ? "bg-gold/10 text-gold" :
              "bg-primary/10 text-primary"
            }`}>
              {issue.severity === "error" ? <Bug className="h-4 w-4" /> :
               issue.severity === "warning" ? <AlertTriangle className="h-4 w-4" /> :
               <Code2 className="h-4 w-4" />}
            </div>
            <CardTitle className="text-base leading-snug">{issue.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">Symptoms</p>
            <ul className="space-y-1">
              {issue.symptoms.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-destructive/60 mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">Common Causes</p>
            <ul className="space-y-1">
              {issue.causes.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-gold/60 mt-0.5">•</span> {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">How to Fix</p>
            <ul className="space-y-1.5">
              {issue.fixes.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary/60 mt-0.5">✓</span>
                  <code className="bg-muted/50 px-1 py-0.5 rounded text-[11px] break-all">{f}</code>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

/* ── Tab config ── */
const tabs = [
  { id: "architecture", label: "Architecture", icon: Layers, isPublic: true },
  { id: "getting-started", label: "Getting Started", icon: Rocket, isPublic: true },
  { id: "api-reference", label: "API Reference", icon: Code2, isPublic: false },
  { id: "edge-functions", label: "Edge Functions", icon: Server, isPublic: false },
  { id: "troubleshooting", label: "Troubleshooting", icon: Bug, isPublic: true },
];

const tabContentMap: Record<string, React.FC> = {
  "architecture": ArchitectureTab,
  "getting-started": GettingStartedTab,
  "api-reference": ApiReferenceTab,
  "edge-functions": EdgeFunctionsTab,
  "troubleshooting": TroubleshootingTab,
};

/* ── Main Page ── */
const DeveloperDocs = () => {
  usePageMeta({
    title: "Developer Documentation",
    description: "FindOO developer documentation — architecture, API reference, edge functions, and getting started guide.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "architecture";
  const loggedTabs = useRef<Set<string>>(new Set());

  // Log doc access for audit trail
  useEffect(() => {
    if (loggedTabs.current.has(activeTab)) return;
    loggedTabs.current.add(activeTab);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("audit_logs").insert({
        user_id: session.user.id,
        action: "view_docs",
        resource_type: "developer_docs",
        resource_id: activeTab,
        metadata: { tab: activeTab },
      }).then(() => {});
    });
  }, [activeTab]);

  const Content = tabContentMap[activeTab] || ArchitectureTab;

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Developer Docs"
        title="Developer"
        titleAccent="Documentation"
        subtitle="Architecture guides, API references, and everything you need to build on FindOO."
        variant="dots"
      />

      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {!tab.isPublic && (
                <Lock className="h-3 w-3 text-muted-foreground/60 ml-0.5" />
              )}
              {activeTab === tab.id && (
                <motion.div layoutId="devdocs-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="py-10">
        <div className="container max-w-5xl">
          <Content />
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default DeveloperDocs;
