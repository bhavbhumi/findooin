

# FinNet — India's Financial Network

## Vision
A regulated, trust-first financial network connecting **Issuers**, **Intermediaries**, and **Investors** across India's financial ecosystem (SEBI, RBI, IRDAI, AMFI, PFRDA). Think of it as the missing infrastructure layer where verified financial entities and investors discover, connect, share, and transact — all within a clean, minimal, trust-driven experience.

---

## MVP Scope: Network & Feed Foundation

### 1. Authentication & Onboarding
- **Sign up / Sign in** with email + password (Supabase Auth)
- **Role selection** during onboarding: Issuer, Intermediary, or Investor
- **Sub-type selection**:
  - *Issuer*: Listed Company, AMC, NBFC, Insurance Company, Bank, Government Entity
  - *Intermediary*: Broker, RIA, MF Distributor, Insurance Agent, Research Analyst, CA/CS
  - *Investor*: Retail Individual, HNI, Institutional (FII/DII), NRI
- **Profile setup** wizard tailored to each role

### 2. Profile System (Role-Based)
- **Issuer Profile**: Entity name, registration number, regulator (SEBI/RBI/IRDAI), sector, about, website, key people, verification badge (pending/verified)
- **Intermediary Profile**: Name, registration type & number (e.g., SEBI RIA #INH000XXXXX), services offered, experience, certifications, verification badge
- **Investor Profile**: Display name, investor type, interests/sectors, investment style, bio (privacy-respecting — no financial details exposed)
- **Verification status indicator**: Unverified → Pending → Verified (with badge)

### 3. Verification Workflow (Manual MVP)
- Issuers & Intermediaries upload registration certificate / SEBI/RBI/IRDAI registration proof
- Admin dashboard to review, approve, or reject verification requests
- Verified entities get a trust badge on their profile
- Investors don't require regulatory verification

### 4. Discovery & Connections
- **Search & Filter**: Find entities by role, sub-type, regulator, sector, location
- **Entity Directory**: Browse verified Issuers and Intermediaries
- **Connection requests**: Send, accept, reject — like LinkedIn but financial-context
- **Connection types**: Follow (one-way, public) and Connect (mutual, unlocks messaging)
- **Recommendations**: "Suggested connections" based on role and interests

### 5. Feed & Content
- **Financial Feed**: Posts by connected entities and followed accounts
- **Post types**: Text updates, market commentary, research notes, announcements, articles
- **Engagement**: Like, comment, share, bookmark
- **Role-tagged posts**: Posts show the author's verified role & entity clearly
- **Content moderation**: Flag/report system for misleading financial content
- **Hashtags & Topics**: Follow financial topics (#IPO, #MutualFunds, #RBI, #Budget2026)

### 6. Messaging (Basic)
- Direct messages between connected users
- Message requests from non-connected users (accept/decline)
- Role & verification status visible in chat

### 7. Notifications
- Connection requests, post engagement, messages
- Regulatory announcements from followed issuers
- In-app + email notifications

---

## Pages & Navigation

| Page | Description |
|------|-------------|
| **Landing Page** | Value proposition, role-based CTAs, trust indicators |
| **Sign Up / Sign In** | Auth flow with role selection |
| **Onboarding Wizard** | Role-specific profile setup (3-4 steps) |
| **Home Feed** | Personalized financial feed |
| **Discover** | Search & browse directory of entities |
| **Profile** | Role-based profile view (own + others) |
| **Connections** | Manage connections, requests, suggestions |
| **Messages** | Direct messaging |
| **Notifications** | Activity center |
| **Admin Panel** | Verification queue, user management |
| **Settings** | Account, privacy, notification preferences |

---

## Design Direction
- **Minimal & Clean** — white space, clear typography, trust through simplicity
- **Color palette**: Deep navy/indigo primary (trust, finance), with green accents (growth, verified)
- **Verification badges** prominently displayed — the core trust signal
- **Role-based UI tinting** — subtle visual cues for Issuer vs Intermediary vs Investor contexts
- **Mobile-responsive** from day one

---

## Database Structure (Supabase)

- **profiles** — extends auth.users with role, sub_type, bio, avatar, verification_status
- **entities** — for Issuers & Intermediaries: registration details, regulator, documents
- **verification_requests** — document uploads, admin review status, notes
- **connections** — from_user, to_user, type (follow/connect), status (pending/accepted)
- **posts** — author, content, type, hashtags, timestamps
- **post_interactions** — likes, comments, bookmarks, shares
- **messages** — sender, receiver, content, read_status
- **notifications** — user, type, reference, read_status

---

## Future Phases (Post-MVP)
- **Phase 2**: Job Board, Event Management, Transact & Invest integration
- **Phase 3**: API-based auto-verification (SEBI/RBI registries), Advertisement Utility
- **Phase 4**: Analytics dashboards, subscription tiers, premium features
- **Phase 5**: Multi-country expansion with additional regulatory frameworks

