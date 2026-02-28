# FindOO — Architecture Guide

> System overview, module map, data flow patterns, and context dependency graph.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        React SPA (Vite)                      │
│                                                              │
│  ┌────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │  Pages      │   │  Contexts     │   │  UI Components    │  │
│  │  (36 Routes)│──▶│  RoleContext   │──▶│  shadcn/ui (53)   │  │
│  │  /feed      │   │  ThemeProvider │   │  Module-specific  │  │
│  │  /jobs      │   └──────┬───────┘   │  Skeletons         │  │
│  │  /events    │          │           └───────────────────┘  │
│  │  /directory │   ┌──────┴───────┐                          │
│  │  /profile   │   │  Custom Hooks │                          │
│  │  /messages  │   │  (18 hooks)   │                          │
│  │  /admin     │   │  useFeedPosts │                          │
│  │  /vault     │   │  useJobs      │                          │
│  │  /discover  │   │  useEvents    │                          │
│  └─────┬──────┘   │  useListings  │                          │
│        │          │  useVault     │                          │
│        │          └──────┬───────┘                          │
│        │                 │                                   │
│        │          ┌──────┴───────┐                          │
│        └─────────▶│ TanStack     │                          │
│                   │ React Query  │                          │
│                   └──────┬───────┘                          │
│                          │                                   │
│                   ┌──────┴───────┐                          │
│                   │ Supabase SDK │                          │
│                   └──────┬───────┘                          │
└──────────────────────────┼───────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │    Lovable Cloud        │
              │    (Supabase Backend)   │
              │                         │
              │  ├── PostgreSQL (34 tables)
              │  ├── Auth (email+password)
              │  ├── Storage (5 buckets)
              │  ├── Edge Functions (4)
              │  ├── Realtime (messages, notifications)
              │  ├── RLS Policies (all tables)
              │  └── DB Functions (19)
              └─────────────────────────┘
