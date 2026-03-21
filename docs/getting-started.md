# findoo — Developer Getting Started Guide

> Setup, folder conventions, design system, testing, and contribution guidelines.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** or **bun** (bun recommended for speed)
- A Lovable account (backend is auto-provisioned)

---

## Quick Start

```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd findoo

# Install dependencies
npm install
# or: bun install

# Start dev server
npm run dev
# or: bun dev
```

The app opens at `http://localhost:5173`. Backend is automatically connected via Lovable Cloud — no `.env` setup needed.

---

## Project Structure

```
findoo/
├── docs/                    # ← You are here
│   ├── architecture.md      # System design, ERD, data flow, security
│   ├── api-reference.md     # Hook & component API docs
│   ├── edge-functions.md    # Backend function documentation
│   ├── ir-tab-design.md     # IR tab design specification
│   └── getting-started.md   # This file
│
├── public/                  # Static assets (favicon, PWA icons, sitemap, robots.txt)
├── supabase/
│   ├── config.toml          # Backend config (auto-managed, DO NOT EDIT)
│   ├── functions/           # Edge functions (9 functions, auto-deployed)
│   └── migrations/          # DB migrations (read-only)
│
├── src/
│   ├── assets/              # Logo images (imported as ES6 modules)
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (53 components)
│   │   ├── skeletons/       # Loading skeletons per module (7 files)
│   │   ├── selectors/       # Location, Certification, Language pickers
│   │   ├── illustrations/   # SVG empty-state illustrations
│   │   ├── decorative/      # Section decorations for public pages
│   │   ├── feed/            # Feed module components (12 files)
│   │   ├── jobs/            # Jobs module components (7 files)
│   │   ├── events/          # Events module components (6 files)
│   │   ├── directory/       # Showcase module components (5 files)
│   │   ├── network/         # Network module components (2 files)
│   │   ├── profile/         # Profile module components (18 files)
│   │   ├── vault/           # Vault module components (3 files)
│   │   ├── gamification/    # XP, badges, streaks, challenges (10 files)
│   │   ├── admin/           # Admin panel components (20+ files)
│   │   ├── blog/            # Blog polls and surveys
│   │   ├── compare/         # Comparison tables
│   │   ├── landing/         # Landing page sections
│   │   ├── pitch/           # Pitch deck renderer
│   │   └── discover/        # Discover sidebar (1 file)
│   ├── contexts/            # React contexts (RoleContext)
│   ├── data/                # Static data (certifications, languages, locations, comparisons, pitches)
│   ├── hooks/               # 25 custom hooks — one per module
│   ├── integrations/        # Auto-generated Supabase client & types (DO NOT EDIT)
│   ├── lib/                 # 11 utility modules (utils, storage, session, sanitize, throttle, gamification, etc.)
│   ├── pages/               # 50 route-level page components (+ 18 admin sub-routes)
│   ├── test/                # 16 test files (unit + integration)
│   ├── index.css            # Design system tokens (HSL custom properties)
│   ├── App.tsx              # Root component (providers, routes)
│   └── main.tsx             # Entry point
│
├── tailwind.config.ts       # Extended Tailwind config with custom colors
├── vite.config.ts           # Vite config with path aliases
├── vitest.config.ts         # Test config
└── package.json
```

---

## Key Conventions

### File Naming
- **Components:** PascalCase (`PostCard.tsx`, `CreateEventDialog.tsx`)
- **Hooks:** camelCase with `use` prefix (`useJobs.ts`, `useFeedPosts.ts`)
- **Lib modules:** kebab-case (`session-manager.ts`, `role-config.ts`)
- **Pages:** PascalCase (`Feed.tsx`, `Jobs.tsx`)

### Component Organization
- Each module has its own folder under `src/components/`
- Components are co-located with their module (e.g., `components/jobs/JobCard.tsx`)
- Shared UI primitives live in `components/ui/`
- Skeletons live in `components/skeletons/`
- Shared layout components live at the root of `components/` (AppLayout, ProtectedRoute, etc.)

### Hook Patterns
- One hook file per module (e.g., `useJobs.ts` exports all job-related hooks)
- Use TanStack `useQuery` for reads, `useMutation` for writes
- Always include `toast.error()` in `onError` callbacks
- Invalidate relevant query keys in `onSuccess`
- Export TypeScript interfaces for return types
- Include JSDoc headers on all hooks

### State Management
- **Server state:** TanStack React Query (all DB data)
- **Auth/role state:** RoleContext
- **Theme:** ThemeProvider (next-themes)
- **Local state:** React `useState` only for UI-specific state
- **No Redux, Zustand, or other state libraries**

---

## Design System

### CSS Custom Properties

