# TrustCircle IQ™ — Intent-Aware Professional Trust Discovery Engine

**Provisional Patent Document**  
**Applicant:** FindOO (India)  
**Filing Date:** 2026-03-17  
**Classification:** G06Q 50/00 — Information and Communication Technology for Social Networking  

---

## 1. Title of Invention

**"TrustCircle IQ™: A Role-Asymmetric, Intent-Aware, Trust-Propagating Discovery Algorithm for Regulated Professional Networks"**

---

## 2. Abstract

AffinityRank™ is a discovery and ranking algorithm designed for regulated professional ecosystems (BFSI — Banking, Financial Services, and Insurance). Unlike conventional "People You May Know" algorithms that rely on mutual connections and demographic similarity, AffinityRank™ introduces a multi-dimensional scoring engine that considers:

1. **Role Asymmetry** — What a viewer needs differs based on their professional role
2. **Behavioral Intent** — What the user is actively trying to accomplish
3. **Trust Inheritance** — Professional introductions and referral chains as first-class trust signals
4. **Regulatory Affinity** — Shared certifications, regulators, and compliance context
5. **Temporal Decay** — Freshness of interactions and trust signals

The system produces a personalized, contextual discovery feed where the same target user appears differently (or not at all) depending on who is viewing, creating a fundamentally different approach from symmetric social graphs.

---

## 3. Background & Prior Art Deficiency

### 3.1 Existing Approaches

| Platform | Algorithm | Limitation |
|----------|-----------|------------|
| LinkedIn | Collaborative filtering + degree separation | Symmetric — treats all connections equally regardless of professional role |
| Facebook | Social graph + engagement signals | Consumer-oriented, no regulatory awareness |
| Xing | Industry matching | Static categorization, no behavioral intent |
| Shaadi.com (matrimonial) | Preference matching | Two-sided but only for one use case |

### 3.2 Gap in Prior Art

No existing discovery system combines:
- **Asymmetric role-directed discovery** (what an Investor sees ≠ what an Intermediary sees)
- **Trust chain propagation via professional introductions** (referrals inherit trust position)
- **Behavioral intent overlay** (platform actions reveal what the user is seeking)
- **Regulation-aware affinity scoring** (shared SEBI/AMFI/IRDAI context)
- **Lead sharing as a discovery signal** (B2B prospecting within professional networks)

---

## 4. Detailed Description

### 4.1 Core Concept: Trust Circles

Every user exists within a three-tier discovery framework relative to every other user:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │                                     │   │
│   │   ┌─────────────────────────────┐   │   │
│   │   │                             │   │   │
│   │   │     1ST CIRCLE              │   │   │
│   │   │  Direct Trust (Score > 0.7) │   │   │
│   │   │                             │   │   │
│   │   └─────────────────────────────┘   │   │
│   │                                     │   │
│   │        2ND CIRCLE                   │   │
│   │     Potential (Score 0.4–0.7)       │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│            3RD CIRCLE                       │
│         Ecosystem (Score 0.15–0.4)          │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 The AffinityRank™ Formula

```
AffinityScore(viewer, target) =
    RoleWeight(viewer.role, target.role)
  × IntentMultiplier(viewer.behavior)
  × TrustProximity(viewer, target)
  × ActivityResonance(viewer, target)
  × FreshnessDecay(last_interaction)
  + ReferralBoost(referral_chain)
```

Where each component is defined as:

---

#### 4.2.1 RoleWeight — Asymmetric Role-Directed Scoring

The weight assigned depends on BOTH the viewer's and target's roles.

**Role Weight Matrix (Viewer → Target):**

| Viewer \ Target | Investor | Intermediary | Issuer |
|----------------|----------|-------------|--------|
| **Investor**   | 0.3 (peer) | **0.9** (advisor need) | **0.7** (product need) |
| **Intermediary** | **0.85** (client prospect) | 0.5 (peer/partner) | **0.75** (product sourcing) |
| **Issuer**     | **0.7** (demand/investor) | **0.9** (distribution) | 0.4 (co-issuer/partner) |

