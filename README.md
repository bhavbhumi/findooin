# FindOO — India's BFSI Professional Network

> A full-stack professional networking platform for India's Banking, Financial Services & Insurance (BFSI) ecosystem. Built with React, TypeScript, Tailwind CSS, and Lovable Cloud.

**Live**: [findooin.lovable.app](https://findooin.lovable.app)

---

## 📖 Documentation

| Guide | Description |
| ----- | ----------- |
| [Architecture](docs/architecture.md) | System overview, module map, context graph, data flow patterns, DB function map |
| [API Reference](docs/api-reference.md) | All 18+ hooks documented with params, return types, and usage examples |
| [Edge Functions](docs/edge-functions.md) | 4 backend functions with request/response schemas and auth requirements |
| [Getting Started](docs/getting-started.md) | Setup, folder conventions, design system, testing, and PR checklist |

---

## Table of Contents

- [Overview](#overview)
- [Documentation](#-documentation)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Design System](#design-system)
- [Performance Patterns](#performance-patterns)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Changelog](#changelog)

---

## Overview

FindOO connects investors, intermediaries (MFDs, RIAs, brokers), and issuers (AMCs, insurance companies) on a single verified platform. It provides:

- **Role-based access** — 4 roles: Investor, Intermediary, Issuer, Admin
- **Verified profiles** — KYC document upload + admin verification queue
- **Professional networking** — Follow / Connect with acceptance flow
- **Content feed** — Posts, polls, surveys with hashtags and visibility controls
- **BFSI Job Board** — Category-specific job listings with employer/candidate dashboards
- **Events** — Webinars, investor meets, AGMs with check-in QR codes
- **Directory** — Product/service marketplace with reviews and enquiries
- **Secure Vault** — Private document storage for KYC, tax, certificates
- **Real-time messaging** — Categorized DMs with typing indicators and read receipts
- **Digital Business Cards** — Shareable vCard with QR code and lead tracking
- **Analytics Dashboard** — Personal & platform-wide engagement metrics
- **Developer Documentation** — In-app developer portal with architecture docs

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    React SPA                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  36 Pages │  │ 18 Hooks │  │ 120+ Comps   │  │
│  │ (Routes)  │  │ (Data)   │  │ (53 UI base) │  │
│  └─────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │             │               │           │
│        └─────────────┼───────────────┘           │
│                      │                           │
│              ┌───────┴───────┐                   │
│              │  TanStack     │                   │
│              │  React Query  │                   │
│              └───────┬───────┘                   │
│                      │                           │
│              ┌───────┴───────┐                   │
│              │  Supabase     │                   │
│              │  Client SDK   │                   │
│              └───────┬───────┘                   │
└──────────────────────┼──────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │   Lovable Cloud       │
           │  (Supabase Backend)   │
           │                       │
           │  ├── PostgreSQL DB    │
           │  ├── Auth             │
           │  ├── Storage Buckets  │
           │  ├── Edge Functions   │
           │  ├── Realtime         │
           │  └── RLS Policies     │
           └───────────────────────┘
```

### Data Flow Pattern

1. **Pages** define layout and compose components
2. **Custom hooks** (`useJobs`, `useFeedPosts`, etc.) encapsulate all data fetching via TanStack Query
3. **Optimistic updates** for interactions (likes, bookmarks, connection accept/reject)
4. **Infinite scroll** on the feed via `useInfiniteQuery` + `IntersectionObserver`
5. **Batch loading** for post interactions to reduce N+1 queries

---

## Tech Stack

| Layer        | Technology                                     |
| ------------ | ---------------------------------------------- |
| Framework    | React 18 + TypeScript                          |
| Build        | Vite                                           |
| Styling      | Tailwind CSS + shadcn/ui + CSS custom props     |
| State        | TanStack React Query (server state)            |
| Routing      | React Router v6                                |
| Animation    | Framer Motion                                  |
| Charts       | Recharts                                       |
| Icons        | Lucide React                                   |
| Backend      | Lovable Cloud (Supabase)                       |
| Auth         | Supabase Auth (email + password)               |
| Storage      | Supabase Storage (via edge function)            |
| Realtime     | Supabase Realtime (messages, typing indicators) |
| QR Codes     | qrcode.react                                   |
| Testing      | Vitest + React Testing Library (16 test files)  |
| Sanitization | DOMPurify (XSS protection)                     |

---

## Project Structure

```
src/
├── assets/              # Logo images (imported as ES6 modules)
├── components/
│   ├── ui/              # shadcn/ui primitives (53 components)
│   ├── skeletons/       # Content-aware loading skeletons per module
│   ├── selectors/       # Location, Certification, Language pickers
│   ├── feed/            # PostCard, CommentSection, CreatePostComposer, etc.
│   ├── jobs/            # JobCard, JobDetailSheet, EmployerDashboard, etc.
│   ├── events/          # EventCard, EventDetailSheet, OrganizerDashboard
│   ├── directory/       # ListingCard, ListingDetailSheet, CreateListingDialog
│   ├── network/         # NetworkSidebar, InviteDialog
│   ├── profile/         # ProfileHeader, EditProfileDialog, DigitalCardManager
│   ├── vault/           # VaultFileCard, VaultUploadDialog
│   ├── admin/           # AdminOverview, VerificationQueue, ContentModeration
│   ├── discover/        # DiscoverSidebar
│   ├── AppLayout.tsx    # Shared layout wrapper with navbar + session heartbeat
│   ├── AppNavbar.tsx    # Main navigation bar (desktop + mobile bottom nav)
│   ├── CommandPalette.tsx # Ctrl+K command palette for quick navigation
│   ├── ProtectedRoute.tsx # Auth guard with onboarding check + splash screen
│   ├── PublicPageLayout.tsx # Shared layout for public pages
│   ├── RouteErrorBoundary.tsx # Per-route error handling with retry
│   └── ErrorBoundary.tsx  # Graceful error handling per section
├── contexts/
│   └── RoleContext.tsx  # Global role state (investor/intermediary/issuer/admin)
├── hooks/               # 18 custom hooks — one per module
│   ├── useFeedPosts.ts  # Infinite-scroll feed with pagination via RPC
│   ├── usePostInteractions.ts # Batched like/bookmark with optimistic updates
│   ├── useJobs.ts       # Job CRUD, applications, saved jobs
│   ├── useEvents.ts     # Event CRUD, registration, cancellation
│   ├── useListings.ts   # Directory listings with enquiries
│   ├── useNotifications.ts # Notification fetch + mark-read + realtime
│   ├── useConnectionActions.ts # Follow/connect/disconnect logic
│   ├── useVault.ts      # Secure file management
│   ├── useDrafts.ts     # Post draft persistence
│   ├── useScheduledPosts.ts # Scheduled post management
│   ├── useTrendingPosts.ts  # Trending posts by hashtag frequency
│   ├── useViralPosts.ts     # Viral posts by engagement score
│   ├── useTrendingHashtags.ts # Top hashtags by frequency
│   ├── useBlogPosts.ts  # Public blog content
│   ├── useAdmin.ts      # Admin role check + management hooks
│   ├── usePageMeta.ts   # Dynamic <title> and meta tags
│   ├── use-mobile.tsx   # Mobile viewport detection
│   └── use-toast.ts     # Toast notification hook
├── lib/                 # 8 utility modules
│   ├── utils.ts         # cn() utility (clsx + tailwind-merge)
│   ├── role-config.ts   # Role labels, icons, colors, CSS vars
│   ├── session-manager.ts # Multi-device session management (max 3)
│   ├── storage.ts       # File upload via edge function with validation
│   ├── sanitize.ts      # DOMPurify wrapper for XSS prevention
│   ├── throttle.ts      # Generic throttle utility for action guards
│   ├── vcard.ts         # vCard (.vcf) generation and download
│   └── web-vitals.ts    # Core Web Vitals (LCP, CLS, FID) monitoring
├── data/
│   ├── certifications.ts # BFSI certification options
│   ├── languages.ts     # Indian language options
│   └── locations.ts     # Indian city/state options
├── pages/               # 36 route-level page components (lazy-loaded)
├── integrations/
│   └── supabase/        # Auto-generated client + types (DO NOT EDIT)
├── test/                # 16 test files (unit + integration)
└── index.css            # Design system tokens (HSL custom properties)
```

---

## Modules

### 1. Feed (`/feed`)
- Infinite scroll with `useInfiniteQuery` + `IntersectionObserver`
- Post types: text, market commentary, research note, announcement, article, query
- Post kinds: normal, poll, survey
- Visibility controls: public, network, connections, private
- Optimistic like/bookmark with rollback on failure
- Drafts and scheduled posts

### 2. Profile (`/profile`, `/profile/:id`)
- Banner + avatar with role-colored rings
- About, Network, Activity, Posts, Directory, Vault, Digital Card tabs
- Profile completeness ring + trust score badge
- Mutual connections + endorsements
- Direct DB query for user posts (not from global feed)

### 3. Network (`/network`)
- Connections (bidirectional accept flow) + Followers/Following
- Optimistic accept/reject with rollback
- People suggestions

### 4. Jobs (`/jobs`)
- Browse with category/type filters
- Candidate dashboard (applications, saved jobs)
- Employer dashboard (posted jobs, applicant management)
- Application tracking with status pipeline

### 5. Events (`/events`)
- Browse with category/mode/date filters
- Calendar-based date selection in sidebar
- Registration with capacity tracking
- Organizer dashboard + QR check-in system

### 6. Directory (`/directory`)
- Products (mutual funds, insurance, etc.) + Services (advisory, compliance, etc.)
- Reviews + ratings + enquiry system
- Comparison view

### 7. Messages (`/messages`)
- Real-time via Supabase Realtime (postgres_changes)
- Categorized threads (General, Sales, Ops, Accounts, Support, Complaint)
- Typing indicators via Presence
- Read receipts + date separators

### 8. Vault (`/vault`)
- Secure document storage (KYC, tax, certificates)
- Share links with tokens
- Auto-sync from verification documents

### 9. Analytics (`/analytics`)
- Personal: engagement rate, content score, posting streak, audience breakdown
- Platform: trending hashtags, top posts, activity trends
- CSV export

### 10. Admin (`/admin`)
- Overview dashboard with platform stats
- Verification queue (document review + approve/reject)
- User management
- Content moderation (reports)
- Blog CMS

### 11. Public Pages
- **Landing** (`/`) — Hero, features overview, social proof
- **About** (`/about`) — Company, Career, Press tabs
- **Explore** (`/explore`) — What, Why, How, Who tabs
- **Blog** (`/blog`, `/blog/:slug`) — Articles, Analysis, Reports
- **Contact** (`/contact`) — Ask Us + Visit Us (Google Maps)
- **Legal** (`/legal`) — Terms, Privacy, Policies, Disclosures
- **HelpDesk** (`/helpdesk`) — Searchable support articles
- **Community Guidelines** (`/community-guidelines`) — Guidelines + FAQs
- **QuickLinks** (`/quick-links`) — Navigation grid
- **SiteMap** (`/sitemap`) — Full page index
- **Install** (`/install`) — PWA installation guide
- **Developer Docs** (`/developer`) — In-app architecture & API reference portal
- **Cost Report** (`/cost-report`) — Development cost & efficiency analysis (printable)

---

## Design System

All colors use HSL via CSS custom properties in `src/index.css`:

```css
--background, --foreground, --card, --primary, --accent, --muted, --destructive
--investor, --intermediary, --issuer  /* Role-specific colors */
--gold, --gold-foreground             /* Premium accent */
```

**Rules:**
- Never use raw color values in components — always use semantic tokens
- Role colors are mapped via `src/lib/role-config.ts`
- Both light and dark themes are supported via `next-themes`

---

## Performance Patterns

| Pattern                  | Where Used                              |
| ------------------------ | --------------------------------------- |
| `React.memo()`          | PostCard, JobCard, EventCard, ListingCard, all sidebars |
| `useInfiniteQuery`       | Feed pagination                         |
| `IntersectionObserver`   | Auto-load next feed page                |
| Batch interaction loader | `usePostInteractions` (50ms debounce)   |
| Optimistic updates       | Like, bookmark, comment, accept/reject  |
| Lazy routes              | All protected + public pages            |
| Lazy sidebar tabs        | Feed sidebar (Drafts, Scheduled)        |
| Content-aware skeletons  | Per-module skeleton components           |
| `useCallback` / `useMemo`| Filters, search, event handlers         |
| Client-side throttling   | Action guards (500ms-1s) via `throttle.ts` |
| Web Vitals monitoring    | LCP, CLS, FID tracking via `web-vitals.ts` |

---

## Authentication & Authorization

1. **Email + Password** sign-up/sign-in via Supabase Auth
2. **Onboarding gate** — `ProtectedRoute` checks `profiles.onboarding_completed`
3. **Session management** — Max 3 concurrent sessions per user (`session-manager.ts`)
4. **Role-based UI** — `RoleContext` determines available features per role
5. **Admin guard** — `useIsAdmin()` hook checks `user_roles` table for `admin` role
6. **RLS policies** — Row-level security on all tables in the database
7. **Input sanitization** — DOMPurify via `sanitize.ts` on all user-generated content

---

## Database Schema

Key tables (30+ total — see `src/integrations/supabase/types.ts` for full schema):

| Table                  | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `profiles`             | User profiles with verification status     |
| `user_roles`           | Role assignments (investor/intermediary/issuer/admin) |
| `posts`                | Feed content (text, polls, surveys)        |
| `post_interactions`    | Likes and bookmarks                        |
| `post_drafts`          | Unsaved post drafts per user               |
| `comments`             | Post comments                              |
| `connections`          | Follow/connect relationships               |
| `messages`             | Direct messages with categories            |
| `jobs`                 | Job listings                               |
| `job_applications`     | Application tracking                       |
| `saved_jobs`           | Saved/bookmarked jobs                      |
| `events`               | Event listings                             |
| `event_registrations`  | Event sign-ups                             |
| `event_speakers`       | Event speaker profiles                     |
| `listings`             | Directory products/services                |
| `listing_reviews`      | Directory listing reviews                  |
| `listing_enquiries`    | Directory listing enquiries                |
| `vault_files`          | Secure document storage                    |
| `notifications`        | In-app notifications                       |
| `verification_requests`| KYC verification queue                     |
| `active_sessions`      | Multi-device session tracking              |
| `blog_posts`           | CMS blog content                           |
| `audit_logs`           | Admin audit trail                          |
| `reports`              | Content/user reports                       |
| `endorsements`         | Skill endorsements                         |
| `card_exchanges`       | Digital card view/save tracking            |
| `file_uploads`         | Upload records for all storage buckets     |
| `poll_options`         | Poll answer choices                        |
| `poll_votes`           | Poll votes                                 |
| `survey_questions`     | Survey question definitions                |
| `survey_options`       | Survey answer choices                      |
| `survey_responses`     | Survey responses                           |
| `featured_posts`       | User-pinned featured posts                 |
| `profile_views`        | Profile view tracking                      |
| `user_settings`        | Privacy and notification preferences       |

---

## Getting Started

```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd findoo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app connects to Lovable Cloud automatically — no additional backend setup needed.

---

## Environment Variables

Managed automatically by Lovable Cloud. **Do not edit `.env` directly.**

| Variable                        | Purpose                    |
| ------------------------------- | -------------------------- |
| `VITE_SUPABASE_URL`            | Backend API URL            |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| Public API key             |
| `VITE_SUPABASE_PROJECT_ID`     | Project identifier         |

---

## Edge Functions

| Function                    | Purpose                                |
| --------------------------- | -------------------------------------- |
| `upload-file`               | Secure file upload with validation     |
| `seed-data`                 | Development data seeding               |
| `seed-users`                | Development user seeding               |
| `publish-scheduled-posts`   | Cron: publish posts at scheduled time  |

---

## Changelog

### v2.8 — Feb 2026 (Documentation & Reporting)
- **Cost Report** (`/cost-report`) — Printable AI vs Traditional vs DIY cost comparison for stakeholders
- **Comprehensive documentation refresh** — All docs updated to reflect current 36-page, 120+ component, 16-test-file state
- **Complete database schema listing** — All 34 tables documented in README
- **Library modules documented** — Added `sanitize.ts`, `throttle.ts`, `web-vitals.ts` to API reference
- **Route architecture updated** — All public and protected routes catalogued

### v2.7 — Feb 2026 (Integration Tests & Hardening)
- **Integration test suite** — 8 integration tests added:
  - `Auth.integration.test.tsx` — Sign-up, sign-in, sign-out flows
  - `ConnectionFlow.integration.test.tsx` — Follow/connect/disconnect journeys
  - `CreatePostComposer.integration.test.tsx` — Post creation with all types
  - `PostJobDialog.integration.test.tsx` — Job posting validation
  - `Infrastructure.integration.test.tsx` — Rate limiting, session management
- **Component tests** — `EventCard`, `JobCard`, `ListingCard`, `PostCard` render tests
- **Sanitization tests** — DOMPurify XSS prevention validation
- **Throttle tests** — Action guard timing verification
- **Total test files**: 16 (up from 5)

### v2.6 — Feb 2026 (Quality & Accessibility)
- **Error toast coverage** — consistent `toast.error()` on all hook failures
- **Accessibility audit** — WCAG 2.1 AA improvements across all interactive components
- **Unit test suite** — Core hook tests (useFeedPosts, usePostInteractions, useConnectionActions, session-manager)

### v2.5 — Feb 2026 (Performance & Cleanup)
- **Infinite scroll** on feed with `useInfiniteQuery` + manual fallback button
- **Optimistic updates** for likes, bookmarks, comments, connection accept/reject
- **Batch interaction loader** reducing N+1 queries on post cards
- **Content-aware skeletons** for all modules
- **Component memoization** across all cards and sidebars
- **Dead code cleanup** — removed 19 unused files
- **Code documentation** — JSDoc comments on all key hooks and utilities

### v2.0 — Feb 2026 (Full Platform)
- Vault module with secure document storage and sharing
- Digital business cards with QR codes and lead tracking
- Event check-in system with QR codes
- Post analytics dashboard with CSV export
- Blog CMS for admin
- Real-time messaging with typing indicators
- Multi-device session management (max 3)
- Role-based navigation and feature gating
- Admin panel (verification queue, user management, content moderation)

### v1.0 — Jan 2026 (MVP)
- Authentication with onboarding flow
- Profile management with verification
- Feed with posts, polls, surveys
- Network (follow/connect)
- Job board with applications
- Events with registration
- Directory with reviews
- Notifications system
- Settings with privacy controls
- Public pages (About, Blog, Contact, Legal)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines including branching strategy, commit conventions, PR workflow, and coding standards.

### Quick Rules
- **No raw colors** — use Tailwind semantic tokens
- **No spaghetti** — each module has its own hook, page, and component folder
- **Hooks for data** — all Supabase queries live in `/hooks`
- **Memo for performance** — memoize cards and sidebars that render in lists
- **Error boundaries** — wrap major sections for graceful degradation
- **Tests required** — add/update tests for logic changes

---

## License

Private project. All rights reserved.
