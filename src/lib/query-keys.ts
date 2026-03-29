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
  trendingHashtags: (days?: number) => ["trending-hashtags", days] as const,
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
  eventSpeakers: (eventId?: string) => ["event-speakers", eventId] as const,
  myEventRegistrations: (userId?: string) => ["my-registrations", userId] as const,
  myOrganizedEvents: (userId?: string) => ["my-events", userId] as const,

  /* ── Listings / Directory ── */
  listings: (filters?: Record<string, string | undefined>) => ["listings", filters] as const,
  listing: (id?: string) => ["listing", id] as const,
  myListings: (userId?: string) => ["my-listings", userId] as const,
  listingReviews: (listingId?: string) => ["listing-reviews", listingId] as const,
  listingEnquiries: (listingId?: string) => ["listing-enquiries", listingId] as const,

  /* ── Network ── */
  connections: (userId?: string) => ["connections", userId] as const,
  connectionStatus: (fromId?: string, toId?: string) => ["connection-status", fromId, toId] as const,
  contacts: (userId?: string) => ["user-contacts", userId] as const,

  /* ── Opinions ── */
  opinions: (category?: string, status?: string) => ["opinions", category, status] as const,
  opinion: (id?: string) => ["opinion", id] as const,
  opinionDetail: (id?: string | null) => ["opinion-detail", id] as const,
  opinionVotes: (opinionId?: string | null) => ["opinion-votes", opinionId] as const,
  opinionComments: (opinionId?: string | null) => ["opinion-comments", opinionId] as const,

  /* ── Blog ── */
  blogPosts: (limit?: number) => ["blog-posts", limit] as const,
  blogPost: (slug?: string) => ["blog-post", slug] as const,
  blogPollOptions: (postId?: string) => ["blog-poll-options", postId] as const,
  blogPollUserVotes: (postId?: string, userId?: string) => ["blog-poll-user-votes", postId, userId] as const,
  blogPollStats: () => ["blog-poll-stats"] as const,
  blogSurveyQuestions: (postId?: string) => ["blog-survey-questions", postId] as const,
  blogSurveySubmitted: (postId?: string, userId?: string) => ["blog-survey-submitted", postId, userId] as const,
  blogSurveyStats: () => ["blog-survey-stats"] as const,
  adminBlogPosts: () => ["admin-blog-posts"] as const,

  /* ── Notifications ── */
  notifications: (userId?: string) => ["notifications", userId] as const,
  unreadCount: (userId?: string) => ["unread-count", userId] as const,

  /* ── Knowledge Base ── */
  kbArticles: (category?: string) => ["kb-articles", category] as const,
  kbArticle: (slug?: string) => ["kb-article", slug] as const,
  adminKBArticles: () => ["admin-kb-articles"] as const,

  /* ── Gamification ── */
  userXP: (userId?: string) => ["user-xp", userId] as const,
  leaderboard: (limit?: number) => ["leaderboard", limit] as const,
  userBadges: (userId?: string) => ["user-badges", userId] as const,
  badgeDefinitions: () => ["badge-definitions"] as const,
  weeklyChallenges: (userId?: string) => ["weekly-challenges", userId] as const,

  /* ── Subscriptions ── */
  subscription: (userId?: string, role?: string) => ["user-subscription", userId, role] as const,
  subscriptionPlans: (role?: string, interval?: string) => ["subscription-plans", role, interval] as const,

  /* ── Admin ── */
  isAdmin: () => ["is-admin"] as const,
  adminInvitations: (filters?: Record<string, string | undefined>) => ["admin-invitations", filters] as const,
  adminModuleStats: () => ["admin-module-stats"] as const,
  platformMetrics: () => ["platform-metrics"] as const,
  growthMetrics: (days?: number) => ["growth-metrics", days] as const,
  adminUsers: () => ["admin-users"] as const,
  adminVerificationQueue: (includeArchived?: boolean) => ["admin-verification-queue", includeArchived] as const,
  adminReports: (includeArchived?: boolean) => ["admin-reports", includeArchived] as const,
  adminTickets: (status?: string) => ["admin-tickets", status] as const,
  staffPermissions: () => ["staff-permissions"] as const,
  registryEntities: (search?: string) => ["registry-entities-for-invite", search] as const,
  userActivityStatus: (userId?: string | null) => ["user-activity-status", userId] as const,

  /* ── Drafts & Scheduled ── */
  drafts: (userId?: string) => ["drafts", userId] as const,
  scheduledPosts: (userId?: string) => ["scheduled-posts", userId] as const,

  /* ── Support ── */
  supportTickets: (userId?: string) => ["my-tickets"] as const,
  ticketReplies: (ticketId?: string) => ["ticket-replies", ticketId] as const,

  /* ── Profile ── */
  profileFlair: (userId?: string) => ["profile-flair", userId] as const,
  tabPrivacy: (userId?: string) => ["tab-privacy", userId] as const,
  featuredPosts: (userId?: string) => ["featured-posts", userId] as const,
  profileAnalytics: (profileId?: string) => ["profile-analytics", profileId] as const,

  /* ── Professional Directory ── */
  publicProfessionals: (version?: string) => ["public-professionals-consolidated", version] as const,

  /* ── Feature Flags ── */
  featureFlags: () => ["feature-flags"] as const,

  /* ── Admin Billing ── */
  adminSubscriptions: () => ["admin-subscriptions"] as const,
  adminPlans: () => ["admin-plans"] as const,
  adminPayments: () => ["admin-payments"] as const,
  adminSubEvents: () => ["admin-sub-events"] as const,

  /* ── Admin Notifications ── */
  adminNotificationsLog: () => ["admin-notifications-log"] as const,
  adminNotificationStats: () => ["admin-notification-stats"] as const,

  /* ── Feedback Engine ── */
  featureRequests: (filters?: Record<string, string | undefined>) => ["feature-requests", filters] as const,
  featureDuplicateSearch: (term?: string) => ["feature-duplicate-search", term] as const,
  featureComments: (featureId?: string) => ["feature-comments", featureId] as const,
  changelogEntries: () => ["changelog-entries"] as const,
  myFeatureVotes: (userId?: string) => ["my-feature-votes", userId] as const,
  myFeatureSuggestions: (userId?: string) => ["my-feature-suggestions", userId] as const,
} as const;