**Key Insight:** The matrix is NOT symmetric. An Investor seeing an Intermediary (0.9) is weighted differently than an Intermediary seeing an Investor (0.85), because the *intent context* differs — one seeks advice, the other seeks clients.

---

#### 4.2.2 IntentMultiplier — Behavioral Signal Detection

The system detects implicit intent from user actions:

| Detected Behavior Pattern | Inferred Intent | Multiplier |
|--------------------------|-----------------|------------|
| Browsing listings, saving products | "Seeking investment opportunities" | 1.5× for Issuers, 1.3× for Intermediaries |
| Posting job listings, viewing applications | "Building team / hiring" | 1.4× for same-industry professionals |
| Searching for certifications (e.g., "CFP", "AMFI registered") | "Seeking verified advisors" | 1.6× for verified Intermediaries |
| Event registration, card exchanges | "Active networking" | 1.3× for event co-attendees |
| Sharing leads, making introductions | "Business development" | 1.4× for complementary roles |
| Browsing competitor profiles (same role) | "Competitive intelligence" | 1.2× for same-role peers |
| Profile completeness < 50% | "New/passive user" | 0.8× (reduce noise) |
| Posting thought leadership content | "Building authority" | 1.3× for potential followers |

**Decay:** Intent signals decay over 7 days (half-life), requiring continuous behavioral confirmation.

---

#### 4.2.3 TrustProximity — Multi-Factor Trust Score

```
TrustProximity(viewer, target) =
    ConnectionDegree(viewer, target) × 0.35
  + VerificationAlignment(viewer, target) × 0.25
  + RegulatoryAffinity(viewer, target) × 0.20
  + MutualConnectionDensity(viewer, target) × 0.20
```

**ConnectionDegree Values:**
- 1st degree (direct connection): 1.0
- 2nd degree (friend of friend): 0.6
- 3rd degree (3 hops): 0.25
- No connection path: 0.1

**VerificationAlignment:**
- Both verified: 1.0
- Target verified, viewer unverified: 0.8
- Target unverified, viewer verified: 0.4
- Neither verified: 0.3

**RegulatoryAffinity:**
- Same primary regulator (e.g., both SEBI-registered): 1.0
- Complementary regulators (e.g., SEBI + AMFI): 0.7
- Different regulatory domains: 0.2

**MutualConnectionDensity:**
- `min(mutual_connections / 10, 1.0)` — caps at 10 mutuals

---

#### 4.2.4 ActivityResonance — Shared Interest Signals

```
ActivityResonance(viewer, target) =
    HashtagOverlap(viewer, target) × 0.30
  + EventCoAttendance(viewer, target) × 0.30
  + ContentEngagement(viewer, target) × 0.25
  + SpecializationMatch(viewer, target) × 0.15
```

- **HashtagOverlap:** Jaccard similarity of top-20 used hashtags
- **EventCoAttendance:** `min(shared_events / 3, 1.0)`
- **ContentEngagement:** Has viewer liked/commented on target's posts? Binary 0/1
- **SpecializationMatch:** Jaccard similarity of specialization arrays

---

#### 4.2.5 FreshnessDecay — Temporal Relevance

```
FreshnessDecay(days_since_last_signal) =
    e^(-0.05 × days)
```

Where `days` = days since the most recent interaction signal (post, login, event attendance, card exchange).

| Days Inactive | Decay Factor |
|--------------|-------------|
| 0 (today) | 1.00 |
| 7 days | 0.70 |
| 14 days | 0.50 |
| 30 days | 0.22 |
| 60 days | 0.05 |

Users inactive for 60+ days effectively disappear from discovery.

---

#### 4.2.6 ReferralBoost — Trust Propagation via Introduction Chains

This is the **novel contribution** — professional introductions as a first-class scoring signal.

```
ReferralBoost(viewer, target) =
    Σ (ReferrerCirclePosition × ReferralTypeWeight × ReferralDecay)
    for each referral_path(viewer, target)
```

