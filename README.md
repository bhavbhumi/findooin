# FindOO — India's BFSI Professional Network

> A full-stack professional networking platform for India's Banking, Financial Services & Insurance (BFSI) ecosystem. Built with React, TypeScript, Tailwind CSS, and Lovable Cloud.

**Live**: [findooin.lovable.app](https://findooin.lovable.app)

---

## Table of Contents

- [Overview](#overview)
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

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    React SPA                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Pages    │  │ Hooks    │  │  Components  │  │
│  │ (Routes)  │  │ (Data)   │  │  (UI)        │  │
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

---

## Project Structure

```
src/
├── assets/              # Logo images (imported as ES6 modules)
├── components/
│   ├── ui/              # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── skeletons/       # Content-aware loading skeletons per module
│   ├── feed/            # PostCard, CommentSection, CreatePostComposer, etc.
│   ├── jobs/            # JobCard, JobDetailSheet, EmployerDashboard, etc.
│   ├── events/          # EventCard, EventDetailSheet, OrganizerDashboard
│   ├── directory/       # ListingCard, ListingDetailSheet, CreateListingDialog
│   ├── network/         # NetworkSidebar, InviteDialog
│   ├── profile/         # ProfileHeader, EditProfileDialog, DigitalCardManager
│   ├── vault/           # VaultFileCard, VaultUploadDialog
│   ├── admin/           # AdminOverview, VerificationQueue, ContentModeration
│   ├── selectors/       # LocationSelector, CertificationSelector, LanguageSelector
│   ├── discover/        # DiscoverSidebar
│   ├── AppLayout.tsx    # Shared layout wrapper with navbar + session heartbeat
│   ├── AppNavbar.tsx    # Main navigation bar (desktop + mobile bottom nav)
│   ├── ProtectedRoute.tsx # Auth guard with onboarding check + splash screen
│   └── ErrorBoundary.tsx  # Graceful error handling per section
├── contexts/
│   └── RoleContext.tsx  # Global role state (investor/intermediary/issuer/admin)
├── hooks/
│   ├── useFeedPosts.ts  # Infinite-scroll feed with pagination via RPC
│   ├── usePostInteractions.ts # Batched like/bookmark with optimistic updates
│   ├── useJobs.ts       # Job CRUD, applications, saved jobs
│   ├── useEvents.ts     # Event CRUD, registration, cancellation
│   ├── useListings.ts   # Directory listings with enquiries
│   ├── useNotifications.ts # Notification fetch + mark-read
│   ├── useConnectionActions.ts # Follow/connect/disconnect logic
│   ├── useVault.ts      # Secure file management
│   ├── useDrafts.ts     # Post draft persistence
│   ├── useScheduledPosts.ts # Scheduled post management
│   ├── useTrendingPosts.ts / useViralPosts.ts / useTrendingHashtags.ts
│   ├── useBlogPosts.ts  # Public blog content
│   ├── useAdmin.ts      # Admin role check
│   └── usePageMeta.ts   # Dynamic <title> and meta tags
├── lib/
│   ├── utils.ts         # cn() utility (clsx + tailwind-merge)
│   ├── role-config.ts   # Role labels, icons, colors, CSS vars
│   ├── session-manager.ts # Multi-device session management (max 3)
│   ├── storage.ts       # File upload via edge function with validation
│   └── vcard.ts         # vCard (.vcf) generation and download
├── data/
│   ├── certifications.ts # BFSI certification options
│   ├── languages.ts     # Indian language options
│   └── locations.ts     # Indian city/state options
├── pages/               # Route-level page components (lazy-loaded)
├── integrations/
│   └── supabase/        # Auto-generated client + types (DO NOT EDIT)
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

---

## Authentication & Authorization

1. **Email + Password** sign-up/sign-in via Supabase Auth
2. **Onboarding gate** — `ProtectedRoute` checks `profiles.onboarding_completed`
3. **Session management** — Max 3 concurrent sessions per user (`session-manager.ts`)
4. **Role-based UI** — `RoleContext` determines available features per role
5. **Admin guard** — `useIsAdmin()` hook checks `user_roles` table for `admin` role
6. **RLS policies** — Row-level security on all tables in the database

---

## Database Schema

Key tables (30+ total — see `src/integrations/supabase/types.ts` for full schema):

| Table                  | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `profiles`             | User profiles with verification status     |
| `user_roles`           | Role assignments (investor/intermediary/issuer/admin) |
| `posts`                | Feed content (text, polls, surveys)        |
| `post_interactions`    | Likes and bookmarks                        |
| `comments`             | Post comments                              |
| `connections`          | Follow/connect relationships               |
| `messages`             | Direct messages with categories            |
| `jobs`                 | Job listings                               |
| `job_applications`     | Application tracking                       |
| `events`               | Event listings                             |
| `event_registrations`  | Event sign-ups                             |
| `listings`             | Directory products/services                |
| `vault_files`          | Secure document storage                    |
| `notifications`        | In-app notifications                       |
| `verification_requests`| KYC verification queue                     |
| `active_sessions`      | Multi-device session tracking              |
| `blog_posts`           | CMS blog content                           |

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

### v2.5 — Feb 2026 (Performance & Cleanup)
- **Infinite scroll** on feed with `useInfiniteQuery` + manual fallback button
- **Optimistic updates** for likes, bookmarks, comments, connection accept/reject
- **Batch interaction loader** reducing N+1 queries on post cards
- **Content-aware skeletons** for all modules (Jobs, Events, Directory, Network, Profile)
- **Component memoization** across all cards and sidebars
- **Profile posts optimization** — direct DB query instead of filtering global feed
- **Lazy sidebar tabs** (Drafts, Scheduled) in feed
- **Dead code cleanup** — removed 19 unused files (images, components, CSS)
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

This project uses Lovable for development. Changes pushed to the connected GitHub repo will auto-sync with the Lovable editor and vice versa.

### Code Standards
- **No raw colors** — use Tailwind semantic tokens
- **No spaghetti** — each module has its own hook, page, and component folder
- **Hooks for data** — all Supabase queries live in `/hooks`
- **Memo for performance** — memoize cards and sidebars that render in lists
- **Error boundaries** — wrap major sections for graceful degradation

---

## License

Private project. All rights reserved.