```

---

## Module Map

FindOO is organized into 11 feature modules, each with its own page, hook(s), and component folder:

| Module       | Route(s)                  | Hook(s)                                      | Component Folder         |
| ------------ | ------------------------- | -------------------------------------------- | ------------------------ |
| **Feed**     | `/feed`                   | `useFeedPosts`, `usePostInteractions`, `useDrafts`, `useScheduledPosts`, `useTrendingPosts`, `useViralPosts`, `useTrendingHashtags` | `components/feed/`       |
| **Profile**  | `/profile`, `/profile/:id`| `useConnectionActions`, `usePostInteractions` | `components/profile/`    |
| **Network**  | `/network`                | `useConnectionActions`                        | `components/network/`    |
| **Jobs**     | `/jobs`                   | `useJobs` (11 exports)                        | `components/jobs/`       |
| **Events**   | `/events`                 | `useEvents` (9 exports)                       | `components/events/`     |
| **Directory**| `/directory`              | `useListings` (8 exports)                     | `components/directory/`  |
| **Messages** | `/messages`               | (inline in page — Supabase Realtime)          | —                        |
| **Vault**    | `/vault`                  | `useVault`                                    | `components/vault/`      |
| **Analytics**| `/analytics`              | `useFeedPosts`, `usePostInteractions`         | —                        |
| **Discover** | `/discover`               | `useConnectionActions`                        | `components/discover/`   |
| **Admin**    | `/admin`                  | `useAdmin` (8 exports)                        | `components/admin/`      |

---

## Entity-Relationship Diagram

The database contains 34 tables organized into 6 domains. Foreign keys are shown as arrows.

### Core User Domain

```mermaid
erDiagram
    profiles ||--o{ user_roles : "has roles"
    profiles ||--o{ active_sessions : "has sessions"
    profiles ||--o{ user_settings : "has settings"
    profiles ||--o{ verification_requests : "submits"
    profiles ||--o{ profile_views : "viewed by"
    profiles ||--o{ endorsements : "receives"
    profiles ||--o{ card_exchanges : "card owner"

    profiles {
        uuid id PK
        text full_name
        text display_name
        text avatar_url
        text headline
        text organization
        enum user_type
        enum verification_status
        boolean onboarding_completed
        jsonb languages
        jsonb social_links
        jsonb digital_card_fields
        jsonb regulatory_ids
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        enum role
        text sub_type
    }

    active_sessions {
        uuid id PK
        uuid user_id FK
        text session_token
        text device_info
    }

    verification_requests {
        uuid id PK
        uuid user_id FK
        text document_url
        text status
        uuid reviewed_by
    }
```

### Content Domain (Feed)

```mermaid
erDiagram
    posts ||--o{ comments : "has"
    posts ||--o{ post_interactions : "receives"
    posts ||--o{ poll_options : "has options"
    posts ||--o{ survey_questions : "has questions"
    posts ||--o{ featured_posts : "pinned as"
    posts ||--o{ reports : "reported via"
    posts ||--o{ post_drafts : "drafted as"
    poll_options ||--o{ poll_votes : "receives"
    survey_questions ||--o{ survey_options : "has options"
    survey_questions ||--o{ survey_responses : "receives"
    survey_options ||--o{ survey_responses : "selected in"

    posts {
        uuid id PK
        uuid author_id FK
        text content
        enum post_type
        enum post_kind
        enum post_visibility
        timestamp scheduled_at
    }

    comments {
        uuid id PK
        uuid post_id FK
        uuid author_id FK
        text content
    }

    post_interactions {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        text interaction_type
    }

    poll_options {
        uuid id PK
        uuid post_id FK
        text option_text
        integer position
    }

    poll_votes {
        uuid id PK
        uuid poll_option_id FK
        uuid user_id FK
    }

    survey_questions {
        uuid id PK
        uuid post_id FK
        text question_text
        text question_type
    }
```

### Jobs Domain

```mermaid
erDiagram
    jobs ||--o{ job_applications : "receives"
    jobs ||--o{ saved_jobs : "saved by"

    jobs {
        uuid id PK
        uuid poster_id FK
        text title
        text company_name
        enum job_category
        enum job_type
        enum job_status
        text location
        boolean is_remote
    }

    job_applications {
        uuid id PK
        uuid job_id FK
        uuid applicant_id FK
        enum status
        text resume_url
        text cover_note
    }

    saved_jobs {
        uuid id PK
        uuid job_id FK
        uuid user_id FK
    }
```

### Events Domain

```mermaid
erDiagram
    events ||--o{ event_registrations : "has"
    events ||--o{ event_speakers : "features"

    events {
        uuid id PK
        uuid organizer_id FK
        text title
        enum category
        enum event_mode
        enum status
        timestamp start_time
        timestamp end_time
        integer capacity
        integer registration_count
    }

    event_registrations {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        enum status
    }

    event_speakers {
        uuid id PK
        uuid event_id FK
        text speaker_name
        uuid speaker_profile_id FK
    }
```

### Directory Domain

```mermaid
erDiagram
    listings ||--o{ listing_reviews : "reviewed via"
    listings ||--o{ listing_enquiries : "enquired via"

    listings {
        uuid id PK
        uuid user_id FK
        text title
        enum listing_type
        enum product_category
        enum service_category
        enum status
        numeric average_rating
        integer review_count
    }

    listing_reviews {
        uuid id PK
        uuid listing_id FK
        uuid reviewer_id FK
        integer rating
        text review_text
    }

    listing_enquiries {
        uuid id PK
        uuid listing_id FK
        uuid enquirer_id FK
        text message
        text status
    }
```

### Messaging and Notifications

```mermaid
erDiagram
    messages {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        text content
        enum category
        boolean read
    }

    notifications {
        uuid id PK
        uuid user_id FK
        uuid actor_id FK
        text type
        text reference_id
        text reference_type
        text message
        boolean read
    }

    connections {
        uuid id PK
        uuid from_user_id FK
        uuid to_user_id FK
        enum connection_type
        enum status
    }
```

### Supporting Tables

| Table | Domain | Purpose |
| --- | --- | --- |
| `post_drafts` | Feed | Unsaved post drafts per user |
| `blog_posts` | CMS | Public blog articles (admin-managed) |
| `file_uploads` | Storage | Upload records for all storage buckets |
| `vault_files` | Vault | Private document storage with share tokens |
| `reports` | Moderation | User-submitted content/user reports |
| `audit_logs` | Admin | Administrative action audit trail |
| `endorsements` | Profile | Skill endorsements between users |
| `card_exchanges` | Profile | Digital card view/save tracking |
| `profile_views` | Profile | Profile view analytics |
| `user_settings` | Settings | Privacy and notification preferences |

---

## Context Dependency Graph

```
App
 ├── QueryClientProvider (TanStack)
 │    └── All hooks use this for server state
 ├── ThemeProvider (next-themes)
 │    └── Light/Dark mode toggle
 ├── RoleProvider (RoleContext)
 │    ├── Fetches user_roles from DB on auth
 │    ├── Provides: activeRole, hasRole(), userId
 │    └── Used by: useEvents, useJobs, ProtectedRoute, AppNavbar
 └── TooltipProvider (Radix)
```

### RoleContext Flow

```
Auth Event (sign in)
  → getSession()
  → fetch user_roles WHERE user_id = uid
  → Auto-select highest-priority role: issuer > intermediary > investor
  → Persist choice in localStorage (findoo_active_role)
  → Components use useRole() to access activeRole, hasRole()
```

---

## Data Flow Patterns

### 1. Standard CRUD (Jobs, Events, Listings)

```
Page Component
  → useJobs(filters)                    // TanStack useQuery
    → supabase.from("jobs").select()    // Filtered query
    → Batch-fetch related profiles      // Avoid N+1
    → Return enriched data
  → useCreateJob()                      // TanStack useMutation
    → supabase.from("jobs").insert()
    → invalidateQueries(["jobs"])       // Refetch list
    → toast.success()
```

### 2. Optimistic Updates (Feed Interactions)

```
User clicks "Like"
  → setLiked(true)                          // Instant UI update
  → optimisticUpdateFeedCache()             // Patch TanStack cache in-place
    → Update infinite query pages
    → Update trending-posts, viral-posts caches
  → supabase.from("post_interactions").insert()
  → On error:
    → setLiked(false)                       // Rollback local state
    → optimisticUpdateFeedCache() (reverse) // Rollback cache
    → toast.error()
```

### 3. Batch Loading (Post Interactions)

```
10 PostCards mount simultaneously
  → Each calls batchLoadInteraction(postId, userId)
  → Requests queue for 50ms
  → Single DB query: SELECT ... WHERE user_id = X AND post_id IN (...)
  → Results dispatched to individual Promises
```

### 4. Infinite Scroll (Feed)

```
useFeedPosts()
  → useInfiniteQuery with get_feed_posts RPC
  → PAGE_SIZE = 15
  → getNextPageParam: offset = sum of all page lengths
  → IntersectionObserver triggers fetchNextPage
  → flatPosts = pages.flat() for simple consumers
```

### 5. Realtime (Messages, Notifications)

```
useNotifications()
  → Initial load: SELECT * FROM notifications WHERE user_id = X
  → Subscribe: supabase.channel("notifications-realtime")
    → postgres_changes INSERT on notifications WHERE user_id = X
    → Prepend to local state + increment unreadCount
```

### 6. Input Sanitization

```
User submits content (post, comment, message)
  → sanitizeContent(rawText) via lib/sanitize.ts
    → DOMPurify.sanitize(input, { ALLOWED_TAGS: [...] })
  → Sanitized content sent to Supabase
```

### 7. Action Throttling

```
User rapidly clicks "Like"
  → throttle(toggleLike, 500ms) via lib/throttle.ts
  → First click executes immediately
  → Subsequent clicks within 500ms are silently dropped
  → Prevents API flooding and duplicate interactions
```

---

## Database Function Map

| Function                       | Type     | Purpose                                         |
| ------------------------------ | -------- | ----------------------------------------------- |
| `get_feed_posts`               | RPC      | Paginated feed with author profiles + counts     |
| `get_conversations`            | RPC      | Conversation list with last message + unread     |
| `has_role`                     | RPC      | Check if user has a specific role                |
| `check_rate_limit`             | RPC      | Generic rate limiter (posts, messages, connections) |
| `enforce_session_limit`        | RPC      | Evict oldest sessions beyond max                 |
| `cleanup_stale_sessions`       | RPC      | Remove sessions inactive > 7 days                |
| `date_of`                      | RPC      | Extract date from timestamp (immutable)          |
| `create_notification`          | Internal | Insert notification (skips self-notifications)   |
| `handle_new_user`              | Trigger  | Auto-create profile on auth.users INSERT         |
| `enforce_post_rate_limit`      | Trigger  | Max 10 posts/hour                                |
| `enforce_message_rate_limit`   | Trigger  | Max 60 messages/5 minutes                        |
| `enforce_connection_rate_limit`| Trigger  | Max 30 connection requests/hour                  |
| `notify_on_comment`            | Trigger  | Notify post author on new comment                |
| `notify_on_post_interaction`   | Trigger  | Notify post author on like/bookmark              |
| `notify_on_connection`         | Trigger  | Notify on follow/connection request              |
| `notify_on_connection_accepted`| Trigger  | Notify requester when accepted                   |
| `notify_on_message`            | Trigger  | Notify receiver on new message                   |
| `notify_on_verification_status_change` | Trigger | Notify user on verification approved/rejected |
| `notify_on_role_added`         | Trigger  | Notify user when a new role is assigned          |
| `update_listing_review_stats`  | Trigger  | Auto-update review_count/average_rating          |
| `update_updated_at`            | Trigger  | Auto-set updated_at on row update                |
| `update_post_drafts_updated_at`| Trigger  | Auto-set updated_at on draft update              |

---

## Storage Buckets

| Bucket              | Public | Used By                              |
| ------------------- | ------ | ------------------------------------ |
| `avatars`           | Yes    | Profile avatar uploads               |
| `banners`           | Yes    | Profile banner uploads               |
| `verification-docs` | No     | KYC verification document uploads    |
| `resumes`           | No     | Job application resume uploads       |
| `vault`             | No     | Private user document vault          |

All uploads flow through the `upload-file` edge function for server-side validation.

---

## Route Architecture

### Public Routes (no auth required)

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Landing | Hero, features, social proof |
| `/auth` | Auth | Sign in / Sign up |
| `/reset-password` | ResetPassword | Password reset flow |
| `/install` | Install | PWA installation guide |
| `/blog` | Blog | Public blog listing |
| `/blog/:slug` | BlogPost | Individual blog article |
| `/about` | About | Company, Career, Press |
| `/contact` | Contact | Ask Us, Visit Us |
| `/explore` | Explore | Platform overview |
| `/community-guidelines` | CommunityGuidelines | Guidelines + FAQs |
| `/terms` | Terms | Terms of service |
| `/privacy` | Privacy | Privacy policy |
| `/legal` | Legal | Combined legal pages |
| `/helpdesk` | HelpDesk | Support articles |
| `/quick-links` | QuickLinks | Navigation grid |
| `/sitemap` | SiteMap | Full page index |
| `/card/:userId` | DigitalCard | Public digital business card |
| `/event-checkin/:eventId` | EventCheckin | Event QR check-in |
| `/vault/shared/:shareToken` | SharedVaultFile | Public shared file view |
| `/cost-report` | CostReport | Development cost analysis |
| `/developer` | DeveloperDocs | In-app developer documentation |

### Protected Routes (auth + onboarding required)

| Route | Page | Purpose |
| --- | --- | --- |
| `/feed` | Feed | Social content feed |
| `/profile` | Profile | Own profile |
| `/profile/:id` | Profile | Other user's profile |
| `/network` | Network | Connections & followers |
| `/discover` | Discover | People discovery |
| `/analytics` | PostAnalytics | Post engagement analytics |
| `/notifications` | Notifications | In-app notifications |
| `/messages` | Messages | Direct messaging |
| `/settings` | Settings | Account settings |
| `/admin` | Admin | Admin panel (admin role only) |
| `/jobs` | Jobs | Job board |
| `/events` | Events | Events listing |
| `/directory` | Directory | Business directory |
| `/vault` | Vault | Document vault |
| `/onboarding` | Onboarding | First-time setup |

### Loading Strategy
- **Eager**: Landing, Auth, ResetPassword, Onboarding, NotFound, Install, Blog
- **Lazy** (`React.lazy`): All other routes — reduces initial bundle by ~60%

---

## Security Architecture

| Layer | Mechanism | Details |
| --- | --- | --- |
| **Database** | RLS Policies | All 34 tables have row-level security |
| **Database** | Rate Limiting | Trigger-based limits on posts (10/hr), messages (60/5min), connections (30/hr) |
| **Server** | Edge Functions | File upload validation (type, size, bucket) |
| **Client** | DOMPurify | XSS prevention on all user-generated content |
| **Client** | Action Throttling | 500ms-1s guards on rapid interactions |
| **Client** | Session Management | Max 3 concurrent sessions, 7-day stale cleanup |
| **Admin** | Audit Logging | Fire-and-forget logs for sensitive actions |
| **Admin** | RBAC | Admin-only routes and components |