**ReferrerCirclePosition:**
| Referrer's position relative to viewer | Base Multiplier |
|---------------------------------------|----------------|
| 1st Circle (direct connection) | 1.0 |
| 2nd Circle | 0.6 |
| 3rd Circle | 0.3 |
| No existing relationship | 0.15 |

**ReferralTypeWeight:**
| Referral Action | Weight |
|----------------|--------|
| Explicit introduction ("I recommend this person") | 1.0 |
| Digital card share at event (NFC/QR) | 0.8 |
| Lead shared via platform CRM | 0.7 |
| Passive referral (referral link signup) | 0.4 |

**ReferralDecay:**
- Not acted upon in 30 days → drops one circle
- Accepted as connection → permanently enters organic circle
- Leads to business transaction (enquiry/application) → "Deal Catalyst" badge, maximum trust propagation

**Conversion Feedback Loop:**
When a referral converts (connection accepted, enquiry made), the referrer's future introductions carry +20% higher trust weight — creating a meritocratic referral quality score.

---

### 4.3 Role-Specific Discovery Paths

#### 4.3.1 Investor's Discovery View

| Circle | Who They See | Why |
|--------|-------------|-----|
| **1st** | Connected Intermediaries (advisors), Referred contacts | Direct advisory relationships |
| **2nd** | Issuers with matching products, Co-investors from events | Product-market fit, peer validation |
| **3rd** | Verified professionals in same geography, High-engagement thought leaders | Ecosystem awareness |

#### 4.3.2 Intermediary's Discovery View

| Circle | Who They See | Why |
|--------|-------------|-----|
| **1st** | High-value Investor prospects, Issuer product partners | Core business relationships |
| **2nd** | **Investors' Investors** (2nd-degree client prospecting via existing clients), Complementary intermediaries | Warm prospecting through trust chains |
| **3rd** | Unconnected Issuers with new products, Rising professionals in adjacent specializations | Market expansion |

#### 4.3.3 Issuer's Discovery View

| Circle | Who They See | Why |
|--------|-------------|-----|
| **1st** | Connected Intermediaries (distribution partners) | Core distribution network |
| **2nd** | Investors (demand/direct reach), Shared leads from partners | Capital raising, investor relations |
| **3rd** | Other Issuers (partnership/co-issue opportunities), Industry thought leaders | Strategic alliances |

---

### 4.4 System Architecture

