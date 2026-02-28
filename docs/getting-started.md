# FindOO — Developer Getting Started Guide

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
│   ├── architecture.md      # System design & data flow
│   ├── api-reference.md     # Hook & component API docs
│   ├── edge-functions.md    # Backend function documentation
│   └── getting-started.md   # This file
│
├── public/                  # Static assets (favicon, PWA icons, sitemap)
├── supabase/
│   ├── config.toml          # Backend config (auto-managed, DO NOT EDIT)
│   ├── functions/           # Edge functions (auto-deployed)
│   └── migrations/          # DB migrations (read-only)
│
├── src/
│   ├── assets/              # Logo images (imported as ES6 modules)
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (50+ components)
│   │   ├── skeletons/       # Loading skeletons per module
│   │   ├── selectors/       # Location, Certification, Language pickers
│   │   ├── feed/            # Feed module components
│   │   ├── jobs/            # Jobs module components
│   │   ├── events/          # Events module components
│   │   ├── directory/       # Directory module components
│   │   ├── network/         # Network module components
│   │   ├── profile/         # Profile module components
│   │   ├── vault/           # Vault module components
│   │   ├── admin/           # Admin panel components
│   │   └── discover/        # Discover sidebar
│   ├── contexts/            # React contexts (RoleContext)
│   ├── data/                # Static data (certifications, languages, locations)
│   ├── hooks/               # Custom hooks (20+) — one per module
│   ├── integrations/        # Auto-generated Supabase client & types (DO NOT EDIT)
│   ├── lib/                 # Utilities (storage, session, vcard, role-config)
│   ├── pages/               # Route-level page components
│   ├── test/                # Vitest unit tests
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
- **Lib modules:** camelCase (`session-manager.ts`, `role-config.ts`)
- **Pages:** PascalCase (`Feed.tsx`, `Jobs.tsx`)

### Component Organization
- Each module has its own folder under `src/components/`
- Components are co-located with their module (e.g., `components/jobs/JobCard.tsx`)
- Shared UI primitives live in `components/ui/`
- Skeletons live in `components/skeletons/`

### Hook Patterns
- One hook file per module (e.g., `useJobs.ts` exports all job-related hooks)
- Use TanStack `useQuery` for reads, `useMutation` for writes
- Always include `toast.error()` in `onError` callbacks
- Invalidate relevant query keys in `onSuccess`
- Export TypeScript interfaces for return types

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

50+ components available in `src/components/ui/`. Add new ones via:
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
```

### Test Structure

```
src/test/
├── setup.ts                      # Global test setup
├── useFeedPosts.test.ts          # Feed post normalization
├── usePostInteractions.test.ts   # Optimistic update arithmetic
├── useConnectionActions.test.ts  # Connection state transitions
├── session-manager.test.ts       # Session lifecycle
└── example.test.ts               # Smoke test
```

### Testing Conventions

- Test files live in `src/test/` (not co-located)
- Use `describe` / `it` blocks with descriptive names
- Test pure logic (normalization, state transitions, arithmetic) — not React rendering
- Mock Supabase client for DB-dependent tests

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
- [ ] New hooks include JSDoc header
- [ ] Error states include `toast.error()` feedback
- [ ] Interactive elements have `aria-label` attributes
- [ ] No raw color values — uses design system tokens
- [ ] Relevant unit tests added/updated
- [ ] Both light and dark modes visually verified