All colors are defined as HSL values in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --primary: 240 100% 27%;
  --accent: 240 80% 50%;
  --investor: 142 76% 36%;
  --intermediary: 221 83% 53%;
  --issuer: 262 83% 58%;
  --gold: 45 93% 47%;
}
```

### Rules

1. **Never use raw color values** in components — always use semantic tokens
2. **Role colors** are mapped via `src/lib/role-config.ts`
3. **Dark mode** is supported via `.dark` class — define both `:root` and `.dark` tokens
4. Use Tailwind classes that reference CSS vars: `bg-primary`, `text-muted-foreground`, etc.

### Tailwind Extensions

Custom colors are registered in `tailwind.config.ts`:
```ts
colors: {
  investor: "hsl(var(--investor))",
  intermediary: "hsl(var(--intermediary))",
  issuer: "hsl(var(--issuer))",
  gold: "hsl(var(--gold))",
}
```

### shadcn/ui Components

53 components available in `src/components/ui/`. Add new ones via:
```bash
npx shadcn-ui@latest add <component-name>
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test
# or: bun test

# Run specific test file
npx vitest run src/test/useFeedPosts.test.ts

# Run with coverage
npx vitest run --coverage
```

### Test Structure

```
src/test/
├── setup.ts                              # Global test setup (mocks, providers)
│
│ # Unit Tests
├── useFeedPosts.test.ts                  # Feed post normalization & defaults
├── usePostInteractions.test.ts           # Optimistic update/rollback arithmetic
├── useConnectionActions.test.ts          # Connection state transitions
├── session-manager.test.ts              # Session lifecycle (register, touch, remove)
├── sanitize.test.ts                     # DOMPurify XSS prevention
├── throttle.test.ts                     # Action guard timing
├── example.test.ts                      # Smoke test
│
│ # Component Tests
├── PostCard.test.tsx                     # PostCard render & interaction
├── JobCard.test.tsx                      # JobCard render & accessibility
├── EventCard.test.tsx                    # EventCard render & accessibility
├── ListingCard.test.tsx                  # ListingCard render & accessibility
│
│ # Integration Tests
├── Auth.integration.test.tsx            # Sign-up, sign-in, sign-out flows
├── ConnectionFlow.integration.test.tsx  # Follow/connect/disconnect journeys
├── CreatePostComposer.integration.test.tsx # Post creation with all types
├── PostJobDialog.integration.test.tsx   # Job posting validation
└── Infrastructure.integration.test.tsx  # Rate limiting, session management
```

### Testing Conventions

- Test files live in `src/test/` (not co-located)
- Use `describe` / `it` blocks with descriptive names
- Unit tests: Test pure logic (normalization, state transitions, arithmetic)
- Component tests: Verify render output, accessibility attributes, user interactions
- Integration tests: Test full flows with mocked Supabase client
- Mock Supabase client for DB-dependent tests

---

## Security Practices

### Input Sanitization
All user-generated content must pass through `sanitizeContent()` from `src/lib/sanitize.ts` before being submitted to the database. This uses DOMPurify to prevent XSS attacks.

### Action Throttling
Use `throttle()` from `src/lib/throttle.ts` to prevent rapid-fire API calls on user actions (likes, bookmarks, connection requests). Default: 500ms guard.

### Session Management
The platform enforces max 3 concurrent sessions per user via `src/lib/session-manager.ts`. Sessions are automatically cleaned up after 7 days of inactivity.

---

## Auto-Generated Files (DO NOT EDIT)

| File                                    | Purpose                         |
| --------------------------------------- | ------------------------------- |
| `src/integrations/supabase/client.ts`   | Supabase SDK client instance    |
| `src/integrations/supabase/types.ts`    | Database type definitions       |
| `.env`                                  | Environment variables           |
| `supabase/config.toml`                  | Backend configuration           |

These are managed by Lovable Cloud and regenerated automatically.

---

## Deployment

- **Frontend:** Click "Publish" in Lovable → "Update" to deploy
- **Edge functions:** Auto-deployed on save
- **Database migrations:** Auto-applied

### URLs
- **Preview:** `https://id-preview--<project-id>.lovable.app`
- **Production:** `https://findooin.lovable.app`

---

## Seeding Test Data

For development, seed the database with realistic BFSI data:

1. Call the `seed-users` edge function first (creates 8 test accounts)
2. Call the `seed-data` edge function (creates posts, jobs, events, etc.)

All test accounts use password: `Test@1234`

See [Edge Functions Reference](./edge-functions.md) for details.

---

## PR Checklist

- [ ] TypeScript compiles without errors
- [ ] All existing tests pass (`npm test`)
- [ ] New hooks include JSDoc header
- [ ] Error states include `toast.error()` feedback
- [ ] Interactive elements have `aria-label` attributes
- [ ] No raw color values — uses design system tokens
- [ ] Relevant unit tests added/updated
- [ ] Both light and dark modes visually verified
- [ ] Mobile responsive layout verified
- [ ] Input sanitization applied on user-generated content
