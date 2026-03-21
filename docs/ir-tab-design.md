# IR (Investor Relations) Tab — Design Specification

## Overview
The IR tab appears on **Issuer profiles only** and serves as a mini investor relations portal. It transforms Issuer profiles from simple business cards into comprehensive, trust-building transparency hubs — similar to the IR section on corporate websites but integrated directly into the findoo network.

---

## Tab Visibility
- **Visible to**: Everyone viewing an Issuer's profile
- **Tab label**: "IR" with a `Landmark` icon
- **Position**: After "Directory" tab, before "Vault" (for own profile)
- **Condition**: Profile must have at least one `issuer` role in `user_roles`

---

## Section Layout (Top to Bottom)

### 1. IR Overview Card
- **Company/Fund Name** (from `organization` field)
- **SEBI/RBI Registration Number** (from `regulatory_ids`)
- **AUM (Assets Under Management)** — manual input field (numeric + currency)
- **Fund/Entity Category** — dropdown (AMC, NBFC, Insurance, Banking, AIF, PMS, etc.)
- **IR Contact Email** — separate from personal email
- **IR Contact Phone** — separate from personal phone
- **Last Updated** timestamp

### 2. Key Performance Metrics (Card Grid)
Four metric cards displayed in a 2x2 grid:
- **NAV / Share Price** — numeric with date
- **1Y Returns** — percentage with up/down indicator  
- **AUM / Portfolio Size** — formatted currency
- **Investor Count** — numeric

> All entered manually by the Issuer. Future: API integration with AMFI/BSE.

### 3. Documents Repository
A structured document list with categories:
- **Annual Reports** — PDF uploads with year labels
- **Factsheets** — Monthly/quarterly factsheets
- **SID/SAI/KIM** — Scheme Information Documents
- **Prospectus** — IPO/NFO prospectus documents
- **Financial Statements** — Balance sheets, P&L
- **Regulatory Filings** — SEBI/RBI submissions

Each document shows: File name, Category badge, Upload date, Download button.
Storage: Uses the existing `vault` bucket with `source = 'ir'` tagging.

### 4. Corporate Events Calendar
A timeline of upcoming and past corporate events:
- **AGM/EGM** — date, venue, agenda link
- **Earnings Call** — date, time, dial-in/webcast link
- **Dividend Announcements** — record date, amount
- **NFO/IPO Launch** — dates, DRHP link
- **Board Meetings** — date, purpose

Pulls from the existing `events` table filtered by the Issuer's own events with relevant categories.

### 5. Shareholder Information (Optional Section)
- **Registrar & Transfer Agent** — name + contact
- **Compliance Officer** — name + designation
- **Grievance Redressal** — SEBI SCORES link
- **Unclaimed Dividends** — amount + IEPF link (if applicable)

### 6. Press & Media (Optional)
- Links to press releases and media coverage
- Can leverage the `publications` table with `publication_type = 'press_release'`

---

## Database Schema (New Table)

```sql
CREATE TABLE public.ir_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  fund_category text,
  aum numeric,
  aum_currency text DEFAULT 'INR',
  aum_as_of date,
  nav numeric,
  nav_as_of date,
  one_year_return numeric,
  investor_count integer,
  ir_email text,
  ir_phone text,
  registrar_name text,
  compliance_officer text,
  grievance_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

RLS: Public read, owner write (with issuer role check).

---

## UI Components to Build

1. `IRTab.tsx` — Main tab container
2. `IROverviewCard.tsx` — Company/fund overview with edit mode
3. `IRMetricsGrid.tsx` — 2x2 performance metrics  
4. `IRDocumentRepository.tsx` — Document upload/list (leverages Vault)
5. `IRCorporateEvents.tsx` — Event timeline
6. `IRShareholderInfo.tsx` — Optional compliance section
7. `EditIRProfileDialog.tsx` — Form to edit IR data

---

## Design Tokens
- Uses existing card patterns (`rounded-xl border border-border bg-card`)
- Issuer role color for accents: `hsl(165 50% 40%)` (Teal Green)
- Document categories use `Badge` with `variant="secondary"`
- Metrics use `font-heading` for numbers

---

## Implementation Priority
1. **Phase 1**: IR Profile + Metrics + Document Repository (core value)
2. **Phase 2**: Corporate Events integration
3. **Phase 3**: Shareholder Info + Press section

---

## Notes
- The IR tab gives Issuers a reason to maintain an active profile
- It differentiates findoo from LinkedIn by providing finance-specific transparency
- Documents in the IR section should be publicly accessible (unlike Vault which is private)
- Future: AMFI API integration for automatic NAV/AUM updates
