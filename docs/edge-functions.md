# findoo — Edge Functions Reference

> Documentation for all 9 backend functions deployed on Lovable Cloud.

---

## Overview

| Function                    | Auth Required | Trigger          | Purpose                              |
| --------------------------- | ------------- | ---------------- | ------------------------------------ |
| `upload-file`               | ✅ Bearer token | HTTP POST       | Secure file upload with validation   |
| `publish-scheduled-posts`   | ❌ Service key  | Cron / manual    | Publish posts at scheduled time      |
| `trustcircle-iq`            | ✅ Bearer token | HTTP POST       | Compute affinity scores for a user   |
| `scrape-amfi`               | ❌ Service key  | Cron / manual    | Import AMFI advisor registry data    |
| `auth-email-hook`           | ❌ (verify_jwt=false) | Auth webhook | Custom auth email rendering    |
| `process-email-queue`       | ✅ Service key  | Cron (1 min)     | Process async email send queue       |
| `send-transactional-email`  | ❌ (verify_jwt=false) | HTTP POST  | Send templated transactional emails  |
| `seed-users`                | ❌ Service key  | Manual (dev only)| Create 8 test users with roles       |
| `seed-data`                 | ❌ Service key  | Manual (dev only)| Seed posts, connections, events, etc.|

---

## `upload-file`

**Path:** `supabase/functions/upload-file/index.ts`

Handles file uploads with server-side validation, MIME type checking, and size limits.

### Request

```
POST /functions/v1/upload-file
Authorization: Bearer <user_access_token>
Content-Type: multipart/form-data

Fields:
  file: <File>       (required) The file to upload
  bucket: <string>   (required) Target storage bucket
```

### Validation Rules

| Rule          | Constraint                                                |
| ------------- | --------------------------------------------------------- |
| Max file size | 10 MB                                                     |
| `avatars`     | JPEG, PNG, WebP                                           |
| `banners`     | JPEG, PNG, WebP                                           |
| `verification-docs` | PDF, JPEG, PNG, WebP                               |
| `post-attachments`  | PDF, JPEG, PNG, WebP, DOCX, PPTX, XLSX             |

### Response (200)

```json
{
  "url": "https://...public-url...",
  "path": "user-id/timestamp_filename.ext",
  "file_name": "document.pdf",
  "file_type": "application/pdf",
  "file_size": 1048576,
  "storage_available": true
}
```

### Error Responses

| Status | Condition                     |
| ------ | ----------------------------- |
| 400    | Missing file/bucket, invalid MIME type, file too large |
| 401    | Missing or invalid auth token |
| 500    | Storage or DB insertion failure |

---

## `trustcircle-iq`

**Path:** `supabase/functions/trustcircle-iq/index.ts`

Computes multi-factor affinity scores for a viewer against all users in the network using the patented TrustCircle IQ algorithm.

### Request

```
POST /functions/v1/trustcircle-iq
Authorization: Bearer <user_access_token>
Content-Type: application/json

Body:
  { "limit": 80 }  (optional, default 80)
```

### Scoring Factors

- **Role Weight** — Cross-role affinity (e.g., investor↔intermediary = 0.9)
- **Intent Multiplier** — Recent browsing behavior boosts relevant matches
- **Trust Proximity** — Connection degree + verification + location + mutual connections
- **Activity Resonance** — Shared events, content engagement, specialization overlap
- **Freshness Decay** — Exponential decay based on last active date
- **Referral Boost** — Bonus from referral paths and warm introductions

### Response (200)

```json
{
  "success": true,
  "scores": [
    {
      "target_id": "uuid",
      "affinity_score": 0.8234,
      "circle_tier": 1,
      "role_weight": 0.9,
      "intent_multiplier": 1.5,
      "trust_proximity": 0.75,
      "activity_resonance": 0.65,
      "freshness_decay": 0.95,
      "referral_boost": 0.15,
      "referral_source": "Referred by Priya Sharma"
    }
  ]
}
```

---

## `scrape-amfi`

**Path:** `supabase/functions/scrape-amfi/index.ts`

Imports mutual fund distributor data from the AMFI registry into the `registry_entities` table for the Professional Directory feature.

### Request

```
POST /functions/v1/scrape-amfi
```

Uses `SUPABASE_SERVICE_ROLE_KEY` internally. Intended for periodic cron execution.

---

## `auth-email-hook`

**Path:** `supabase/functions/auth-email-hook/index.ts`

Intercepts Supabase auth email events (signup confirmation, password reset, magic link, etc.) and renders branded React Email templates.

### Configuration

Set in `supabase/config.toml` with `verify_jwt = false` as it's called internally by the auth system.