```
┌──────────────────────────────────────────────────────┐
│                   CLIENT (React)                      │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Discover Page│  │ PersonCard+  │  │ DiscoverSide│ │
│  │ (Tabs/Filter)│  │ CircleBadge  │  │ bar+Insights│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │        │
│  ┌──────┴─────────────────┴─────────────────┴──────┐ │
│  │          useAffinityRank() Hook                  │ │
│  │  - Fetches scored results from edge function     │ │
│  │  - Caches with React Query                       │ │
│  │  - Handles pagination + circle filtering         │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼────────────────────────────┐
│              EDGE FUNCTION: affinity-rank             │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  1. Identify viewer role + intent signals       │  │
│  │  2. Fetch candidate pool (profiles + roles)     │  │
│  │  3. Fetch connection graph (1st/2nd degree)     │  │
│  │  4. Fetch referral chains (referral_conversions │  │
│  │     + card_exchanges)                           │  │
│  │  5. Compute AffinityScore per candidate         │  │
│  │  6. Sort + paginate + return with circle labels │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Data Sources:                                       │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────────┐│
│  │ profiles │ │connections│ │referral_conversions   ││
│  │ user_roles│ │card_exch. │ │event_registrations   ││
│  │ user_xp  │ │endorsem.  │ │post_interactions     ││
│  └──────────┘ └───────────┘ └──────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## 5. Claims

### Claim 1: Asymmetric Role-Directed Discovery
A method for generating discovery recommendations in a professional network wherein the relevance score assigned to a target user is **asymmetrically determined** by the professional role of both the viewing user and the target user, such that the same target user receives different visibility and ranking when viewed by users of different professional roles.

### Claim 2: Trust-Chain Prospecting ("Investors' Investors")
A method for identifying prospective professional contacts by traversing **role-specific connection chains**, wherein an intermediary user discovers potential clients by identifying the connections of their existing clients' connections, weighted by the trust position of the intermediating node.

### Claim 3: Behavioral Intent Overlay
A method for dynamically adjusting discovery scores based on **inferred behavioral intent** derived from a user's recent platform actions (content engagement, search patterns, listing interactions), where intent signals have a configurable temporal half-life and modify role-weight scores multiplicatively.

### Claim 4: Regulation-Aware Affinity Scoring
A method for incorporating **regulatory registration context** (shared regulators, complementary licensing bodies, certification overlap) as a trust and relevance signal in professional discovery, distinct from general industry or company-based categorization.

### Claim 5: Trust Propagation via Contextual Referral Chains
A method for determining the discovery ranking of a target user based on:
- (a) The **trust position** (circle placement) of the referrer relative to the viewer
- (b) The **type of referral action** (explicit introduction, digital card exchange, lead share, passive link signup)
- (c) A **conversion feedback loop** where successful referrals increase the referrer's future trust propagation weight

### Claim 6: Referral-Inherited Circle Placement
A method wherein a referred contact **inherits the trust circle position** of their referrer minus one level (1st circle referrer → target enters 1st circle; 2nd circle referrer → target enters 2nd circle), with temporal decay if the viewer does not act on the referral within a configurable window.

---

## 6. Business Impact Projections

### 6.1 Value Chain

```
AffinityRank™ Quality
        │
        ├──► Higher relevant connections ──► More platform engagement
        │
        ├──► Better lead quality for intermediaries ──► Revenue justification
        │
        ├──► Trust-based discovery ──► Regulatory comfort (compliance-friendly)
        │
        └──► Referral incentivization ──► Organic viral growth loop
```

### 6.2 Competitive Moat

| Dimension | LinkedIn | FindOO AffinityRank™ |
|-----------|----------|---------------------|
| Discovery basis | Degree separation + employer | Role × Intent × Trust × Regulation |
| Referral handling | "Connections in common" count | Trust-inherited circle placement with decay |
| Role awareness | Job title text matching | First-class role taxonomy with asymmetric weights |
| Regulatory context | None | SEBI/AMFI/IRDAI/RBI affinity scoring |
| Intent detection | Recruiter vs. candidate only | Multi-signal behavioral classification |

---

## 7. Data Model Requirements

### 7.1 New Tables Required

```sql
-- Stores computed affinity scores (materialized cache)
CREATE TABLE affinity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL,
  target_id UUID NOT NULL,
  affinity_score NUMERIC(5,4) NOT NULL,
  circle_tier SMALLINT NOT NULL, -- 1, 2, or 3
  role_weight NUMERIC(4,3),
  intent_multiplier NUMERIC(4,3),
  trust_proximity NUMERIC(4,3),
  activity_resonance NUMERIC(4,3),
  freshness_decay NUMERIC(4,3),
  referral_boost NUMERIC(4,3),
  referral_source TEXT, -- "Referred by Rahul Mehta", etc.
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(viewer_id, target_id)
);

-- Tracks behavioral intent signals for intent multiplier
CREATE TABLE intent_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL, -- 'listing_browse', 'job_post', 'cert_search', etc.
  signal_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tracks explicit introductions between users
