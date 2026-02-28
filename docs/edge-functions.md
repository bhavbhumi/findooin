# FindOO — Edge Functions Reference

> Documentation for all 4 backend functions deployed on Lovable Cloud.

---

## Overview

| Function                    | Auth Required | Trigger          | Purpose                              |
| --------------------------- | ------------- | ---------------- | ------------------------------------ |
| `upload-file`               | ✅ Bearer token | HTTP POST       | Secure file upload with validation   |
| `publish-scheduled-posts`   | ❌ Service key  | Cron / manual    | Publish posts at scheduled time      |
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

### Flow

1. Verify user auth via Bearer token
2. Validate bucket name, MIME type, file size
3. Generate unique path: `{userId}/{timestamp}_{safeName}`
4. Upload to Supabase Storage
5. Record in `file_uploads` table
6. Return public URL (or fallback URL if storage unavailable)

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

Or when no posts are due:

```json
{
  "message": "No scheduled posts to publish",
  "count": 0
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

### Response (200)

```json
{
  "success": true,
  "results": [
    { "email": "rajesh.kumar@findoo.test", "status": "created", "roles": ["investor"] },
    { "email": "priya.sharma@findoo.test", "status": "skipped", "error": "User already exists" }
  ]
}
```

---

## `seed-data`

**Path:** `supabase/functions/seed-data/index.ts`

Seeds comprehensive demo data across all modules. **Development only.** Must run `seed-users` first.

### Request

```
POST /functions/v1/seed-data
```

### Data Seeded (~996 lines of seed logic)

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

### Response (200)

```json
{
  "success": true,
  "seeded": {
    "posts": 19,
    "comments": 13,
    "interactions": 45,
    "connections": 20,
    "messages": 30,
    "jobs": 8,
    "events": 7,
    "listings": 8
  }
}
```
