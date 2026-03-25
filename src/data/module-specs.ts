/**
 * Module Feature Specifications — Living product documentation
 * embedded in every admin module as a "Module Spec" tab.
 */

export interface ModuleSpec {
  moduleKey: string;
  title: string;
  icon: string; // lucide icon name
  problem: string;
  solution: string;
  useCases: string[];
  currentScope: string[];
  futureScope: string[];
  monetisation: string[];
}

const moduleSpecs: Record<string, ModuleSpec> = {
  overview: {
    moduleKey: "overview",
    title: "Admin Dashboard",
    icon: "LayoutDashboard",
    problem:
      "Platform operators lack a single-pane view of business health — user growth, engagement, moderation backlogs, and revenue trends are scattered across tools.",
    solution:
      "A unified dashboard with sparkline trends, MIS metrics, date-range filtering, and one-click CSV export. Real-time badges surface pending actions (verification, reports) so nothing falls through the cracks.",
    useCases: [
      "Morning health check: Admin opens the dashboard and instantly sees overnight signups, pending verifications, and flagged content.",
      "Board reporting: Export 30-day metrics as CSV for investor updates.",
      "Incident triage: Red badges on moderation and verification queues alert admins to urgent backlogs.",
    ],
    currentScope: [
      "Metric cards with sparkline trends (Users, Verifications, Reports, Active Sessions).",
      "Date-range toggle (7d / 14d / 30d) for all charts.",
      "Distribution charts: user roles, verification status, report types.",
      "Quick-action buttons linking to high-priority admin modules.",
      "CSV export and print-friendly summary generation.",
    ],
    futureScope: [
      "Customisable widget grid — admins drag-and-drop the metrics they care about.",
      "Anomaly detection alerts (e.g., sudden spike in signups from disposable emails).",
      "Cohort retention curves and funnel visualisation.",
      "Scheduled email digests of key metrics to the admin team.",
    ],
    monetisation: [
      "Not directly monetised — operational efficiency tool that reduces support costs.",
      "Enables data-driven upsell campaigns by surfacing engagement patterns.",
    ],
  },

  users: {
    moduleKey: "users",
    title: "User Management",
    icon: "Users",
    problem:
      "Managing a growing user base across three distinct roles (Investor, Intermediary, Issuer) requires granular controls — bulk actions, role verification, suspension, and activity monitoring.",
    solution:
      "A full-featured user table with inline actions, multi-column sorting, role/status filters, and pagination. Admins can verify credentials, suspend accounts, and view detailed user profiles without leaving the panel.",
    useCases: [
      "Onboarding audit: Filter by 'unverified' status to identify users who haven't completed credential verification.",
      "Compliance check: Review all Intermediary-role users to ensure SEBI/AMFI registrations are current.",
      "Abuse response: Quickly suspend a user and review their post/message history.",
    ],
    currentScope: [
      "Sortable, filterable user table with role badges and verification status.",
      "Inline actions: verify, suspend, restore, delete.",
      "Search by name, email, or user ID.",
      "Role-based filtering (Investor, Intermediary, Issuer, Admin).",
      "Pagination with configurable page size.",
      "MIS stats: total users, verified %, role distribution.",
    ],
    futureScope: [
      "Bulk actions: mass verify, mass email, mass role assignment.",
      "User segments and cohort tagging for targeted campaigns.",
      "Login history and device tracking for security audits.",
      "Automated deactivation of dormant accounts (90+ days inactive).",
    ],
    monetisation: [
      "Premium verification badges for professionals (paid credential verification service).",
      "Enterprise seat-based pricing for institutional accounts.",
    ],
  },

  jobs: {
    moduleKey: "jobs",
    title: "Jobs Board",
    icon: "Briefcase",
    problem:
      "Financial professionals lack a dedicated job marketplace that understands BFSI roles, certifications (CFA, CFP, NISM), and regulatory requirements. Generic job boards don't filter by financial certifications.",
    solution:
      "A BFSI-specific job board with certification-aware matching, role-based posting (employers post, candidates apply), and integrated moderation to prevent spam listings.",
    useCases: [
      "AMC hiring: A mutual fund house posts for a Fund Manager role requiring CFA + 8 years experience. Matching surfaces qualified Intermediaries on the platform.",
      "Career switch: An Investor with CFP certification browses advisory roles and applies with vault-stored resume.",
      "Campus hiring: An Issuer posts internship roles targeting MBA Finance students.",
    ],
    currentScope: [
      "Job CRUD with category, type (full-time/part-time/contract), location, salary range.",
      "Certification-preferred tagging for BFSI-specific qualifications.",
      "Application tracking: candidates apply, employers review with status pipeline (applied → shortlisted → interviewed → offered → rejected).",
      "Admin moderation: pause/close/delete listings, view reports.",
      "View and application count analytics per listing.",
    ],
    futureScope: [
      "AI-powered job matching based on profile, certifications, and career trajectory.",
      "Video interview scheduling integrated with Events module.",
      "Salary benchmarking using anonymised platform data.",
      "Referral tracking: reward users who refer successful hires.",
      "Job alerts and saved searches with push notifications.",
    ],
    monetisation: [
      "Featured job listings (premium placement in search results).",
      "Employer branding packages (company page, logo, banner).",
      "Resume database access for recruiters (paid subscription).",
      "Per-posting fees for non-premium employers.",
    ],
  },

  events: {
    moduleKey: "events",
    title: "Events",
    icon: "Calendar",
    problem:
      "Financial industry events (webinars, conferences, AMC product launches) are scattered across WhatsApp groups and emails. No centralised platform exists for discovery, registration, and post-event networking.",
    solution:
      "A full event lifecycle platform — creation, registration, check-in (QR-based), speaker management, and post-event analytics. Supports virtual, physical, and hybrid modes.",
    useCases: [
      "AMC NFO launch: Issuer creates a virtual event, adds fund managers as speakers, and invites their network. Attendees register and join via integrated virtual link.",
      "IFA conference: Intermediary association organises a physical event with QR check-in at the venue.",
      "Regulatory update webinar: AMFI hosts a compliance update; attendees earn XP for participating.",
    ],
    currentScope: [
      "Event CRUD with category (conference, webinar, workshop, meetup, launch).",
      "Speaker management with profile linking.",
      "Registration with capacity limits and waitlist.",
      "QR-based check-in generation and scanning.",
      "Organiser dashboard with registration analytics.",
      "Admin moderation: cancel events, manage reports.",
    ],
    futureScope: [
      "Ticketed events with Razorpay payment integration.",
      "Post-event networking: auto-connect attendees who shared interests.",
      "Event recordings and on-demand content library.",
      "CPE/CPD credit tracking for regulated professionals.",
      "Sponsor management and exhibitor booths for conferences.",
    ],
    monetisation: [
      "Ticketed event revenue share (platform fee per ticket).",
      "Sponsored event placement and banner ads.",
      "Premium event analytics for organisers.",
      "CPE certificate generation as a paid add-on.",
    ],
  },

  listings: {
    moduleKey: "listings",
    title: "Showcase / Directory",
    icon: "ShoppingBag",
    problem:
      "Financial products (mutual funds, insurance, PMS) and advisory services lack a structured marketplace. Investors can't easily compare offerings, and advisors can't showcase their services with credibility signals.",
    solution:
      "A dual-purpose marketplace: Products (with risk levels, returns, tenure) and Services (with certifications, reviews, pricing). TrustCircle IQ™ affinity ranking surfaces the most relevant matches.",
    useCases: [
      "Product discovery: Investor searches for 'low-risk debt funds' and sees listings ranked by affinity score, with reviews from their trusted network.",
      "Service showcase: CFP-certified advisor lists their financial planning service with pricing tiers and client testimonials.",
      "Due diligence: Investor compares three PMS offerings side-by-side using the comparison tool.",
    ],
    currentScope: [
      "Listing CRUD for Products and Services with rich categorisation.",
      "Review and rating system with verified reviewer badges.",
      "Enquiry system: investors can message listing owners.",
      "Media attachments (brochures, factsheets).",
      "Admin moderation: approve/pause/archive listings.",
      "View and enquiry count analytics.",
    ],
    futureScope: [
      "AI-generated product summaries from uploaded factsheets.",
      "Real-time NAV integration for mutual fund listings.",
      "Lead scoring for enquiries (hot/warm/cold).",
      "Subscription-based premium listing placement.",
      "RFP (Request for Proposal) system for institutional investors.",
    ],
    monetisation: [
      "Premium listings with enhanced visibility and badge.",
      "Lead generation fees (pay-per-qualified-enquiry).",
      "Sponsored product placement in category pages.",
      "Analytics dashboard for listing owners (paid tier).",
    ],
  },

  feed: {
    moduleKey: "feed",
    title: "Feed / Posts",
    icon: "FileText",
    problem:
      "Financial professionals share insights on LinkedIn and Twitter where content gets lost in noise. There's no dedicated space for BFSI-specific discourse with role-aware visibility and professional context.",
    solution:
      "A professional feed with post types (Insight, Research Note, Market Update, Query), hashtag taxonomy, poll support, and role-based posting. Content moderation ensures quality discourse.",
    useCases: [
      "Market commentary: Fund manager shares a research note on sector rotation, visible to their Circle-1 connections first.",
      "Community query: New investor posts a question about SIP vs lumpsum; gets responses from verified advisors.",
      "Industry poll: 'Will RBI cut rates in Q3?' — results segmented by voter role (Investor vs Intermediary).",
    ],
    currentScope: [
      "Post types: Insight, Research Note, Market Update, Opinion, Query, Poll.",
      "Rich text with hashtag detection and mention support.",
      "Like, comment, share, bookmark interactions.",
      "Draft and scheduled post support.",
      "AI-assisted compose (tone, length, style).",
      "Content moderation with coded messaging detection.",
      "Admin view: manage all posts, view reports, hide/delete.",
    ],
    futureScope: [
      "Long-form articles with SEO-optimised slugs.",
      "Newsletter subscription from prolific posters.",
      "Content monetisation: paid posts and subscriber-only content.",
      "Algorithmic feed ranking based on engagement and affinity.",
      "Cross-posting to LinkedIn/Twitter with attribution.",
    ],
    monetisation: [
      "Promoted posts (paid reach amplification).",
      "Creator monetisation: tips, paid subscriptions to authors.",
      "Sponsored content partnerships with AMCs/institutions.",
      "Analytics dashboard for content creators (Pro tier).",
    ],
  },

  blog: {
    moduleKey: "blog",
    title: "Blog / Content Hub",
    icon: "BookOpen",
    problem:
      "Platform-authored content (awareness articles, compliance guides, market analysis) needs a CMS that supports polls, surveys, and engagement tracking without a separate blogging platform.",
    solution:
      "An integrated blog engine with rich content types (articles, guides, opinions, infographics), embedded poll/survey widgets, and admin-managed publishing workflow.",
    useCases: [
      "Investor education: Publish a series on 'Understanding Mutual Fund Categories' with embedded quizzes.",
      "Regulatory update: Post a compliance guide with an embedded survey asking readers about their preparedness.",
      "Thought leadership: Feature guest articles from industry experts with author attribution.",
    ],
    currentScope: [
      "Full CRUD for blog posts with rich text editor.",
      "Post types: Article, Guide, Opinion, Infographic, Video.",
      "Category and tag management.",
      "Featured post and publication scheduling.",
      "Embedded poll and survey widgets per post.",
      "Read time estimation and view analytics.",
    ],
    futureScope: [
      "SEO-optimised meta management per post.",
      "Multi-author workflow with editorial review pipeline.",
      "RSS feed generation and email newsletter integration.",
      "Content localisation (Hindi, Gujarati, Marathi).",
      "AI-generated summaries and key takeaways.",
    ],
    monetisation: [
      "Sponsored content and advertorial placements.",
      "Gated premium content for Pro subscribers.",
      "Lead generation forms embedded in educational content.",
    ],
  },

  opinions: {
    moduleKey: "opinions",
    title: "Opinions / Polls",
    icon: "BarChart3",
    problem:
      "Financial sentiment is valuable but unstructured. There's no platform for professionals to run structured polls with role-segmented results and compliance-safe disclaimers.",
    solution:
      "A dedicated opinion module with multiple formats (binary, multiple-choice, scale, open-ended), role-segmented voting analytics, and automatic disclaimer insertion for SEBI compliance.",
    useCases: [
      "Market sentiment: 'Is the Indian market overvalued?' — results shown by Investor vs Intermediary vs Issuer perspective.",
      "Product feedback: AMC runs an opinion poll on their new fund's appeal before launch.",
      "Regulatory pulse: 'Should SEBI mandate fee disclosure?' — industry-wide opinion with professional context.",
    ],
    currentScope: [
      "Opinion CRUD with multiple format support.",
      "Time-bound voting with start/end dates.",
      "Role-based vote segmentation and analytics.",
      "Public/anonymous voting toggle.",
      "Comment threads on opinions.",
      "Featured opinions and admin curation.",
      "Automatic disclaimer text injection.",
    ],
    futureScope: [
      "Sentiment trend tracking over time (weekly/monthly indices).",
      "AI-generated opinion summaries and consensus reports.",
      "Integration with Blog module for opinion-driven articles.",
      "Institutional opinion panels (invite-only, weighted voting).",
    ],
    monetisation: [
      "Sponsored polls by institutions and AMCs.",
      "Premium sentiment reports and data exports.",
      "Industry benchmarking subscriptions.",
    ],
  },

  messages: {
    moduleKey: "messages",
    title: "Messaging",
    icon: "MessageSquare",
    problem:
      "Professional communication in finance relies on WhatsApp (unregulated, insecure) or email (slow). Platform messaging needs coded-messaging detection to prevent solicitation and regulatory violations.",
    solution:
      "A secure, categorised messaging system with coded-messaging detection, abuse monitoring, and admin oversight. Messages are categorised (General, Business, Support) for professional context.",
    useCases: [
      "Connection follow-up: After connecting at an event, two professionals continue their conversation on-platform.",
      "Business enquiry: Investor messages an advisor about a listing, creating an audit trail.",
      "Compliance safety: Coded messaging detector flags a message containing disguised investment solicitation.",
    ],
    currentScope: [
      "1:1 messaging with message categories.",
      "Read receipts and unread count badges.",
      "Coded messaging detection and auto-flagging.",
      "Admin abuse monitor: flagged senders, cross-referenced with reports.",
      "Message search and filtering.",
    ],
    futureScope: [
      "Group messaging for event attendees and network circles.",
      "Voice notes and file sharing.",
      "End-to-end encryption for sensitive discussions.",
      "Auto-archive and retention policies for compliance.",
      "AI-suggested replies for common business queries.",
    ],
    monetisation: [
      "InMail-style paid messages to non-connections.",
      "Premium messaging features (read receipts, priority delivery).",
      "Business messaging analytics for institutional accounts.",
    ],
  },

  gamification: {
    moduleKey: "gamification",
    title: "Gamification & Rewards",
    icon: "Trophy",
    problem:
      "Professional platforms struggle with engagement and retention. Users complete onboarding but don't return. Financial professionals need motivation beyond content consumption.",
    solution:
      "A comprehensive XP/Level/Badge/Streak system that rewards meaningful professional actions (posting insights, completing verifications, attending events) rather than vanity metrics.",
    useCases: [
      "Onboarding completion: User earns 'Profile Pioneer' badge for completing all profile sections, driving 100% completion.",
      "Content quality: 'Thought Leader' badge unlocks after 10 posts with 50+ engagements each.",
      "Weekly challenges: 'Connect with 3 new professionals this week' drives network growth.",
    ],
    currentScope: [
      "XP system with level progression (1-50).",
      "Badge definitions with criteria types (count, threshold, milestone).",
      "Weekly challenges with progress tracking.",
      "Streak tracking for daily engagement.",
      "Referral rewards and tracking.",
      "Profile flair (avatar borders, name effects) unlocked by level.",
      "Leaderboard with filters.",
      "Admin: badge CRUD, challenge management, XP adjustments.",
    ],
    futureScope: [
      "Seasonal challenges tied to market events (Budget season, IPO wave).",
      "Team-based challenges for corporate accounts.",
      "NFT-style digital achievement certificates.",
      "Gamification analytics: which rewards drive which behaviours.",
      "Partner rewards: redeem XP for conference tickets, courses.",
    ],
    monetisation: [
      "Premium flair and cosmetic upgrades (paid profile themes).",
      "Sponsored challenges by financial institutions.",
      "XP boost packs for accelerated levelling.",
      "Corporate leaderboards for enterprise clients.",
    ],
  },

  notifications: {
    moduleKey: "notifications",
    title: "Notifications",
    icon: "Bell",
    problem:
      "Users miss important platform activity — connection requests, event reminders, job matches — because notification channels aren't coordinated or prioritised.",
    solution:
      "A multi-channel notification system (in-app, email, push) with broadcast capability, delivery analytics, and admin-managed priority rules.",
    useCases: [
      "Event reminder: Automated notification 1 hour before a registered webinar.",
      "Connection accepted: Real-time in-app notification when a connection request is approved.",
      "Admin broadcast: Platform-wide announcement about a new feature launch or maintenance window.",
    ],
    currentScope: [
      "In-app notifications with read/unread status.",
      "Notification types: welcome, connection, event, job, system, broadcast.",
      "Admin broadcast tool with audience targeting.",
      "Delivery analytics: sent, read, click-through rates.",
      "Notification preferences management.",
    ],
    futureScope: [
      "Push notifications via service worker (PWA).",
      "Smart notification batching (digest mode).",
      "ML-based send-time optimisation.",
      "Notification templates with dynamic content.",
      "Webhook-based integrations for external alerts.",
    ],
    monetisation: [
      "Sponsored notifications (AMC product launch alerts).",
      "Priority notification delivery for premium users.",
      "Notification analytics for campaign managers.",
    ],
  },

  campaigns: {
    moduleKey: "campaigns",
    title: "Campaigns",
    icon: "Megaphone",
    problem:
      "Growing a professional platform requires coordinated outreach — email campaigns, in-app promotions, re-engagement sequences — without a unified campaign manager.",
    solution:
      "A campaign lifecycle tool supporting creation, audience targeting, scheduling, and performance tracking across email and in-app channels.",
    useCases: [
      "Re-engagement: Target users inactive for 30+ days with a 'What you missed' email campaign.",
      "Feature launch: Announce a new module to all verified Intermediaries.",
      "Event promotion: Multi-touch campaign for an upcoming conference with email + in-app notifications.",
    ],
    currentScope: [
      "Campaign CRUD with type classification (email, in-app, multi-channel).",
      "Audience targeting by role, status, activity level.",
      "Scheduling with draft/scheduled/active/completed lifecycle.",
      "Performance metrics: sent, opened, clicked, converted.",
      "Template-based content creation.",
    ],
    futureScope: [
      "A/B testing for subject lines and content variants.",
      "Drip campaign sequences with conditional branching.",
      "Integration with CRM for lead scoring.",
      "Automated trigger campaigns (signup → welcome series).",
      "Attribution tracking for conversion funnels.",
    ],
    monetisation: [
      "Sponsored campaign slots for AMCs and institutions.",
      "Campaign management as a service for enterprise clients.",
      "Advanced analytics and reporting as premium tier.",
    ],
  },

  sales: {
    moduleKey: "sales",
    title: "Sales Pipeline",
    icon: "TrendingUp",
    problem:
      "Platform growth requires structured sales outreach to institutions, AMCs, and large advisory firms. Without a pipeline, leads fall through cracks and follow-ups are missed.",
    solution:
      "A Kanban-style sales pipeline with lead CRUD, stage tracking, automated stage advancement, and conversion to platform invitations.",
    useCases: [
      "Enterprise onboarding: Track an AMC from initial contact → demo → pilot → contract → onboarded.",
      "IFA recruitment: Sales team manages outreach to independent advisors with follow-up reminders.",
      "Conference follow-up: Import leads from a conference scanner and assign to sales reps.",
    ],
    currentScope: [
      "Lead management with company, contact, value, and stage tracking.",
      "Kanban board view with drag-and-drop stage advancement.",
      "Conversion to platform invitations.",
      "Notes and activity logging per lead.",
      "Pipeline analytics: stage distribution, conversion rates.",
    ],
    futureScope: [
      "Automated lead scoring based on engagement signals.",
      "Email sequence integration for follow-up automation.",
      "Calendar integration for meeting scheduling.",
      "Revenue forecasting based on pipeline stages.",
      "Territory management for regional sales teams.",
    ],
    monetisation: [
      "Internal tool — drives platform revenue through institutional onboarding.",
      "Could be exposed as a CRM-lite for enterprise subscribers.",
    ],
  },

  verification: {
    moduleKey: "verification",
    title: "Verification Queue",
    icon: "ShieldCheck",
    problem:
      "Financial professionals claim credentials (SEBI RIA, AMFI ARN, CFA) that must be verified before they can be trusted by the community. Manual verification is slow and error-prone.",
    solution:
      "A structured verification queue with document review, SLA tracking, batch processing, and status-based filtering. Verified users earn trust badges visible across the platform.",
    useCases: [
      "SEBI RIA verification: Intermediary uploads their SEBI registration certificate; admin verifies against public registry.",
      "AMFI ARN check: Cross-reference submitted ARN number with AMFI portal data.",
      "Bulk processing: After a conference, verify 50 new advisor signups using registry import.",
    ],
    currentScope: [
      "Verification queue with status filters (pending, approved, rejected, archived).",
      "SLA tracking with time-in-queue indicators.",
      "Document viewer for uploaded credentials.",
      "Registry cross-reference tools.",
      "Batch verification actions.",
      "Verification request form for users.",
    ],
    futureScope: [
      "Automated registry lookup (SEBI, AMFI, IRDAI APIs when available).",
      "Periodic re-verification for expiring credentials.",
      "AI-assisted document parsing and validation.",
      "Third-party KYC integration.",
    ],
    monetisation: [
      "Expedited verification (priority processing for premium users).",
      "Institutional bulk verification packages.",
      "Verification-as-a-service API for partner platforms.",
    ],
  },

  knowledgeBase: {
    moduleKey: "knowledgeBase",
    title: "Knowledge Base",
    icon: "BookOpen",
    problem:
      "Users have questions about platform features, financial regulations, and professional workflows. Without a self-serve knowledge base, every question becomes a support ticket.",
    solution:
      "A searchable, categorised knowledge base with articles, FAQs, and guides. Admin-managed with view counts and helpfulness ratings to identify content gaps.",
    useCases: [
      "Self-serve: User searches 'How to verify my SEBI registration' and finds a step-by-step guide.",
      "Onboarding: New users are pointed to 'Getting Started' articles during their first session.",
      "Support deflection: Support agents link KB articles in ticket responses to reduce repeat questions.",
    ],
    currentScope: [
      "Article CRUD with category, subcategory, and tag management.",
      "Rich text content with markdown support.",
      "Published/draft status and sort ordering.",
      "View count and helpfulness tracking.",
      "Search and category filtering.",
    ],
    futureScope: [
      "AI-powered search with natural language queries.",
      "Auto-suggested articles based on user context (role, page, action).",
      "Community contributions with editorial review.",
      "Multi-language support.",
      "Video tutorials and interactive walkthroughs.",
    ],
    monetisation: [
      "Not directly monetised — reduces support costs.",
      "Premium content sections gated for Pro subscribers.",
    ],
  },

  security: {
    moduleKey: "security",
    title: "Security Hub",
    icon: "Shield",
    problem:
      "A financial platform handling sensitive professional data needs comprehensive security management — vulnerability tracking, incident response, and compliance monitoring.",
    solution:
      "A unified security hub with VAPT dashboard, incident reporting, compliance tracker (SOC2, ISO27001, DPDPA), and security alert management.",
    useCases: [
      "Vulnerability management: Track and remediate findings from periodic security assessments.",
      "Compliance audit: Review SOC2 control status before annual audit.",
      "Incident response: Log and track a data access anomaly through resolution.",
    ],
    currentScope: [
      "VAPT dashboard with finding severity tracking.",
      "Incident reporting and resolution workflow.",
      "Compliance tracker with framework-based controls (SOC2, ISO27001, DPDPA).",
      "Security alerts and notification management.",
    ],
    futureScope: [
      "Automated vulnerability scanning integration.",
      "Real-time threat intelligence feeds.",
      "Penetration test scheduling and report management.",
      "Employee security training tracking.",
    ],
    monetisation: [
      "Internal tool — builds trust and enables enterprise sales.",
      "Security posture reports for institutional clients.",
    ],
  },

  featureFlags: {
    moduleKey: "featureFlags",
    title: "Feature Flags",
    icon: "ToggleLeft",
    problem:
      "Rolling out features to all users simultaneously is risky. Gradual rollouts, A/B testing, and emergency kill switches require a feature flag system.",
    solution:
      "A feature flag management system with toggle, segment targeting, rollout percentages, and audit logging for every change.",
    useCases: [
      "Gradual rollout: Enable a new feed algorithm for 10% of users, monitor engagement, then increase.",
      "Role-based feature: Show 'IR Tab' only for Issuer-role users.",
      "Emergency: Disable a broken feature instantly without redeployment.",
    ],
    currentScope: [
      "Flag CRUD with key, label, description.",
      "Toggle enable/disable with instant effect.",
      "Target segments: all, investors, intermediaries, issuers, premium.",
      "Rollout percentage control (0-100%).",
      "Audit logging for all flag changes.",
    ],
    futureScope: [
      "User-level flag overrides for testing.",
      "Flag dependencies (flag B requires flag A).",
      "Scheduled flag activation/deactivation.",
      "Integration with monitoring for automated rollback.",
    ],
    monetisation: [
      "Internal tool — enables safer deployments and experimentation.",
    ],
  },

  premiumFeatures: {
    moduleKey: "premiumFeatures",
    title: "Premium Features",
    icon: "Crown",
    problem:
      "A freemium platform needs a clear, role-specific feature differentiation between free and paid tiers to drive subscription revenue.",
    solution:
      "A detailed product spec for premium features broken down by role (Investor, Intermediary, Issuer) with tier mapping, free vs Pro vs Enterprise limits, and implementation tracking.",
    useCases: [
      "Product planning: Review which features are gated behind premium for each role.",
      "Pricing strategy: Compare feature allocation across Free/Pro/Enterprise tiers.",
      "Development prioritisation: Track implementation effort for premium features.",
    ],
    currentScope: [
      "Role-specific feature catalogues (Investor, Intermediary, Issuer).",
      "Tier mapping: Free, Pro, Enterprise for each feature.",
      "Implementation effort estimates.",
      "Business rationale documentation.",
    ],
    futureScope: [
      "A/B test premium gates to optimise conversion.",
      "Usage-based premium triggers (auto-suggest upgrade when limits hit).",
      "Enterprise custom feature bundles.",
      "Premium feature analytics (adoption, churn correlation).",
    ],
    monetisation: [
      "Core monetisation driver — defines the subscription revenue model.",
      "Subscription tiers: ₹499/mo Pro, ₹1999/mo Enterprise.",
    ],
  },

  monitoring: {
    moduleKey: "monitoring",
    title: "Platform Monitoring",
    icon: "Activity",
    problem:
      "A production platform needs real-time visibility into system health, error rates, usage patterns, and infrastructure performance.",
    solution:
      "A monitoring dashboard with live metrics, usage analytics, error tracking, and infrastructure health indicators sourced from live database queries.",
    useCases: [
      "Performance check: Monitor API response times and database query patterns.",
      "Usage spike: Identify unusual traffic patterns that might indicate bot activity.",
      "Error tracking: Surface and categorise application errors for debugging.",
    ],
    currentScope: [
      "Real-time operational metrics (active sessions, error rates).",
      "Usage analytics with trend visualisation.",
      "Infrastructure health indicators.",
      "Error log aggregation and categorisation.",
    ],
    futureScope: [
      "APM integration (response time percentiles, slow query tracking).",
      "Custom alerting rules with Slack/email notifications.",
      "Cost monitoring and optimisation recommendations.",
      "Synthetic monitoring for critical user flows.",
    ],
    monetisation: [
      "Internal tool — ensures platform reliability and uptime SLA compliance.",
    ],
  },

  support: {
    moduleKey: "support",
    title: "Support Dashboard",
    icon: "Headphones",
    problem:
      "Users need a way to report issues, request features, and get help. Without structured support, issues are reported via email and WhatsApp with no tracking.",
    solution:
      "A ticket-based support system with category routing, SLA tracking, reply threads, and admin queue management.",
    useCases: [
      "Bug report: User submits a ticket about a broken feature; admin triages and responds.",
      "Feature request: User suggests a new feature; admin logs it for product backlog.",
      "Account issue: User can't verify credentials; support provides guided resolution.",
    ],
    currentScope: [
      "Ticket creation with category, priority, and description.",
      "Admin queue with status filters (open, in-progress, resolved, closed).",
      "Reply threads with admin responses.",
      "SLA indicators for response time.",
      "Ticket search and filtering.",
    ],
    futureScope: [
      "AI-powered auto-responses for common questions.",
      "KB article suggestion in ticket creation flow.",
      "Customer satisfaction ratings (CSAT) per resolution.",
      "Escalation workflows for critical issues.",
      "Internal notes and team assignment.",
    ],
    monetisation: [
      "Priority support for premium subscribers.",
      "Dedicated account manager for enterprise clients.",
    ],
  },

  email: {
    moduleKey: "email",
    title: "Email System",
    icon: "Mail",
    problem:
      "Transactional and auth emails (verification, password reset, welcome) need reliable delivery, monitoring, and suppression management.",
    solution:
      "An email operations dashboard with delivery tracking, suppression list management, template overview, and retry queue monitoring.",
    useCases: [
      "Delivery monitoring: Track email delivery rates and identify bounce patterns.",
      "Suppression management: Remove suppressed emails when users re-verify.",
      "Template audit: Review all active email templates for brand consistency.",
    ],
    currentScope: [
      "Email send log with status tracking (sent, failed, bounced).",
      "Suppression list management.",
      "Template overview with preview.",
      "Delivery statistics and error rates.",
      "Retry queue monitoring.",
    ],
    futureScope: [
      "A/B testing for email templates.",
      "Email deliverability scoring.",
      "Custom domain email sending.",
      "Automated warm-up sequences for new sending domains.",
    ],
    monetisation: [
      "Internal tool — ensures reliable communication and reduces support costs.",
    ],
  },

  audit: {
    moduleKey: "audit",
    title: "Audit Log",
    icon: "Activity",
    problem:
      "Regulatory compliance and internal governance require a tamper-proof record of all administrative actions on the platform.",
    solution:
      "A comprehensive audit log capturing every admin action with user ID, resource type, timestamp, and metadata. Filterable, searchable, and exportable.",
    useCases: [
      "Compliance review: Auditor requests a log of all user suspensions in the last quarter.",
      "Incident investigation: Trace who modified a specific listing and when.",
      "Access review: Verify which admins accessed sensitive data.",
    ],
    currentScope: [
      "Full action logging: create, update, delete, verify, suspend, restore.",
      "Filter by action type, resource type, user, date range.",
      "Search across all log entries.",
      "CSV export for compliance reporting.",
      "Pagination and date-range filtering.",
    ],
    futureScope: [
      "Immutable audit trail with cryptographic hashing.",
      "Real-time alerting for sensitive actions.",
      "Automated compliance reports.",
      "Integration with external SIEM systems.",
    ],
    monetisation: [
      "Extended audit retention (90 days free, 1 year for enterprise).",
      "Compliance report generation as a premium feature.",
    ],
  },

  invitations: {
    moduleKey: "invitations",
    title: "Invitations Pipeline",
    icon: "UserPlus",
    problem:
      "Growing a curated professional network requires structured invitation management — bulk imports, follow-up reminders, conversion tracking, and registry-based targeting.",
    solution:
      "An invitation lifecycle manager with create, track, remind, and convert capabilities. Supports bulk import from CSV, registry-based targeting, and automated follow-ups.",
    useCases: [
      "Registry import: Import AMFI-registered advisors from registry data and send targeted invitations.",
      "Bulk invite: Upload a CSV of conference attendees and invite them to join the platform.",
      "Follow-up: Automated reminders for pending invitations with configurable intervals.",
    ],
    currentScope: [
      "Invitation CRUD with target email, role, and channel.",
      "Status pipeline: pending → sent → opened → converted → expired.",
      "Bulk import from CSV with validation.",
      "Registry integration for targeted invitations.",
      "Automated reminder scheduling.",
      "Conversion tracking when invited users sign up.",
    ],
    futureScope: [
      "Referral attribution and reward system.",
      "Multi-channel invitations (WhatsApp, LinkedIn).",
      "Invitation analytics: best channels, best times, best messages.",
      "Ambassador program management.",
    ],
    monetisation: [
      "Internal growth tool — drives user acquisition.",
      "Referral rewards program as engagement driver.",
    ],
  },

  moderation: {
    moduleKey: "moderation",
    title: "Content Moderation",
    icon: "Shield",
    problem:
      "User-generated content in a financial platform must be moderated for misinformation, solicitation, coded messaging, and harassment — with regulatory implications.",
    solution:
      "A unified moderation system bridging all content types (posts, messages, listings, events) with severity scoring, pattern detection, and reviewer workflow.",
    useCases: [
      "Coded messaging detection: System flags a post containing disguised stock tips as potential SEBI violation.",
      "Report review: Admin reviews a flagged listing and determines if it violates platform guidelines.",
      "Bulk moderation: Process all pending reports during a weekly moderation sprint.",
    ],
    currentScope: [
      "Unified report queue across all content types.",
      "Severity scoring (low, medium, high, critical).",
      "Pattern matching for coded messaging.",
      "Reviewer workflow: review, action, notes.",
      "Admin actions: warn, hide, delete, suspend author.",
    ],
    futureScope: [
      "AI-powered content classification and auto-moderation.",
      "Community moderation (trusted user reports weighted higher).",
      "Appeal workflow for content creators.",
      "Moderation analytics and accuracy metrics.",
    ],
    monetisation: [
      "Internal tool — protects platform integrity and reduces regulatory risk.",
    ],
  },

  codedMessaging: {
    moduleKey: "codedMessaging",
    title: "Coded Messaging Detection",
    icon: "AlertTriangle",
    problem:
      "Financial platforms face regulatory risk when users share coded stock tips, insider information, or disguised investment advice. Standard keyword filters miss sophisticated coded language.",
    solution:
      "A specialised detection engine that identifies coded messaging patterns (ticker substitutions, price targets in emojis, veiled recommendations) with configurable sensitivity and admin review.",
    useCases: [
      "Disguised tip: Detects '🚀 R-E-L will hit 3K by Diwali' as a coded stock recommendation.",
      "Pattern evolution: Admins add new patterns as coded language evolves.",
      "Regulatory compliance: Audit trail of all detected and actioned coded messages.",
    ],
    currentScope: [
      "Pattern matching engine with regex and heuristic rules.",
      "Admin-configurable pattern definitions.",
      "Auto-flagging with severity scoring.",
      "Review queue with context display.",
      "Action logging for compliance audit.",
    ],
    futureScope: [
      "ML-based detection that learns from reviewer decisions.",
      "Multi-language coded messaging detection (Hindi, regional languages).",
      "Integration with SEBI's regulatory technology initiatives.",
      "Real-time detection during message compose (pre-send warning).",
    ],
    monetisation: [
      "Compliance technology licensing to other financial platforms.",
      "Regulatory reporting as a premium service.",
    ],
  },

  billing: {
    moduleKey: "billing",
    title: "Billing & Subscriptions",
    icon: "CreditCard",
    problem:
      "A freemium platform needs subscription management, payment processing, invoicing, and revenue tracking — localised for Indian payments (Razorpay, UPI).",
    solution:
      "A billing dashboard with Razorpay integration, subscription lifecycle management, payment history, and revenue analytics.",
    useCases: [
      "Subscription upgrade: User upgrades from Free to Pro; payment processed via Razorpay.",
      "Invoice generation: Monthly invoices generated and emailed to enterprise clients.",
      "Revenue tracking: Admin monitors MRR, churn, and upgrade conversion rates.",
    ],
    currentScope: [
      "Razorpay integration for subscription payments.",
      "Subscription plans management (Free, Pro, Enterprise).",
      "Payment history with status tracking.",
      "Refund processing and logging.",
      "Revenue dashboard with basic metrics.",
    ],
    futureScope: [
      "GST-compliant invoicing with HSN codes.",
      "Annual billing discounts and coupon management.",
      "Enterprise custom pricing and contract management.",
      "Revenue recognition and financial reporting.",
      "Dunning management for failed payments.",
    ],
    monetisation: [
      "Core revenue engine — subscription fees and transaction-based revenue.",
      "Target: ₹10 LPA ARR within 12 months of launch.",
    ],
  },

  seo: {
    moduleKey: "seo",
    title: "SEO Audit",
    icon: "Search",
    problem:
      "Organic discovery is critical for a professional platform. Without systematic SEO monitoring, pages accumulate issues — missing meta, slow loads, broken links.",
    solution:
      "An SEO audit tool that scans all public pages for meta tags, heading structure, image alt text, and performance indicators.",
    useCases: [
      "Pre-launch audit: Scan all pages before a major release to catch SEO regressions.",
      "Content optimisation: Identify blog posts with missing meta descriptions.",
      "Performance monitoring: Track page load times and Core Web Vitals.",
    ],
    currentScope: [
      "Page-level SEO scoring.",
      "Meta tag analysis (title, description, OG tags).",
      "Heading structure validation.",
      "Image alt text audit.",
      "Internal link analysis.",
    ],
    futureScope: [
      "Automated weekly SEO scans with trend tracking.",
      "Competitor SEO benchmarking.",
      "Schema markup validation (JSON-LD).",
      "Keyword ranking tracker.",
      "Integration with Google Search Console.",
    ],
    monetisation: [
      "Internal tool — drives organic traffic and reduces CAC.",
    ],
  },

  registry: {
    moduleKey: "registry",
    title: "Registry Sync",
    icon: "Database",
    problem:
      "Regulatory registries (AMFI, SEBI, IRDAI) contain verified professional data that can be used for invitation targeting and credential verification. Manual lookup is tedious.",
    solution:
      "Automated registry sync that imports and normalises data from regulatory bodies, enabling one-click verification and targeted invitation campaigns.",
    useCases: [
      "AMFI sync: Import the latest AMFI distributor registry to identify unregistered advisors.",
      "Verification cross-check: Auto-verify an ARN number against the synced AMFI data.",
      "Targeted invitations: Invite AMFI-registered advisors in specific cities.",
    ],
    currentScope: [
      "AMFI registry import and sync.",
      "Entity normalisation and deduplication.",
      "Search and filter within registry data.",
      "Integration with invitation pipeline for targeted outreach.",
    ],
    futureScope: [
      "SEBI registered intermediary registry sync.",
      "IRDAI agent registry integration.",
      "Automated daily/weekly sync schedules.",
      "Registry data enrichment with public financial data.",
    ],
    monetisation: [
      "Internal growth tool — reduces CAC for targeted professional segments.",
      "Registry data insights as a premium feature for institutional clients.",
    ],
  },

  scorecard: {
    moduleKey: "scorecard",
    title: "Project Scorecard",
    icon: "ClipboardCheck",
    problem:
      "A growing platform needs systematic tracking of project health — module completion, test coverage, technical debt, and deployment readiness.",
    solution:
      "A project scorecard that aggregates module-level health metrics: feature completeness, code quality indicators, and operational readiness.",
    useCases: [
      "Sprint review: Check which modules are production-ready vs. still in development.",
      "Investor update: Generate a project health summary for stakeholder reporting.",
      "Technical planning: Identify modules with highest technical debt for refactoring.",
    ],
    currentScope: [
      "Module-level completeness scoring.",
      "Feature checklist per module.",
      "Overall project health aggregation.",
    ],
    futureScope: [
      "Automated test coverage integration.",
      "Performance benchmark tracking.",
      "Deployment history and rollback readiness.",
      "Sprint velocity and burndown visualisation.",
    ],
    monetisation: [
      "Internal tool — improves development efficiency and stakeholder communication.",
    ],
  },
};

export default moduleSpecs;