CREATE TABLE introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id UUID NOT NULL,
  introduced_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  introduction_type TEXT NOT NULL DEFAULT 'explicit', -- 'explicit', 'card_share', 'lead_share'
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  created_at TIMESTAMPTZ DEFAULT now(),
  acted_at TIMESTAMPTZ
);
```

### 7.2 Existing Tables Leveraged

- `connections` — 1st/2nd degree graph
- `user_roles` — Role weights
- `referral_conversions` + `referral_links` — Passive referral chains
- `card_exchanges` — Event-based trust signals
- `event_registrations` — Co-attendance
- `post_interactions` — Content engagement
- `endorsements` — Professional trust signals
- `profiles` (certifications, specializations, location) — Attribute matching
- `user_xp` — Activity freshness proxy

---

## 8. Algorithm Pseudocode

```
FUNCTION compute_affinity(viewer_id, page, page_size):
  viewer = get_profile(viewer_id)
  viewer_roles = get_roles(viewer_id)
  viewer_intent = detect_intent(viewer_id, window=7_days)
  
  -- Build connection graph
  first_degree = get_connections(viewer_id, degree=1)
  second_degree = get_connections_of(first_degree, exclude=viewer_id)
  
  -- Get referral chain
  referrals = get_referral_paths(viewer_id)
  introductions = get_introductions_for(viewer_id)
  
  -- Candidate pool (exclude self + already connected)
  candidates = all_profiles EXCEPT viewer_id
  
  scored = []
  FOR EACH candidate IN candidates:
    target_roles = get_roles(candidate.id)
    
    -- 1. Role Weight (max across role combinations)
    rw = MAX(role_weight_matrix[vr][tr] 
             FOR vr IN viewer_roles, tr IN target_roles)
    
    -- 2. Intent Multiplier
    im = compute_intent_multiplier(viewer_intent, target_roles)
    
    -- 3. Trust Proximity
    tp = compute_trust_proximity(viewer_id, candidate.id,
           first_degree, second_degree)
    
    -- 4. Activity Resonance
    ar = compute_activity_resonance(viewer_id, candidate.id)
    
    -- 5. Freshness Decay
    fd = e^(-0.05 × days_since_last_active(candidate.id))
    
    -- 6. Referral Boost
    rb = compute_referral_boost(viewer_id, candidate.id,
           referrals, introductions, first_degree)
    
    -- Final Score
    score = (rw × im × tp × ar × fd) + rb
    
    -- Circle assignment
    circle = CASE
      WHEN score > 0.7 THEN 1
      WHEN score > 0.4 THEN 2
      WHEN score > 0.15 THEN 3
      ELSE NULL  -- below threshold, don't show
    END
    
    IF circle IS NOT NULL:
      scored.append({candidate, score, circle, referral_label})
  
  SORT scored BY score DESC
  RETURN paginate(scored, page, page_size)
```

---

## 9. UI Discovery Labels

When a user appears in the discovery feed, contextual labels explain WHY:

| Signal Source | Label Shown |
|--------------|-------------|
| Referral from 1st circle | 🏷️ "Referred by {Name}" |
| 2nd degree connection | 🔗 "Connected via {Name}" |
| Event co-attendance | 📇 "Met at {Event Name}" |
| Lead shared by partner | 📊 "Lead shared by {Company}" |
| Same certifications | 🎓 "Fellow {Certification} holder" |
| High content engagement | 📝 "Active in {Topic}" |
| Complementary role match | 🤝 "Recommended for {viewer.role}" |

---

## 10. Viral Growth Mechanics

AffinityRank™ creates natural virality through:

1. **Referral Quality Scores** — Users compete to be the best "introducer" (visible on profile)
2. **Circle Notifications** — "3 people entered your 1st circle this week"
3. **Deal Catalyst Badge** — When your introduction leads to a business outcome
4. **Trust Score** — Aggregate of how many people place you in their 1st circle
5. **Discovery Insights** — "You're in 47 people's 2nd circle — complete verification to reach their 1st circle"

---

## 11. Privacy & Compliance

- Users never see their exact AffinityScore — only circle placement
- Intent signals are aggregated, never individual actions exposed
- SEBI/regulatory IDs used only for affinity matching, never displayed to other users
- All scoring happens server-side (Edge Function), no client-side data leakage
- Circle placement respects profile visibility settings

---

*Document Version: 1.0*  
*Algorithm Version: AffinityRank™ v1*  
*Status: Ready for provisional patent filing*
