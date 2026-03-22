/**
 * query-keys.ts — Centralised TanStack Query key registry.
 *
 * Single source of truth for all query keys across the app.
 * Prevents silent invalidation misses from inconsistent key strings.
 */

export const QUERY_KEYS = {
  /* ── Feed ── */
  feedPosts: (page?: number) => ["feed-posts", page] as const,
  trendingPosts: () => ["trending-posts"] as const,
  viralPosts: () => ["viral-posts"] as const,
  trendingHashtags: () => ["trending-hashtags"] as const,
  postInteractions: (postIds: string[]) => ["post-interactions-batch", postIds] as const,

  /* ── Jobs ── */
  jobs: (filters?: Record<string, string | undefined>) => ["jobs", filters] as const,
  job: (id?: string) => ["job", id] as const,
  myPostedJobs: (userId?: string) => ["my-posted-jobs", userId] as const,
  myApplications: (userId?: string) => ["my-applications", userId] as const,
  jobApplications: (jobId?: string) => ["job-applications", jobId] as const,
  savedJobs: (userId?: string) => ["saved-jobs", userId] as const,

  /* ── Events ── */
  events: (filters?: Record<string, string | undefined>) => ["events", filters] as const,
  event: (id?: string) => ["event", id] as const,
  eventRegistrations: (eventId?: string) => ["event-registrations", eventId] as const,
  myEventRegistrations: (userId?: string) => ["my-event-registrations", userId] as const,
  myOrganizedEvents: (userId?: string) => ["my-organized-events", userId] as const,

  /* ── Listings / Directory ── */
  listings: (filters?: Record<string, string | undefined>) => ["listings", filters] as const,
  listing: (id?: string) => ["listing", id] as const,
  myListings: (userId?: string) => ["my-listings", userId] as const,
  listingReviews: (listingId?: string) => ["listing-reviews", listingId] as const,
  listingEnquiries: (listingId?: string) => ["listing-enquiries", listingId] as const,

  /* ── Network ── */
  connections: (userId?: string) => ["connections", userId] as const,
  connectionStatus: (fromId?: string, toId?: string) => ["connection-status", fromId, toId] as const,
  contacts: (userId?: string) => ["contacts", userId] as const,

  /* ── Opinions ── */
  opinions: (filters?: Record<string, string | undefined>) => ["opinions", filters] as const,
  opinion: (id?: string) => ["opinion", id] as const,
  opinionVotes: (opinionId?: string) => ["opinion-votes", opinionId] as const,

  /* ── Blog ── */
  blogPosts: (limit?: number) => ["blog-posts", limit] as const,
  blogPost: (slug?: string) => ["blog-post", slug] as const,

  /* ── Notifications ── */
  notifications: (userId?: string) => ["notifications", userId] as const,
  unreadCount: (userId?: string) => ["unread-count", userId] as const,

  /* ── Knowledge Base ── */
  kbArticles: (category?: string) => ["kb-articles", category] as const,
  kbArticle: (slug?: string) => ["kb-article", slug] as const,
  adminKBArticles: () => ["admin-kb-articles"] as const,

  /* ── Gamification ── */
  userXP: (userId?: string) => ["user-xp", userId] as const,
  leaderboard: () => ["leaderboard"] as const,
  userBadges: (userId?: string) => ["user-badges", userId] as const,
  weeklyChallenges: (userId?: string) => ["weekly-challenges", userId] as const,

  /* ── Subscriptions ── */
  subscription: (userId?: string) => ["subscription", userId] as const,
  subscriptionPlans: () => ["subscription-plans"] as const,

  /* ── Admin ── */
  isAdmin: (userId?: string) => ["is-admin", userId] as const,
  adminInvitations: (filters?: Record<string, string | undefined>) => ["admin-invitations", filters] as const,
  adminModuleStats: () => ["admin-module-stats"] as const,
  platformMetrics: () => ["platform-metrics"] as const,
  growthMetrics: (days?: number) => ["growth-metrics", days] as const,
  adminUsers: () => ["admin-users"] as const,
  staffPermissions: (userId?: string) => ["staff-permissions", userId] as const,

  /* ── Drafts & Scheduled ── */
  drafts: (userId?: string) => ["drafts", userId] as const,
  scheduledPosts: (userId?: string) => ["scheduled-posts", userId] as const,

  /* ── Support ── */
  supportTickets: (userId?: string) => ["support-tickets", userId] as const,
  adminTickets: () => ["admin-support-tickets"] as const,

  /* ── Profile ── */
  profileFlair: (userId?: string) => ["profile-flair", userId] as const,
  tabPrivacy: (userId?: string) => ["tab-privacy", userId] as const,
  featuredPosts: (userId?: string) => ["featured-posts", userId] as const,
  userActivityStatus: (userId?: string | null) => ["user-activity-status", userId] as const,

  /* ── Professional Directory ── */
  publicProfessionals: (version?: string) => ["public-professionals-consolidated", version] as const,

  /* ── Feature Flags ── */
  featureFlags: () => ["feature-flags"] as const,
} as const;