### Templates (in `supabase/functions/_shared/email-templates/`)

| Template | Trigger |
| --- | --- |
| `signup.tsx` | New user registration |
| `recovery.tsx` | Password reset request |
| `magic-link.tsx` | Magic link login |
| `invite.tsx` | User invitation |
| `email-change.tsx` | Email address change |
| `reauthentication.tsx` | Re-authentication required |

---

## `process-email-queue`

**Path:** `supabase/functions/process-email-queue/index.ts`

Processes the async email send queue (pgmq). Reads batches of queued emails, sends them via the configured email provider, and handles retries/DLQ.

### Configuration

- Runs on a 1-minute cron schedule
- Batch size and delays configurable via `email_send_state` table
- Failed messages moved to dead letter queue after max retries
- Respects suppression list (`suppressed_emails` table)

---

## `send-transactional-email`

**Path:** `supabase/functions/send-transactional-email/index.ts`

Sends templated transactional emails (welcome, connection accepted, event registration, contact confirmation) by queuing them in pgmq.

### Request

```
POST /functions/v1/send-transactional-email
Content-Type: application/json

Body:
  {
    "template": "welcome",
    "to": "user@example.com",
    "data": { "name": "Rajesh", ... }
  }
```

### Available Templates

| Template | Purpose |
| --- | --- |
| `welcome` | New user welcome email |
| `connection-accepted` | Connection request accepted |
| `event-registration` | Event registration confirmation |
| `contact-confirmation` | Contact form submission confirmation |

---

## `publish-scheduled-posts`

**Path:** `supabase/functions/publish-scheduled-posts/index.ts`

Finds posts where `scheduled_at <= now()` and clears the timestamp to "publish" them.

### Request

```
POST /functions/v1/publish-scheduled-posts
```

No auth header needed — uses `SUPABASE_SERVICE_ROLE_KEY` internally.

### Response (200)

```json
{
  "message": "Published scheduled posts",
  "count": 3,
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

### How Publishing Works

Posts with a non-null `scheduled_at` are hidden from the feed (the `get_feed_posts` RPC filters `WHERE scheduled_at IS NULL`). When this function runs, it sets `scheduled_at = null` on due posts, making them visible in the feed.

**Recommended:** Set up a cron job to call this every 5 minutes.

---

## `seed-users`

**Path:** `supabase/functions/seed-users/index.ts`

Creates 8 sample BFSI users with realistic profiles and roles. **Development only.**

### Request

```
POST /functions/v1/seed-users
```

### Users Created

| Name           | Email                        | Roles                           | Type       |
| -------------- | ---------------------------- | ------------------------------- | ---------- |
| Rajesh Kumar   | rajesh.kumar@findoo.test     | Investor (Retail)               | Individual |
| Priya Sharma   | priya.sharma@findoo.test     | Intermediary (RIA), Investor (HNI) | Individual |
| Arjun Mehta    | arjun.mehta@findoo.test      | Issuer (AMC), Investor (Institutional) | Entity |
| Sneha Patel    | sneha.patel@findoo.test      | Intermediary (CA/CS)            | Individual |
| Vikram Singh   | vikram.singh@findoo.test     | Issuer (Listed Company)         | Entity     |
| Anita Desai    | anita.desai@findoo.test      | Issuer (NBFC), Intermediary (MFD), Investor | Entity |
| Karan Joshi    | karan.joshi@findoo.test      | Investor (NRI)                  | Individual |
| Meera Reddy    | meera.reddy@findoo.test      | Intermediary (RA), Investor     | Individual |

**Password for all:** `Test@1234`

---

## `seed-data`

**Path:** `supabase/functions/seed-data/index.ts`

Seeds comprehensive demo data across all modules. **Development only.** Must run `seed-users` first.

### Request

```
POST /functions/v1/seed-data
```

### Data Seeded

| Category       | Volume                                           |
| -------------- | ------------------------------------------------ |
| **Posts**       | 15 normal posts (all types) + 3 polls + 1 survey |
| **Comments**    | 13 comments across various posts                 |
| **Interactions**| Likes, bookmarks, reposts across all posts       |
| **Connections** | 20+ follow/connect relationships                 |
| **Messages**    | Multi-category conversations (general, sales, support, etc.) |
| **Jobs**        | 8 job listings across BFSI categories            |
| **Events**      | 7 events (webinars, investor meets, etc.) with speakers |
| **Listings**    | 8 product/service listings with reviews          |
| **Endorsements**| Skill endorsements between users                 |

### Cleanup

The function performs a full cleanup of existing seeded data (respecting FK constraints) before re-inserting. Safe to run multiple times.
