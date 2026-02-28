# Contributing to FindOO

> Guidelines for contributing to the FindOO BFSI professional network platform.

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Workflow](#pull-request-workflow)
- [Code Review Guidelines](#code-review-guidelines)
- [Coding Standards](#coding-standards)
- [Common Pitfalls](#common-pitfalls)

---

## Code of Conduct

- Be respectful and constructive in all interactions
- Focus on the code, not the person
- Help others learn — explain the "why" behind feedback
- Follow the [Community Guidelines](/community-guidelines)

---

## Getting Started

1. **Clone the repo** and install dependencies:
   ```bash
   git clone <YOUR_GIT_URL>
   cd findoo
   npm install   # or: bun install
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Seed test data** (optional but recommended):
   - Call the `seed-users` edge function (creates 8 test accounts with password `Test@1234`)
   - Call the `seed-data` edge function (populates posts, jobs, events, etc.)

4. **Read the docs:**
   - [Architecture Guide](docs/architecture.md) — system design, module map, ERD
   - [API Reference](docs/api-reference.md) — all hooks with params/returns
   - [Edge Functions](docs/edge-functions.md) — backend function schemas
   - [Getting Started](docs/getting-started.md) — conventions and design system

---

## Branching Strategy

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready code (auto-deployed) |
| `feature/<name>` | New features (e.g., `feature/job-alerts`) |
| `fix/<name>` | Bug fixes (e.g., `fix/notification-count`) |
| `refactor/<name>` | Code improvements without behavior change |
| `docs/<name>` | Documentation-only changes |

### Rules
- Always branch from `main`
- Keep branches short-lived (< 1 week ideally)
- One feature per branch — don't mix unrelated changes
- Delete branches after merge

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | When to use |
| --- | --- |
| `feat` | New feature or user-facing change |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace (no logic change) |
| `chore` | Build config, dependencies, tooling |
| `perf` | Performance improvement |

### Scopes

Use the module name: `feed`, `jobs`, `events`, `directory`, `vault`, `profile`, `network`, `admin`, `auth`, `ui`, `hooks`, `lib`

### Examples

```
feat(jobs): add salary range filter to job search
fix(feed): correct optimistic rollback on failed bookmark
refactor(hooks): extract batch loader into shared utility
docs(api): add useVault hook documentation
test(feed): add normalization edge case tests
perf(feed): memoize post card comment section
```

### Rules
- Use imperative mood: "add feature" not "added feature"
- Keep subject line under 72 characters
- Reference issue numbers when applicable: `fix(feed): resolve #42 infinite scroll race condition`

---

## Pull Request Workflow

### 1. Before You Start
- Check if an issue exists for what you're building
- For large features, discuss approach first (create an issue or reach out)

### 2. Create Your Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

### 3. Develop
- Follow the [Coding Standards](#coding-standards)
- Write/update tests for logic changes
- Test both light and dark modes
- Test on mobile viewport (< 768px)

### 4. Self-Review Checklist

Before requesting review, verify:

- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] All existing tests pass (`npm test`)
- [ ] New hooks include JSDoc header
- [ ] Error states include `toast.error()` feedback
- [ ] Interactive elements have `aria-label` attributes
- [ ] No raw color values — uses design system tokens
- [ ] Both light and dark modes visually verified
- [ ] Mobile responsive layout verified
- [ ] No `console.log` statements left in code

### 5. Submit PR
- Title follows commit convention: `feat(jobs): add salary filter`
- Description includes:
  - **What**: Brief summary of changes
  - **Why**: Context/motivation
  - **How**: Technical approach (if non-obvious)
  - **Screenshots**: For UI changes (both themes if applicable)
  - **Testing**: What you tested and how

### 6. Address Feedback
- Respond to all comments (even if just "done" or "won't fix because...")
- Push fixes as new commits (don't force-push during review)
- Re-request review after addressing feedback

---

## Code Review Guidelines

### For Reviewers

- **Be specific**: "This could cause a race condition because..." > "This looks wrong"
- **Suggest alternatives**: Show code examples when possible
- **Prioritize**: Mark comments as `nit:` (nice-to-have) vs blocking issues
- **Approve liberally**: Don't block on style preferences if code is correct
- **Test locally**: For UI changes, pull the branch and verify visually

### Review Checklist

- [ ] Logic is correct and handles edge cases
- [ ] No security issues (RLS bypass, exposed secrets, XSS)
- [ ] Performance: no unnecessary re-renders, N+1 queries
- [ ] Accessibility: keyboard navigation, screen reader support
- [ ] Error handling: graceful failures with user feedback
- [ ] Naming: clear, consistent with existing patterns

### For Authors

- Keep PRs small (< 400 lines changed ideally)
- Separate refactoring from feature work
- Add context comments on non-obvious decisions
- Respond to feedback promptly

---

## Coding Standards

### Component Patterns

```tsx
// ✅ Good: Memoized with clear prop interface
interface JobCardProps {
  job: Job;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export const JobCard = memo(function JobCard({ job, onSelect, compact = false }: JobCardProps) {
  // ...
});
```

### Hook Patterns

```tsx
// ✅ Good: JSDoc + TanStack Query + error toast
/**
 * useMyFeature — Description of what this hook does.
 * 
 * Returns feature data with automatic cache invalidation.
 */
export function useMyFeature(filters?: Filters) {
  return useQuery({
    queryKey: ["my-feature", filters],
    queryFn: async () => {
      const { data, error } = await supabase.from("table").select("*");
      if (error) {
        toast.error("Failed to load feature");
        throw error;
      }
      return data;
    },
  });
}
```

### Design System

```tsx
// ✅ Good: Semantic tokens
<div className="bg-card text-card-foreground border-border" />
<Badge className="bg-primary/10 text-primary" />

// ❌ Bad: Raw color values
<div className="bg-white text-gray-900 border-gray-200" />
<Badge className="bg-blue-100 text-blue-800" />
```

### Accessibility

```tsx
// ✅ Good: Accessible interactive element
<div
  role="button"
  tabIndex={0}
  aria-label="View job details"
  onClick={handleClick}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
/>

// ❌ Bad: Missing accessibility
<div onClick={handleClick} />
```

---

## Common Pitfalls

### 1. RLS Policy Errors
**Symptom**: `new row violates row-level security policy`
**Fix**: Ensure `user_id` (or equivalent) is set to `auth.uid()` in insert statements. Check that the user is authenticated.

### 2. Realtime Not Working
**Fix**: Verify the table is added to `supabase_realtime` publication. Check RLS allows SELECT for the subscribing user.

### 3. Infinite Re-renders
**Fix**: Wrap callbacks in `useCallback`, memoize expensive computations with `useMemo`, use `React.memo` on card components.

### 4. Stale Query Data
**Fix**: Call `queryClient.invalidateQueries({ queryKey: [...] })` in mutation `onSuccess`. Use specific query keys, not broad invalidation.

### 5. Auth Session Lost
**Fix**: Don't call `supabase.auth.getSession()` in render — use it in `useEffect`. The Supabase client auto-refreshes tokens.

### 6. Type Errors with Database Types
**Fix**: Import types from `@/integrations/supabase/types`. Never edit `types.ts` directly — it's auto-generated.

---

## Questions?

- Check the [Developer Docs](/developer) for detailed API reference
- Review existing code for patterns — consistency is key
- When in doubt, ask!
