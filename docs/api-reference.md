# FindOO — API Reference

> Complete reference for all custom hooks, library modules, and key components.

---

## Table of Contents

- [Feed Hooks](#feed-hooks)
- [Job Hooks](#job-hooks)
- [Event Hooks](#event-hooks)
- [Directory Hooks](#directory-hooks)
- [Vault Hook](#vault-hook)
- [Network Hook](#network-hook)
- [Notification Hook](#notification-hook)
- [Admin Hooks](#admin-hooks)
- [Blog Hooks](#blog-hooks)
- [Utility Hooks](#utility-hooks)
- [Library Modules](#library-modules)

---

## Feed Hooks

### `useFeedPosts()`
**File:** `src/hooks/useFeedPosts.ts`

Infinite-scroll feed data using `get_feed_posts` RPC.

```ts
const { flatPosts, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeedPosts();
```

| Return           | Type            | Description                              |
| ---------------- | --------------- | ---------------------------------------- |
| `flatPosts`      | `FeedPost[]`    | Flattened array of all loaded pages      |
| `fetchNextPage`  | `() => void`    | Load next 15 posts                       |
| `hasNextPage`    | `boolean`       | Whether more pages are available         |
| `isLoading`      | `boolean`       | Initial load state                       |

**FeedPost shape:**
```ts
interface FeedPost {
  id: string; content: string; post_type: string; post_kind?: string;
  query_category: string | null; hashtags: string[] | null;
  attachment_url/name/type: string | null; created_at: string;
  author: { id, full_name, display_name, avatar_url, verification_status };
  roles: { role: string; sub_type: string | null }[];
  like_count: number; comment_count: number; bookmark_count: number;
}
```

---

### `usePostInteractions(postId: string)`
**File:** `src/hooks/usePostInteractions.ts`

Like/bookmark state with optimistic updates and batch loading.

```ts
const { liked, bookmarked, toggleLike, toggleBookmark, currentUserId } = usePostInteractions(postId);
```

| Return           | Type         | Description                                 |
| ---------------- | ------------ | ------------------------------------------- |
| `liked`          | `boolean`    | Whether current user has liked the post      |
| `bookmarked`     | `boolean`    | Whether current user has bookmarked the post |
| `toggleLike`     | `() => void` | Toggle like with optimistic update           |
| `toggleBookmark` | `() => void` | Toggle bookmark with optimistic update       |

**Key pattern:** Uses a 50ms batch debounce to coalesce interaction checks from multiple PostCard instances into a single DB query.

---

### `useTrendingPosts()`
**File:** `src/hooks/useTrendingPosts.ts`

Posts from the last 7 days that contain the top 5 most-used hashtags.

```ts
const { data: posts, isLoading } = useTrendingPosts();
```

Returns `FeedPost[]` sorted by trending hashtag frequency. `staleTime: 60s`.

---

### `useViralPosts()`
**File:** `src/hooks/useViralPosts.ts`

Posts from the last 7 days sorted by engagement score (`likes + comments × 2`).

```ts
const { data: posts, isLoading } = useViralPosts();
```

Returns `FeedPost[]`. `staleTime: 60s`.

---

### `useTrendingHashtags(days?: number)`
**File:** `src/hooks/useTrendingHashtags.ts`

Top 10 hashtags by frequency over the given window.

```ts
const { data: hashtags } = useTrendingHashtags(7);
// hashtags: { tag: string; count: number }[]
```

---

### `useDrafts(userId: string | null)`
**File:** `src/hooks/useDrafts.ts`

CRUD for post drafts stored in `post_drafts` table.

```ts
const { drafts, loading, loadDrafts, saveDraft, deleteDraft } = useDrafts(userId);
```

| Method         | Params                                     | Returns         |
| -------------- | ------------------------------------------ | --------------- |
| `loadDrafts()` | —                                          | Refreshes list  |
| `saveDraft()`  | `Partial<PostDraft> & { id?: string }`     | `string \| null` (draft ID) |
| `deleteDraft()`| `draftId: string`                          | —               |

---

### `useScheduledPosts(userId: string | null)`
**File:** `src/hooks/useScheduledPosts.ts`

Manages posts with a future `scheduled_at` timestamp.

```ts
const { data, cancelPost, publishNow, isLoading } = useScheduledPosts(userId);
```

| Method             | Params            | Description                          |
| ------------------ | ----------------- | ------------------------------------ |
| `cancelPost.mutate` | `postId: string` | Deletes the scheduled post           |
| `publishNow.mutate` | `postId: string` | Clears `scheduled_at` → goes live    |

---

## Job Hooks

### `useJobs(filters?)`
**File:** `src/hooks/useJobs.ts`

```ts
const { data: jobs, isLoading } = useJobs({ category: "fund_management", type: "full_time", search: "analyst" });
```

| Filter     | Type     | Description                     |
| ---------- | -------- | ------------------------------- |
| `category` | `string` | Job category enum value         |
| `type`     | `string` | Job type enum value             |
| `location` | `string` | Location substring match        |
| `search`   | `string` | Title/company/description match |

### `useJob(id: string)`
Single job with poster profile. Returns `Job`.

### `useMyPostedJobs()`
Jobs posted by the current user. Returns `Job[]`.

### `useMyApplications()`
Current user's applications with joined job data. Returns `JobApplication[]`.

### `useJobApplications(jobId: string)`
All applications for a specific job (employer view). Returns `JobApplication[]`.

### `useSavedJobs()`
List of saved job IDs. Returns `string[]`.

### `useCreateJob()`, `useUpdateJob()`
Mutations with auto-invalidation and toast feedback.

### `useApplyToJob()`
Submit application. Detects duplicate applications.

### `useToggleSaveJob()`
Save/unsave a job. Params: `{ jobId: string; saved: boolean }`.

### `useUpdateApplicationStatus()`
Employer updates application status. Params: `{ id, status, employer_notes? }`.

---

## Event Hooks

### `useEvents(filters?)`
**File:** `src/hooks/useEvents.ts`

```ts
const { data: events } = useEvents({ category: "webinar", mode: "virtual", search: "fintech", upcoming: true });
```

Returns `EventData[]` with organizer profiles and user registration status.

### `useMyEvents()`
Events organized by the current user.

### `useMyRegistrations()`
Current user's event registrations + event details.

### `useEventSpeakers(eventId)`
Speakers for a specific event. Returns `EventSpeaker[]`.

### `useEventRegistrations(eventId)`
All registrations for an event (organizer view) with user profiles.

### `useCreateEvent()`, `useUpdateEvent()`
Mutations with role-based RLS (issuer/intermediary/admin only).

### `useRegisterForEvent()`, `useCancelRegistration()`
Registration mutations with duplicate detection.

---

## Directory Hooks

### `useListings(filters?)`
**File:** `src/hooks/useListings.ts`

```ts
const { data: listings } = useListings({ type: "product", category: "mutual_fund", search: "SBI" });
```

Returns `Listing[]` with owner profiles.

### `useMyListings()`
Listings created by the current user.

### `useListingReviews(listingId)`
Reviews for a specific listing with reviewer profiles.

### `useCreateListing()`, `useUpdateListing()`
Mutations (issuer/intermediary/admin only via RLS).

### `useSubmitReview()`
Submit a review. Params: `{ listing_id, rating, review_text }`. Self-review prevented by RLS.

### `useSubmitEnquiry()`
Send an enquiry. Params: `{ listing_id, message }`.

---

## Vault Hook

### `useVault(userId: string | null)`
**File:** `src/hooks/useVault.ts`

Secure document storage with share links and verification sync.

```ts
const { files, loading, uploadFile, deleteFile, toggleShare, getSignedUrl, syncVerificationDocs } = useVault(userId);
```

| Method                | Params                                          | Returns              |
| --------------------- | ----------------------------------------------- | -------------------- |
| `uploadFile`          | `file, category, description?, tags?`           | `VaultFile \| null`  |
| `deleteFile`          | `fileId, filePath`                              | —                    |
| `toggleShare`         | `fileId, currentlyShared`                       | —                    |
| `getSignedUrl`        | `filePath`                                      | `string \| null`     |
| `syncVerificationDocs`| —                                               | —                    |

**Categories:** `kyc`, `tax`, `verification`, `certificates`, `media`, `other`

---

## Network Hook

### `useConnectionActions(currentUserId, targetUserId)`
**File:** `src/hooks/useConnectionActions.ts`

```ts
const { connectionStatus, follow, unfollow, connect, disconnect, loading } = useConnectionActions(myId, theirId);
```

| Return             | Type                                    | Description                       |
| ------------------ | --------------------------------------- | --------------------------------- |
| `connectionStatus` | `{ following: boolean; connected: "none" \| "pending" \| "accepted" }` | Current relationship state |
| `follow`           | `() => Promise<void>`                   | Follow user                       |
| `unfollow`         | `() => Promise<void>`                   | Unfollow user                     |
| `connect`          | `() => Promise<void>`                   | Send connection request           |
| `disconnect`       | `() => Promise<void>`                   | Remove connection (either side)   |

---

## Notification Hook

### `useNotifications()`
**File:** `src/hooks/useNotifications.ts`

Realtime notifications with auto-subscription.

```ts
const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
```

- Subscribes to `postgres_changes` INSERT on notifications table
- Auto-fetches actor profiles for display
- Limits to 50 most recent notifications

---

## Admin Hooks

**File:** `src/hooks/useAdmin.ts`

### `useIsAdmin()`
Returns `boolean`. Checks `has_role(uid, 'admin')` RPC. `staleTime: 60s`.

### `useVerificationQueue()`
All verification requests with user profiles and roles.

### `useReviewVerification()`
Mutation: approve/reject a verification request. Updates both `verification_requests` and `profiles.verification_status`.

### `useAdminReports()`
All reports with reporter/reported user profiles.

### `useUpdateReportStatus()`
Update report status. Params: `{ reportId, status }`.

### `useAdminUsers()`
All user profiles (max 200) with their roles.

### `useDeletePost()`
Admin delete any post. Invalidates admin-reports and feed-posts caches.

---

## Blog Hooks

**File:** `src/hooks/useBlogPosts.ts`

### `useBlogPosts(limit?: number)`
Published blog posts sorted by `published_at` DESC.

### `useBlogPost(slug: string)`
Single blog post by slug. Only published posts.

---

## Utility Hooks

### `usePageMeta({ title, description })`
**File:** `src/hooks/usePageMeta.ts`

Sets `document.title` and updates OG/Twitter meta tags. Resets on unmount.

```ts
usePageMeta({ title: "Feed", description: "Your professional feed" });
```

### `useRole()`
**File:** `src/contexts/RoleContext.tsx`

Global role context. See [Architecture Guide](./architecture.md#rolecontext-flow).

```ts
const { activeRole, availableRoles, hasRole, setActiveRole, userId, loaded, refreshRoles } = useRole();
```

### `useIsMobile()`
**File:** `src/hooks/use-mobile.tsx`

Returns `boolean` — `true` when viewport width < 768px. Uses `matchMedia` listener.

```ts
const isMobile = useIsMobile();
```

---

## Library Modules

### `src/lib/utils.ts`
`cn()` — clsx + tailwind-merge for conditional class names.

```ts
import { cn } from "@/lib/utils";
cn("text-sm", isActive && "font-bold", className)
```

### `src/lib/storage.ts`
File upload via `upload-file` edge function.

| Export           | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `validateFile()` | Client-side validation (type + size)       |
| `uploadFile()`   | Full upload flow with auth and error handling |
| `deleteFile()`   | Remove file record from DB                 |

### `src/lib/session-manager.ts`
Multi-device session management (max 3 concurrent).

| Export              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `registerSession()` | Create/update session on login             |
| `removeSession()`   | Clean up on sign-out                       |
| `touchSession()`    | Heartbeat (called every 5min by AppLayout) |

### `src/lib/sanitize.ts`
XSS prevention via DOMPurify.

| Export              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `sanitizeContent()` | Strip dangerous HTML from user input       |

Configured with a strict allowlist of HTML tags. All user-generated content (posts, comments, messages) is sanitized before submission.

### `src/lib/throttle.ts`
Generic throttle utility for action guards.

| Export        | Purpose                                    |
| ------------- | ------------------------------------------ |
| `throttle(fn, ms)` | Returns throttled version of `fn` that executes at most once per `ms` milliseconds |

Used to prevent rapid-fire API calls on likes, bookmarks, and connection actions.

### `src/lib/role-config.ts`
Role metadata: labels, icons, colors, CSS variables.

```ts
ROLE_CONFIG["investor"].label  // "Investor"
ROLE_CONFIG["investor"].icon   // BarChart3 (Lucide)
ROLE_CONFIG["investor"].color  // "text-investor"
getRoleIcon("issuer")          // Landmark
getRoleBadgeClasses("admin")   // "bg-primary/10 text-primary border-primary/20"
```

### `src/lib/vcard.ts`
vCard (.vcf) generation for digital business cards.

| Export           | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `generateVCard()` | Creates VCF string from profile data      |
| `downloadVCard()` | Triggers browser download of .vcf file    |

### `src/lib/web-vitals.ts`
Core Web Vitals monitoring.

| Export             | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `reportWebVitals()`| Measures LCP, CLS, FID, TTFB, INP        |

Called in `main.tsx` to track performance metrics. Results are logged to console in development.

---

## Key Shared Components

### `AppLayout`
**File:** `src/components/AppLayout.tsx`

Wraps all protected pages. Provides:
- `AppNavbar` (desktop top nav + mobile bottom nav)
- Session heartbeat (touches active session every 5 minutes)
- `CommandPalette` (Ctrl+K quick navigation)

### `ProtectedRoute`
**File:** `src/components/ProtectedRoute.tsx`

Auth guard that:
1. Shows `SplashScreen` while checking session
2. Redirects to `/auth` if not authenticated
3. Redirects to `/onboarding` if `onboarding_completed` is false
4. Renders children if all checks pass

### `RouteErrorBoundary`
**File:** `src/components/RouteErrorBoundary.tsx`

Per-route error boundary that catches render errors and shows a retry-able error UI. Prevents one broken page from crashing the entire app.

### `PublicPageLayout`
**File:** `src/components/PublicPageLayout.tsx`

Shared layout for public pages (About, Contact, Legal, etc.) with consistent header, footer, and SEO meta tags.

### `PageHero`
**File:** `src/components/PageHero.tsx`

Reusable hero section with title, subtitle, and optional background gradient. Used on most public and protected pages.
