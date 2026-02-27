import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name, display_name").eq("onboarding_completed", true);
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "No users found. Run seed-users first." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMap: Record<string, string> = {};
    for (const p of profiles) {
      if (p.full_name) userMap[p.full_name] = p.id;
      if (p.display_name) userMap[p.display_name] = p.id;
    }

    const rajesh = userMap["Rajesh Kumar"];
    const priya = userMap["Priya Sharma"];
    const arjun = userMap["Arjun Mehta"] || userMap["Bluechip Capital AMC"];
    const sneha = userMap["Sneha Patel"];
    const vikram = userMap["Vikram Singh"] || userMap["Singh Infrastructure Ltd"];
    const anita = userMap["Anita Desai"] || userMap["Desai Financial Services"];
    const karan = userMap["Karan Joshi"];
    const meera = userMap["Meera Reddy"];

    if (!rajesh || !priya || !arjun || !sneha || !vikram || !anita || !karan || !meera) {
      return new Response(JSON.stringify({ error: "Some users not found", userMap }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allUsers = [rajesh, priya, arjun, sneha, vikram, anita, karan, meera];

    // ===== CLEANUP: Delete all existing seeded data (order matters for FK constraints) =====
    await supabaseAdmin.from("reports").delete().in("reporter_id", allUsers);
    await supabaseAdmin.from("notifications").delete().in("user_id", allUsers);
    await supabaseAdmin.from("survey_responses").delete().in("user_id", allUsers);

    // Cleanup jobs data
    await supabaseAdmin.from("saved_jobs").delete().in("user_id", allUsers);
    const { data: existingJobs } = await supabaseAdmin.from("jobs").select("id").in("poster_id", allUsers);
    const existingJobIds = (existingJobs || []).map(j => j.id);
    if (existingJobIds.length) {
      await supabaseAdmin.from("job_applications").delete().in("job_id", existingJobIds);
      await supabaseAdmin.from("jobs").delete().in("id", existingJobIds);
    }

    // Cleanup profile views
    await supabaseAdmin.from("profile_views").delete().in("viewer_id", allUsers);
    await supabaseAdmin.from("profile_views").delete().in("profile_id", allUsers);

    // Delete survey_options & survey_questions via posts
    const { data: existingPosts } = await supabaseAdmin.from("posts").select("id").in("author_id", allUsers);
    const existingPostIds = (existingPosts || []).map(p => p.id);
    if (existingPostIds.length) {
      const { data: existingQuestions } = await supabaseAdmin.from("survey_questions").select("id").in("post_id", existingPostIds);
      const existingQuestionIds = (existingQuestions || []).map(q => q.id);
      if (existingQuestionIds.length) {
        await supabaseAdmin.from("survey_options").delete().in("question_id", existingQuestionIds);
        await supabaseAdmin.from("survey_questions").delete().in("id", existingQuestionIds);
      }
      const { data: existingPollOpts } = await supabaseAdmin.from("poll_options").select("id").in("post_id", existingPostIds);
      const existingPollOptIds = (existingPollOpts || []).map(o => o.id);
      if (existingPollOptIds.length) {
        await supabaseAdmin.from("poll_votes").delete().in("poll_option_id", existingPollOptIds);
        await supabaseAdmin.from("poll_options").delete().in("id", existingPollOptIds);
      }
      await supabaseAdmin.from("post_interactions").delete().in("post_id", existingPostIds);
      await supabaseAdmin.from("comments").delete().in("post_id", existingPostIds);
      await supabaseAdmin.from("posts").delete().in("id", existingPostIds);
    }
    await supabaseAdmin.from("messages").delete().in("sender_id", allUsers);
    await supabaseAdmin.from("connections").delete().in("from_user_id", allUsers);
    await supabaseAdmin.from("connections").delete().in("to_user_id", allUsers);

    // ===== BATCH INSERT POSTS =====
    const normalPosts = [
      { author_id: rajesh, content: "Just started my SIP journey with index funds. Looking for recommendations on the best Nifty 50 index funds with lowest tracking error. 📈\n\n#IndexFunds #SIP #PassiveInvesting", post_type: "query", query_category: "requirement", hashtags: ["IndexFunds", "SIP", "PassiveInvesting"] },
      { author_id: karan, content: "As an NRI, navigating Indian market regulations is complex. Looking for a good RIA who understands cross-border tax implications and DTAA provisions.\n\n#NRIInvesting #TaxPlanning", post_type: "query", query_category: "expert_find", hashtags: ["NRIInvesting", "TaxPlanning"] },
      { author_id: priya, content: "🔍 Market Commentary — Feb 2026\n\nNifty 50 consolidation around 24,500. FII selling moderated, DII flows robust.\n\nSectors to watch: IT, Pharma, Banking.\n\n#MarketCommentary #Nifty50", post_type: "market_commentary", hashtags: ["MarketCommentary", "Nifty50"] },
      { author_id: meera, content: "📊 Weekly Pharma Sector Update\n\nSun Pharma & Dr. Reddy's leading. Generic pipeline robust for CY2026.\n\nTop picks: Sun Pharma, Cipla, Divi's Labs\n\n#Pharma #ResearchNote", post_type: "market_commentary", hashtags: ["Pharma", "ResearchNote"] },
      { author_id: meera, content: "📝 Deep Dive: India's IT Services Sector — Q3 FY26\n\nIT showed resilience with 4-6% QoQ revenue growth. AI/ML revenues now 8-12% of total.\n\n#ITSector #ResearchNote", post_type: "research_note", hashtags: ["ITSector", "ResearchNote"], attachment_type: "document", attachment_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800", attachment_name: "IT_Sector_Q3FY26.pdf" },
      { author_id: priya, content: "📋 Model Portfolio Update — Conservative Growth\n\n🟢 Equity 60% 🔵 Debt 30% 🟡 Gold 10%\n\n#PortfolioManagement #AssetAllocation", post_type: "research_note", hashtags: ["PortfolioManagement", "AssetAllocation"] },
      { author_id: vikram, content: "🏗️ Singh Infrastructure — awarded ₹2,400 Cr highway project by NHAI. Order book now ₹12,800 Cr.\n\n#Infrastructure #NHAI #BSE", post_type: "announcement", hashtags: ["Infrastructure", "NHAI", "BSE"], attachment_type: "image", attachment_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800", attachment_name: "highway.jpg" },
      { author_id: arjun, content: "🚀 Bluechip Capital AMC — New \"India Innovation Fund\" NFO\n\nMarch 1-15, Min ₹5,000. Focus: AI/ML, EV, Clean Energy, Fintech\n\n#MutualFunds #NFO #Innovation", post_type: "announcement", hashtags: ["MutualFunds", "NFO", "Innovation"] },
      { author_id: anita, content: "📢 Desai Financial Services crossed ₹5,000 Cr AUM! Expanding to 15 new Tier-2 cities.\n\n#NBFC #MFDistribution #GrowthStory", post_type: "announcement", hashtags: ["NBFC", "MFDistribution", "GrowthStory"], attachment_type: "image", attachment_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", attachment_name: "milestone.jpg" },
      { author_id: sneha, content: "📝 New Tax Regime Guide for Investors — Budget 2026 changes explained. LTCG, STCG, ELSS impact covered.\n\n#TaxPlanning #Budget2026 #CA", post_type: "article", hashtags: ["TaxPlanning", "Budget2026", "CA"] },
      { author_id: priya, content: "🎙️ New podcast: \"Why Most Retail Investors Underperform\"\n\nBehavior gap, SIP vs lump-sum, common biases.\n\n#InvestorEducation #Podcast", post_type: "article", hashtags: ["InvestorEducation", "Podcast"] },
      { author_id: arjun, content: "🎥 CIO discusses H1 CY2026 outlook. Sector rotation, mid-cap allocation, top 5 conviction ideas.\n\n#MarketOutlook #AMC", post_type: "market_commentary", hashtags: ["MarketOutlook", "AMC"], attachment_type: "video", attachment_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800", attachment_name: "CIO_Outlook.mp4" },
      { author_id: anita, content: "Attended AMFI conference. MF industry grew from ₹10L Cr to ₹60L Cr AUM in 10 years. Incredible! 🙏\n\n#AMFI #MutualFunds", post_type: "text", hashtags: ["AMFI", "MutualFunds"] },
      { author_id: rajesh, content: "6 months on FindOO — need help finding a SEBI-registered advisor for long-term equity portfolio review. Any recommendations? 💯\n\n#FindOO #RetailInvestor", post_type: "query", query_category: "expert_find", hashtags: ["FindOO", "RetailInvestor"] },
      { author_id: vikram, content: "🏗️ Q3 FY26 Results — Revenue ₹1,840 Cr (+22%), PAT ₹142 Cr (+28%). Order Book ₹12,800 Cr.\n\n#QuarterlyResults #Earnings", post_type: "announcement", hashtags: ["QuarterlyResults", "Earnings"] },
    ];

    const { data: insertedNormal } = await supabaseAdmin.from("posts").insert(normalPosts).select("id, author_id");
    const insertedPosts = insertedNormal || [];

    // ===== POLL POSTS (need sequential for options) =====
    const pollDefs = [
      { post: { author_id: priya, content: "📊 Poll: What's your primary investment vehicle in 2026?\n\n#InvestorPoll", post_type: "text", post_kind: "poll", hashtags: ["InvestorPoll"] }, options: ["Mutual Funds (SIP)", "Direct Equity", "ETFs / Index Funds", "Fixed Deposits / Bonds"] },
      { post: { author_id: arjun, content: "Which sector will outperform in H2 CY2026?\n\n#SectorOutlook", post_type: "market_commentary", post_kind: "poll", hashtags: ["SectorOutlook"] }, options: ["IT & Technology", "Banking & Financials", "Pharma & Healthcare", "Infrastructure"] },
      { post: { author_id: meera, content: "How do you consume financial research?\n\n#ResearchPoll", post_type: "text", post_kind: "poll", hashtags: ["ResearchPoll"] }, options: ["Broker reports & apps", "Social media / FindOO", "Financial newspapers"] },
    ];

    let pollsCreated = 0;
    for (const poll of pollDefs) {
      const { data: pData } = await supabaseAdmin.from("posts").insert(poll.post).select("id, author_id").single();
      if (!pData) continue;
      pollsCreated++;
      insertedPosts.push(pData);
      const optInserts = poll.options.map((o, i) => ({ post_id: pData.id, option_text: o, position: i }));
      const { data: opts } = await supabaseAdmin.from("poll_options").insert(optInserts).select("id");
      if (opts) {
        const voters = allUsers.filter(u => u !== pData.author_id);
        const votes = opts.flatMap((opt, i) => {
          const count = (i % 3) + 1;
          return voters.slice(i, i + count).map(u => ({ poll_option_id: opt.id, user_id: u }));
        });
        if (votes.length) await supabaseAdmin.from("poll_votes").insert(votes);
      }
    }

    // ===== SURVEY =====
    const { data: surveyPost } = await supabaseAdmin.from("posts").insert({
      author_id: anita, content: "📋 Investor Sentiment Survey Q1 2026\n\n#Survey #Sentiment", post_type: "text", post_kind: "survey", hashtags: ["Survey", "Sentiment"],
    }).select("id").single();

    if (surveyPost) {
      insertedPosts.push({ id: surveyPost.id, author_id: anita });
      const questions = [
        { text: "How confident are you about Indian markets next 6 months?", opts: ["Very Bullish", "Cautiously Optimistic", "Neutral", "Bearish"] },
        { text: "Biggest investment concern?", opts: ["Global recession", "Inflation", "Geopolitics", "Regulatory changes"] },
        { text: "Which asset class are you increasing allocation to?", opts: ["Large-cap Equity", "Mid/Small-cap", "Debt / Fixed Income", "Gold"] },
      ];
      for (let q = 0; q < questions.length; q++) {
        const { data: qData } = await supabaseAdmin.from("survey_questions").insert({ post_id: surveyPost.id, question_text: questions[q].text, question_type: "single_choice", position: q }).select("id").single();
        if (!qData) continue;
        const optInserts = questions[q].opts.map((o, i) => ({ question_id: qData.id, option_text: o, position: i }));
        const { data: opts } = await supabaseAdmin.from("survey_options").insert(optInserts).select("id");
        if (opts) {
          const responders = [rajesh, karan, sneha, meera];
          const responses = opts.slice(0, 2).map((o, i) => ({ question_id: qData.id, option_id: o.id, user_id: responders[i] }));
          if (responses.length) await supabaseAdmin.from("survey_responses").insert(responses);
        }
      }
    }

    // ===== BATCH COMMENTS =====
    const comments = [
      { post_id: insertedPosts[0]?.id, author_id: priya, content: "Great decision! Index funds are the backbone of wealth building. Nifty 50 + Nifty Next 50 for beginners. 👍" },
      { post_id: insertedPosts[0]?.id, author_id: sneha, content: "Growth option in equity funds is more tax-efficient under the new regime!" },
      { post_id: insertedPosts[0]?.id, author_id: meera, content: "UTI Nifty 50 and Motilal S&P 500 are excellent for core allocation." },
      { post_id: insertedPosts[2]?.id, author_id: rajesh, content: "Very helpful! Good to know DII flows are strong." },
      { post_id: insertedPosts[2]?.id, author_id: arjun, content: "Agree on banking. Our financial services fund outperforms consistently." },
      { post_id: insertedPosts[2]?.id, author_id: karan, content: "What's your view on IT for NRIs looking at rupee depreciation benefit?" },
      { post_id: insertedPosts[6]?.id, author_id: anita, content: "Congratulations! Bharatmala projects are game-changers! 🎉" },
      { post_id: insertedPosts[6]?.id, author_id: rajesh, content: "Impressive order book growth!" },
      { post_id: insertedPosts[7]?.id, author_id: priya, content: "Will review the SID for my clients. Expected expense ratio?" },
      { post_id: insertedPosts[7]?.id, author_id: karan, content: "Can NRIs invest in this NFO?" },
      { post_id: insertedPosts[9]?.id, author_id: karan, content: "NRI taxation section is super helpful. DTAA often overlooked!" },
      { post_id: insertedPosts[9]?.id, author_id: rajesh, content: "Shared with friends. Great LTCG explainer!" },
      { post_id: insertedPosts[9]?.id, author_id: anita, content: "Excellent article! Can we collaborate on a webinar?" },
    ].filter(c => c.post_id);

    if (comments.length) await supabaseAdmin.from("comments").insert(comments);

    // ===== BATCH INTERACTIONS =====
    const interactions: { post_id: string; user_id: string; interaction_type: string }[] = [];
    for (let i = 0; i < insertedPosts.length; i++) {
      const post = insertedPosts[i];
      const others = allUsers.filter(u => u !== post.author_id);
      const likeCount = (i % others.length) + 1;
      for (let j = 0; j < likeCount; j++) {
        interactions.push({ post_id: post.id, user_id: others[j], interaction_type: "like" });
      }
      if (i % 2 === 0) interactions.push({ post_id: post.id, user_id: others[0], interaction_type: "bookmark" });
      if (i % 3 === 0) interactions.push({ post_id: post.id, user_id: others[1], interaction_type: "repost" });
    }
    if (interactions.length) await supabaseAdmin.from("post_interactions").insert(interactions);

    // ===== BATCH CONNECTIONS =====
    const connectionData = [
      { from_user_id: rajesh, to_user_id: priya, connection_type: "connect", status: "accepted" },
      { from_user_id: rajesh, to_user_id: meera, connection_type: "follow", status: "accepted" },
      { from_user_id: rajesh, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: rajesh, to_user_id: arjun, connection_type: "follow", status: "accepted" },
      { from_user_id: priya, to_user_id: sneha, connection_type: "connect", status: "accepted" },
      { from_user_id: priya, to_user_id: meera, connection_type: "connect", status: "accepted" },
      { from_user_id: priya, to_user_id: anita, connection_type: "connect", status: "accepted" },
      { from_user_id: arjun, to_user_id: priya, connection_type: "connect", status: "accepted" },
      { from_user_id: arjun, to_user_id: anita, connection_type: "connect", status: "accepted" },
      { from_user_id: arjun, to_user_id: sneha, connection_type: "follow", status: "accepted" },
      { from_user_id: karan, to_user_id: priya, connection_type: "connect", status: "pending" },
      { from_user_id: karan, to_user_id: sneha, connection_type: "follow", status: "accepted" },
      { from_user_id: karan, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: karan, to_user_id: arjun, connection_type: "follow", status: "accepted" },
      { from_user_id: vikram, to_user_id: anita, connection_type: "connect", status: "accepted" },
      { from_user_id: vikram, to_user_id: arjun, connection_type: "connect", status: "accepted" },
      { from_user_id: anita, to_user_id: meera, connection_type: "connect", status: "accepted" },
      { from_user_id: anita, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: meera, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: meera, to_user_id: arjun, connection_type: "connect", status: "accepted" },
      { from_user_id: sneha, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: sneha, to_user_id: arjun, connection_type: "follow", status: "accepted" },
      { from_user_id: sneha, to_user_id: anita, connection_type: "connect", status: "pending" },
    ];
    await supabaseAdmin.from("connections").insert(connectionData);

    // ===== BATCH MESSAGES =====
    const now = Date.now();
    const d = (daysAgo: number, hoursExtra = 0) => new Date(now - 86400000 * daysAgo + 3600000 * hoursExtra).toISOString();
    const messageData = [
      { sender_id: rajesh, receiver_id: priya, content: "Hi Priya, could you help me review my portfolio?", created_at: d(3) },
      { sender_id: priya, receiver_id: rajesh, content: "Happy to help! Share your holdings and investment horizon.", created_at: d(3, 1) },
      { sender_id: rajesh, receiver_id: priya, content: "Mostly large-cap MFs and a few direct equity. 10+ yr horizon.", created_at: d(2) },
      { sender_id: priya, receiver_id: rajesh, content: "Let's do a call. I'll share my calendar link. Avoid impulsive trades! 😊", created_at: d(2, 0.5) },
      { sender_id: arjun, receiver_id: anita, content: "Hi Anita, congrats on ₹5,000 Cr AUM! Interested in a distribution partnership?", created_at: d(5) },
      { sender_id: anita, receiver_id: arjun, content: "Thank you! Innovation theme aligns with our HNI clients. When to discuss?", created_at: d(4) },
      { sender_id: arjun, receiver_id: anita, content: "Meeting next week. Distribution head will share commercial terms.", created_at: d(3) },
      { sender_id: karan, receiver_id: sneha, content: "Hi Sneha, need help understanding DTAA for NRIs. Can you assist?", created_at: d(2) },
      { sender_id: sneha, receiver_id: karan, content: "Sure! Which country are you based in? DTAA varies significantly.", created_at: d(2, 2) },
      { sender_id: karan, receiver_id: sneha, content: "Singapore. Concern is capital gains on Indian equity.", created_at: d(1) },
      { sender_id: sneha, receiver_id: karan, content: "India-Singapore DTAA is favorable. I'll prepare a summary note.", created_at: d(1, 1) },
      { sender_id: vikram, receiver_id: meera, content: "Meera, interested in an exclusive analyst meet with our management?", created_at: d(6) },
      { sender_id: meera, receiver_id: vikram, content: "Absolutely! Order book pipeline and margins discussion would be great.", created_at: d(5) },
      { sender_id: priya, receiver_id: meera, content: "Meera, your pharma note was excellent. Webinar collaboration?", created_at: d(1) },
      { sender_id: meera, receiver_id: priya, content: "I'd love that! Research + portfolio construction. Next Thursday?", created_at: d(0, -6) },
    ];
    await supabaseAdmin.from("messages").insert(messageData);

    // ===== BATCH NOTIFICATIONS =====
    const notifs = [
      { user_id: rajesh, actor_id: priya, type: "like", message: "Priya Sharma liked your post", reference_type: "post", reference_id: insertedPosts[0]?.id },
      { user_id: rajesh, actor_id: meera, type: "like", message: "Meera Reddy liked your post", reference_type: "post", reference_id: insertedPosts[0]?.id },
      { user_id: rajesh, actor_id: sneha, type: "comment", message: "Sneha Patel commented on your post", reference_type: "post", reference_id: insertedPosts[0]?.id },
      { user_id: priya, actor_id: rajesh, type: "comment", message: "Rajesh Kumar commented on your market commentary", reference_type: "post", reference_id: insertedPosts[2]?.id },
      { user_id: priya, actor_id: karan, type: "connection_request", message: "Karan Joshi sent you a connection request", reference_type: "connection", reference_id: karan },
      { user_id: vikram, actor_id: anita, type: "comment", message: "Anita Desai commented on your announcement", reference_type: "post", reference_id: insertedPosts[6]?.id },
      { user_id: vikram, actor_id: rajesh, type: "follow", message: "Rajesh Kumar started following you", reference_type: "profile", reference_id: rajesh },
      { user_id: arjun, actor_id: karan, type: "comment", message: "Karan Joshi commented on your NFO post", reference_type: "post", reference_id: insertedPosts[7]?.id },
      { user_id: sneha, actor_id: karan, type: "comment", message: "Karan Joshi commented on your article", reference_type: "post", reference_id: insertedPosts[9]?.id },
      { user_id: sneha, actor_id: anita, type: "comment", message: "Anita Desai wants to collaborate", reference_type: "post", reference_id: insertedPosts[9]?.id },
      { user_id: meera, actor_id: vikram, type: "message", message: "Vikram Singh sent you a message", reference_type: "message", reference_id: vikram },
      { user_id: anita, actor_id: arjun, type: "message", message: "Bluechip Capital sent you a message", reference_type: "message", reference_id: arjun },
    ].filter(n => n.reference_id);
    if (notifs.length) await supabaseAdmin.from("notifications").insert(notifs);

    // ===== BATCH REPORTS =====
    const reports = [
      { reporter_id: rajesh, post_id: insertedPosts[11]?.id, reason: "misleading_info", description: "Overly promotional without disclaimers.", status: "pending" },
    ].filter(r => r.post_id);
    if (reports.length) await supabaseAdmin.from("reports").insert(reports);

    // ===== BATCH USER SETTINGS =====
    const settings = allUsers.map((uid, i) => ({
      user_id: uid,
      email_notifications: i < 6,
      notify_likes: true,
      notify_comments: true,
      notify_follows: i < 5,
      notify_connections: true,
      notify_messages: true,
      profile_visibility: i > 5 ? "connections" : "public",
      show_email: i % 2 === 0,
      show_phone: false,
    }));
    await supabaseAdmin.from("user_settings").upsert(settings, { onConflict: "user_id" });

    // ===== SEED JOBS =====
    const jobsData = [
      {
        poster_id: arjun, title: "Senior Fund Manager — Equity", company_name: "Bluechip Capital AMC",
        description: "Lead equity portfolio management for our flagship multi-cap fund (AUM ₹8,000 Cr). Drive alpha generation through bottom-up stock selection.\n\nResponsibilities:\n• Manage multi-cap equity portfolio\n• Lead a team of 4 analysts\n• Present quarterly reviews to trustees\n• Develop sector allocation framework",
        location: "Mumbai, Maharashtra", is_remote: false, job_category: "fund_management", job_type: "full_time",
        experience_min: 8, experience_max: 15, salary_min: 3500000, salary_max: 6000000,
        skills_required: ["Equity Research", "Portfolio Construction", "Risk Management", "Bloomberg Terminal", "Financial Modeling"],
        qualifications: ["CFA Charterholder", "MBA Finance"], certifications_preferred: ["CFA", "FRM"],
        status: "active", application_count: 12, view_count: 156,
      },
      {
        poster_id: arjun, title: "Research Analyst — IT & Technology", company_name: "Bluechip Capital AMC",
        description: "Cover Indian IT services & technology sector. Publish sector reports, earnings notes, and investment recommendations.\n\nKey skills: Financial modeling, sector expertise, client presentations.",
        location: "Mumbai, Maharashtra", is_remote: false, job_category: "research_analysis", job_type: "full_time",
        experience_min: 3, experience_max: 7, salary_min: 1500000, salary_max: 2800000,
        skills_required: ["Financial Modeling", "Equity Research", "IT Sector Knowledge", "Excel", "Presentation Skills"],
        qualifications: ["CA", "CFA Level 2+", "MBA Finance"], certifications_preferred: ["CFA"],
        status: "active", application_count: 24, view_count: 312,
      },
      {
        poster_id: vikram, title: "Chief Financial Officer", company_name: "Singh Infrastructure Ltd",
        description: "Lead finance function for a ₹12,800 Cr order-book infrastructure company. Oversee treasury, project finance, investor relations, and statutory compliance.\n\nReporting to MD. Board-level interaction.",
        location: "New Delhi", is_remote: false, job_category: "corporate_finance", job_type: "full_time",
        experience_min: 15, experience_max: 25, salary_min: 8000000, salary_max: 15000000,
        skills_required: ["Corporate Finance", "Treasury Management", "Investor Relations", "IFRS/IndAS", "Project Finance"],
        qualifications: ["CA", "MBA Finance"], certifications_preferred: ["CA", "CFA"],
        status: "active", application_count: 8, view_count: 198,
      },
      {
        poster_id: anita, title: "Wealth Advisor — HNI Segment", company_name: "Desai Financial Services",
        description: "Manage a portfolio of 50+ HNI/UHNI clients with combined AUM of ₹200+ Cr. Provide holistic financial planning including MF, PMS, AIF, Insurance.\n\nTarget: Tier-1 city based professionals and business families.",
        location: "Pune, Maharashtra", is_remote: false, job_category: "wealth_advisory", job_type: "full_time",
        experience_min: 5, experience_max: 12, salary_min: 1800000, salary_max: 3500000,
        skills_required: ["Wealth Management", "Financial Planning", "MF Distribution", "Insurance", "Client Relationship"],
        qualifications: ["CFP", "MBA Finance", "CA"], certifications_preferred: ["CFP", "NISM Series"],
        status: "active", application_count: 18, view_count: 245,
      },
      {
        poster_id: anita, title: "Compliance Officer — SEBI Registered", company_name: "Desai Financial Services",
        description: "Ensure regulatory compliance across MF distribution, PMS advisory, and insurance operations. SEBI, AMFI, IRDAI regulatory interface.\n\nMust have NISM certifications and 3+ years compliance experience.",
        location: "Mumbai, Maharashtra", is_remote: false, job_category: "compliance_legal", job_type: "full_time",
        experience_min: 3, experience_max: 8, salary_min: 1200000, salary_max: 2200000,
        skills_required: ["Regulatory Compliance", "SEBI Regulations", "AMFI Guidelines", "AML/KYC", "Risk Assessment"],
        qualifications: ["CS", "LLB", "MBA"], certifications_preferred: ["NISM Series", "CS"],
        status: "active", application_count: 6, view_count: 89,
      },
      {
        poster_id: vikram, title: "Risk Manager — Project Finance", company_name: "Singh Infrastructure Ltd",
        description: "Assess and manage financial & operational risks across infrastructure projects worth ₹500-2,000 Cr each. Develop risk matrices and mitigation frameworks.",
        location: "New Delhi", is_remote: false, job_category: "risk_management", job_type: "full_time",
        experience_min: 5, experience_max: 10, salary_min: 2000000, salary_max: 3800000,
        skills_required: ["Risk Assessment", "Project Finance", "Monte Carlo Simulation", "Financial Modeling", "Due Diligence"],
        qualifications: ["MBA Finance", "CA"], certifications_preferred: ["FRM", "PMP"],
        status: "active", application_count: 9, view_count: 134,
      },
      {
        poster_id: arjun, title: "FinTech Product Manager — Digital MF Platform", company_name: "Bluechip Capital AMC",
        description: "Own the digital mutual fund purchase platform. Drive UX improvements, API integrations with BSE Star/MF Central, and mobile app features.\n\nRemote-friendly role.",
        location: "Bengaluru, Karnataka", is_remote: true, job_category: "fintech", job_type: "full_time",
        experience_min: 4, experience_max: 9, salary_min: 2500000, salary_max: 4500000,
        skills_required: ["Product Management", "Fintech", "API Integration", "Agile/Scrum", "Data Analytics"],
        qualifications: ["MBA", "B.Tech"], certifications_preferred: [],
        status: "active", application_count: 32, view_count: 478,
      },
      {
        poster_id: anita, title: "Relationship Manager — Mutual Fund Distribution", company_name: "Desai Financial Services",
        description: "Build and manage relationships with retail and HNI investors. Drive SIP and lump-sum collections. Territory: Western Maharashtra.\n\nIncentive-heavy compensation structure.",
        location: "Pune, Maharashtra", is_remote: false, job_category: "distribution_sales", job_type: "full_time",
        experience_min: 2, experience_max: 6, salary_min: 800000, salary_max: 1500000,
        skills_required: ["Sales", "Mutual Fund Distribution", "Client Management", "Financial Planning", "AMFI Registered"],
        qualifications: ["Graduate", "NISM Series V-A"], certifications_preferred: ["NISM Series", "CFP"],
        status: "active", application_count: 15, view_count: 201,
      },
      {
        poster_id: vikram, title: "Data Analyst — Infrastructure Analytics", company_name: "Singh Infrastructure Ltd",
        description: "Build dashboards and analytics models for project monitoring, cost tracking, and operational efficiency. Python, SQL, Power BI expertise required.",
        location: "New Delhi", is_remote: true, job_category: "data_analytics", job_type: "contract",
        experience_min: 2, experience_max: 5, salary_min: 1000000, salary_max: 1800000,
        skills_required: ["Python", "SQL", "Power BI", "Data Visualization", "Statistical Analysis"],
        qualifications: ["B.Tech/B.E.", "M.Sc Statistics"], certifications_preferred: [],
        status: "active", application_count: 28, view_count: 367,
      },
      {
        poster_id: arjun, title: "Intern — Equity Research (Summer 2026)", company_name: "Bluechip Capital AMC",
        description: "3-month summer internship in equity research team. Sector assignment based on interest. Stipend + PPO opportunity for top performers.",
        location: "Mumbai, Maharashtra", is_remote: false, job_category: "research_analysis", job_type: "internship",
        experience_min: 0, experience_max: 1, salary_min: 50000, salary_max: 75000,
        skills_required: ["Financial Analysis", "Excel", "Research", "Presentation"],
        qualifications: ["MBA student", "CA Intermediate"], certifications_preferred: ["CFA Level 1"],
        status: "active", application_count: 45, view_count: 890,
      },
    ];

    const { data: insertedJobs } = await supabaseAdmin.from("jobs").insert(jobsData).select("id, poster_id");
    const seededJobs = insertedJobs || [];

    // ===== SEED JOB APPLICATIONS =====
    // Individual users apply to jobs (not entity users like arjun/vikram/anita)
    const jobApps = [];
    if (seededJobs.length >= 8) {
      // Rajesh (investor) applies to wealth advisor & RM roles
      jobApps.push(
        { job_id: seededJobs[3].id, applicant_id: rajesh, cover_note: "I have 5+ years in client-facing wealth management and hold CFP certification. Currently managing ₹150 Cr HNI portfolio.", status: "shortlisted" },
        { job_id: seededJobs[7].id, applicant_id: rajesh, cover_note: "Strong track record in MF distribution with AMFI registration. Deep network in Western Maharashtra.", status: "viewed" },
      );
      // Priya (intermediary individual) applies to fund manager & research roles
      jobApps.push(
        { job_id: seededJobs[0].id, applicant_id: priya, cover_note: "12 years equity portfolio management experience. Previously managed ₹3,000 Cr AUM at ICICI Prudential. CFA charterholder.", status: "interviewing" },
        { job_id: seededJobs[1].id, applicant_id: priya, cover_note: "Strong IT sector coverage experience with published research notes.", status: "submitted" },
      );
      // Karan (NRI investor) applies to fintech & data roles
      jobApps.push(
        { job_id: seededJobs[6].id, applicant_id: karan, cover_note: "Product manager at a Singapore-based fintech. Experience with MF platforms and API-first architectures.", status: "offered" },
        { job_id: seededJobs[8].id, applicant_id: karan, cover_note: "Data analytics background with Python and Power BI. Infrastructure domain experience from previous role.", status: "viewed" },
      );
      // Sneha (CA) applies to compliance & CFO roles
      jobApps.push(
        { job_id: seededJobs[4].id, applicant_id: sneha, cover_note: "Chartered Accountant with 6 years in financial services compliance. NISM certified. Strong SEBI regulatory knowledge.", status: "shortlisted" },
        { job_id: seededJobs[2].id, applicant_id: sneha, cover_note: "CA with corporate finance experience. Currently heading finance at a mid-cap listed company.", status: "submitted" },
      );
      // Meera (research analyst) applies to research roles
      jobApps.push(
        { job_id: seededJobs[1].id, applicant_id: meera, cover_note: "5 years sell-side research covering IT & pharma. Published 100+ research notes. Strong buy-side relationships.", status: "interviewing" },
        { job_id: seededJobs[9].id, applicant_id: meera, cover_note: "Currently pursuing MBA with CFA Level 1 cleared. Passionate about equity research.", status: "hired" },
      );
    }
    if (jobApps.length) await supabaseAdmin.from("job_applications").insert(jobApps);

    // ===== SEED SAVED JOBS =====
    const savedJobs = [];
    if (seededJobs.length >= 8) {
      savedJobs.push(
        { user_id: rajesh, job_id: seededJobs[0].id },
        { user_id: rajesh, job_id: seededJobs[3].id },
        { user_id: rajesh, job_id: seededJobs[6].id },
        { user_id: karan, job_id: seededJobs[6].id },
        { user_id: karan, job_id: seededJobs[8].id },
        { user_id: priya, job_id: seededJobs[0].id },
        { user_id: sneha, job_id: seededJobs[4].id },
        { user_id: sneha, job_id: seededJobs[2].id },
        { user_id: meera, job_id: seededJobs[1].id },
      );
    }
    if (savedJobs.length) await supabaseAdmin.from("saved_jobs").insert(savedJobs);

    // ===== SEED PROFILE VIEWS =====
    const pvNow = Date.now();
    const pv = (daysAgo: number) => new Date(pvNow - 86400000 * daysAgo).toISOString();
    const profileViews = [
      { viewer_id: priya, profile_id: rajesh, created_at: pv(1) },
      { viewer_id: arjun, profile_id: rajesh, created_at: pv(2) },
      { viewer_id: meera, profile_id: rajesh, created_at: pv(3) },
      { viewer_id: anita, profile_id: rajesh, created_at: pv(5) },
      { viewer_id: rajesh, profile_id: priya, created_at: pv(1) },
      { viewer_id: arjun, profile_id: priya, created_at: pv(2) },
      { viewer_id: sneha, profile_id: priya, created_at: pv(4) },
      { viewer_id: karan, profile_id: priya, created_at: pv(6) },
      { viewer_id: vikram, profile_id: priya, created_at: pv(7) },
      { viewer_id: rajesh, profile_id: arjun, created_at: pv(3) },
      { viewer_id: priya, profile_id: arjun, created_at: pv(4) },
      { viewer_id: anita, profile_id: arjun, created_at: pv(5) },
      { viewer_id: priya, profile_id: sneha, created_at: pv(2) },
      { viewer_id: karan, profile_id: sneha, created_at: pv(3) },
      { viewer_id: rajesh, profile_id: meera, created_at: pv(1) },
      { viewer_id: arjun, profile_id: meera, created_at: pv(2) },
      { viewer_id: priya, profile_id: vikram, created_at: pv(5) },
      { viewer_id: anita, profile_id: vikram, created_at: pv(6) },
      { viewer_id: arjun, profile_id: anita, created_at: pv(3) },
      { viewer_id: vikram, profile_id: anita, created_at: pv(4) },
    ];
    await supabaseAdmin.from("profile_views").insert(profileViews);

    return new Response(JSON.stringify({
      success: true,
      posts: insertedPosts.length,
      polls: pollsCreated,
      survey: surveyPost ? 1 : 0,
      comments: comments.length,
      interactions: interactions.length,
      connections: connectionData.length,
      messages: messageData.length,
      notifications: notifs.length,
      settings: settings.length,
      jobs: seededJobs.length,
      job_applications: jobApps.length,
      saved_jobs: savedJobs.length,
      profile_views: profileViews.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
