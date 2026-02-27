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

    // Cleanup events data
    const { data: existingEvents } = await supabaseAdmin.from("events").select("id").in("organizer_id", allUsers);
    const existingEventIds = (existingEvents || []).map(e => e.id);
    if (existingEventIds.length) {
      await supabaseAdmin.from("event_registrations").delete().in("event_id", existingEventIds);
      await supabaseAdmin.from("event_speakers").delete().in("event_id", existingEventIds);
      await supabaseAdmin.from("events").delete().in("id", existingEventIds);
    }

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

    // ===== SEED EVENTS =====
    const evNow = Date.now();
    const evDate = (daysFromNow: number, hours = 10) => {
      const d = new Date(evNow + 86400000 * daysFromNow);
      d.setHours(hours, 0, 0, 0);
      return d.toISOString();
    };
    const evEnd = (daysFromNow: number, hours = 11) => {
      const d = new Date(evNow + 86400000 * daysFromNow);
      d.setHours(hours, 30, 0, 0);
      return d.toISOString();
    };

    const eventsData = [
      {
        organizer_id: arjun, title: "India Innovation Fund — NFO Launch Webinar",
        description: "Join Bluechip Capital AMC's CIO for an exclusive webinar on our newest Innovation Fund. Learn about investment thesis, sector allocation (AI/ML, EV, Clean Energy, Fintech), risk framework, and expected returns.\n\nWho should attend: RIAs, MF Distributors, HNI Investors, and Institutional Buyers.\n\nQ&A session at the end.",
        category: "nfo_ipo_launch", event_mode: "virtual",
        virtual_link: "https://meet.google.com/abc-defg-hij",
        start_time: evDate(3, 11), end_time: evEnd(3, 12), capacity: 500,
        registration_count: 0, is_free: true, status: "published",
        tags: ["NFO", "Innovation", "AMC", "MutualFunds"],
      },
      {
        organizer_id: vikram, title: "Singh Infrastructure — Q3 FY26 Earnings Call",
        description: "Quarterly earnings call for investors and analysts.\n\nAgenda:\n• Q3 FY26 financial results walkthrough\n• Order book & pipeline update\n• Management commentary on infrastructure sector outlook\n• Analyst Q&A\n\nDial-in details shared to registered participants.",
        category: "earnings_call", event_mode: "virtual",
        virtual_link: "https://zoom.us/j/1234567890",
        start_time: evDate(5, 16), end_time: evEnd(5, 17), capacity: 200,
        registration_count: 0, is_free: true, status: "published",
        tags: ["Earnings", "Infrastructure", "Q3FY26"],
      },
      {
        organizer_id: anita, title: "Wealth Planning Masterclass for HNIs",
        description: "Desai Financial Services presents a comprehensive masterclass on holistic wealth planning.\n\nTopics:\n• Asset allocation for ₹5 Cr+ portfolios\n• Tax-efficient structures (HUF, Trust, LLP)\n• Real estate vs financial assets\n• Succession & estate planning\n\nLimited seats. By invitation + registration.",
        category: "investor_meet", event_mode: "physical",
        venue_name: "Taj Vivanta, Bandra Kurla Complex",
        venue_address: "BKC, Mumbai, Maharashtra 400051",
        start_time: evDate(10, 18), end_time: evEnd(10, 21), capacity: 50,
        registration_count: 0, is_free: true, status: "published",
        tags: ["WealthPlanning", "HNI", "TaxPlanning", "EstatePlanning"],
      },
      {
        organizer_id: priya, title: "SEBI RIA Regulatory Update — Feb 2026",
        description: "Monthly regulatory update session for SEBI-registered Investment Advisers.\n\nCovering:\n• New fee disclosure norms\n• Client agreement template changes\n• SEBI circular on digital advisory platforms\n• Compliance checklist update\n\nOpen to all RIAs and compliance officers.",
        category: "regulatory_update", event_mode: "virtual",
        virtual_link: "https://teams.microsoft.com/l/meetup/abc123",
        start_time: evDate(7, 15), end_time: evEnd(7, 16), capacity: 300,
        registration_count: 0, is_free: true, status: "published",
        tags: ["SEBI", "RIA", "Compliance", "Regulatory"],
      },
      {
        organizer_id: anita, title: "NISM Series V-A Exam Prep Workshop",
        description: "2-day intensive workshop for NISM Mutual Fund Distributors certification.\n\nDay 1: Conceptual framework, regulatory structure, types of schemes\nDay 2: NAV calculation, taxation, ethics, mock tests\n\nStudy material included. 95%+ pass rate from our previous batches.",
        category: "training_certification", event_mode: "hybrid",
        venue_name: "Desai Financial Academy, Kothrud",
        venue_address: "Pune, Maharashtra 411038",
        virtual_link: "https://meet.google.com/xyz-uvwx-rst",
        start_time: evDate(14, 9), end_time: evEnd(14, 17), capacity: 40,
        registration_count: 0, is_free: false, status: "published",
        tags: ["NISM", "Certification", "MFDistributor", "Training"],
      },
      {
        organizer_id: arjun, title: "Bluechip Capital — Annual General Meeting FY26",
        description: "Notice is hereby given that the Annual General Meeting of Bluechip Capital AMC will be held.\n\nAgenda:\n1. Adoption of financial statements FY26\n2. Declaration of dividend\n3. Re-appointment of directors\n4. Appointment of auditors\n\nOnly registered unitholders eligible to attend.",
        category: "agm_egm", event_mode: "hybrid",
        venue_name: "NSE Convention Centre, BKC",
        venue_address: "Bandra Kurla Complex, Mumbai 400051",
        virtual_link: "https://zoom.us/j/agm-bluechip-2026",
        start_time: evDate(21, 10), end_time: evEnd(21, 13), capacity: 150,
        registration_count: 0, is_free: true, status: "published",
        tags: ["AGM", "AMC", "FY26"],
      },
      {
        organizer_id: meera, title: "Pharma Sector Deep Dive — Analyst Roundtable",
        description: "Exclusive roundtable for research analysts and fund managers covering the Indian pharmaceutical sector.\n\nDiscussion points:\n• Generic pipeline CY2026-27\n• US FDA inspection trends\n• CDMO opportunity sizing\n• Top stock picks with conviction thesis\n\nLimited to 25 participants for quality discussion.",
        category: "industry_conference", event_mode: "virtual",
        virtual_link: "https://meet.google.com/pharma-deep-dive",
        start_time: evDate(12, 14), end_time: evEnd(12, 16), capacity: 25,
        registration_count: 0, is_free: true, status: "published",
        tags: ["Pharma", "Research", "Analyst", "DeepDive"],
      },
      {
        organizer_id: priya, title: "Webinar: Why Most Retail Investors Underperform",
        description: "An educational webinar for retail investors based on behavioral finance research.\n\nTopics:\n• The behavior gap — why investors earn less than their funds\n• SIP vs lump-sum: data-driven analysis\n• Common cognitive biases in investing\n• Building a rules-based investment process\n\nFree for all FindOO members.",
        category: "webinar", event_mode: "virtual",
        virtual_link: "https://meet.google.com/retail-investor-webinar",
        start_time: evDate(2, 19), end_time: evEnd(2, 20), capacity: 1000,
        registration_count: 0, is_free: true, status: "published",
        tags: ["InvestorEducation", "BehavioralFinance", "RetailInvestor"],
      },
    ];

    const { data: insertedEvents } = await supabaseAdmin.from("events").insert(eventsData).select("id, organizer_id, title");
    const seededEvents = insertedEvents || [];

    // ===== SEED EVENT SPEAKERS =====
    const speakerData = [];
    if (seededEvents.length >= 8) {
      // NFO Launch speakers
      speakerData.push(
        { event_id: seededEvents[0].id, speaker_name: "Arjun Mehta", speaker_title: "CIO, Bluechip Capital AMC", topic: "Innovation Fund Investment Thesis", position: 0 },
        { event_id: seededEvents[0].id, speaker_name: "Priya Sharma", speaker_title: "SEBI RIA, Independent Advisor", topic: "Portfolio Fit & Asset Allocation", position: 1 },
      );
      // Earnings call
      speakerData.push(
        { event_id: seededEvents[1].id, speaker_name: "Vikram Singh", speaker_title: "MD, Singh Infrastructure Ltd", topic: "Q3 FY26 Results & Outlook", position: 0 },
      );
      // HNI Masterclass
      speakerData.push(
        { event_id: seededEvents[2].id, speaker_name: "Anita Desai", speaker_title: "Founder, Desai Financial Services", topic: "Holistic Wealth Framework", position: 0 },
        { event_id: seededEvents[2].id, speaker_name: "Sneha Patel", speaker_title: "CA, Tax & Estate Planning Specialist", topic: "Tax-Efficient Structures for HNIs", position: 1 },
      );
      // Regulatory update
      speakerData.push(
        { event_id: seededEvents[3].id, speaker_name: "Priya Sharma", speaker_title: "SEBI RIA", topic: "Monthly Regulatory Roundup", position: 0 },
      );
      // NISM workshop
      speakerData.push(
        { event_id: seededEvents[4].id, speaker_name: "Anita Desai", speaker_title: "AMFI Registered Distributor", topic: "NISM Series V-A Complete Coverage", position: 0 },
      );
      // Pharma roundtable
      speakerData.push(
        { event_id: seededEvents[6].id, speaker_name: "Meera Reddy", speaker_title: "SEBI RA, Pharma Sector Specialist", topic: "Generic Pipeline & Top Picks", position: 0 },
      );
      // Retail investor webinar
      speakerData.push(
        { event_id: seededEvents[7].id, speaker_name: "Priya Sharma", speaker_title: "SEBI RIA", topic: "Behavioral Finance & Investment Process", position: 0 },
      );
    }
    if (speakerData.length) await supabaseAdmin.from("event_speakers").insert(speakerData);

    // ===== SEED EVENT REGISTRATIONS =====
    const eventRegs = [];
    if (seededEvents.length >= 8) {
      // NFO webinar — wide interest
      eventRegs.push(
        { event_id: seededEvents[0].id, user_id: rajesh, status: "registered" },
        { event_id: seededEvents[0].id, user_id: priya, status: "registered" },
        { event_id: seededEvents[0].id, user_id: karan, status: "registered" },
        { event_id: seededEvents[0].id, user_id: anita, status: "registered" },
        { event_id: seededEvents[0].id, user_id: meera, status: "registered" },
        { event_id: seededEvents[0].id, user_id: sneha, status: "registered" },
      );
      // Earnings call
      eventRegs.push(
        { event_id: seededEvents[1].id, user_id: rajesh, status: "registered" },
        { event_id: seededEvents[1].id, user_id: priya, status: "registered" },
        { event_id: seededEvents[1].id, user_id: meera, status: "registered" },
        { event_id: seededEvents[1].id, user_id: arjun, status: "registered" },
      );
      // HNI Masterclass
      eventRegs.push(
        { event_id: seededEvents[2].id, user_id: rajesh, status: "registered" },
        { event_id: seededEvents[2].id, user_id: karan, status: "registered" },
        { event_id: seededEvents[2].id, user_id: priya, status: "registered" },
      );
      // Regulatory update — intermediaries
      eventRegs.push(
        { event_id: seededEvents[3].id, user_id: sneha, status: "registered" },
        { event_id: seededEvents[3].id, user_id: anita, status: "registered" },
        { event_id: seededEvents[3].id, user_id: meera, status: "registered" },
      );
      // NISM workshop
      eventRegs.push(
        { event_id: seededEvents[4].id, user_id: rajesh, status: "registered" },
      );
      // Pharma roundtable
      eventRegs.push(
        { event_id: seededEvents[6].id, user_id: priya, status: "registered" },
        { event_id: seededEvents[6].id, user_id: arjun, status: "registered" },
      );
      // Retail investor webinar
      eventRegs.push(
        { event_id: seededEvents[7].id, user_id: rajesh, status: "registered" },
        { event_id: seededEvents[7].id, user_id: karan, status: "registered" },
        { event_id: seededEvents[7].id, user_id: sneha, status: "registered" },
      );
    }
    if (eventRegs.length) await supabaseAdmin.from("event_registrations").insert(eventRegs);

    // Update registration counts on events
    if (seededEvents.length >= 8) {
      const regCounts: Record<string, number> = {};
      eventRegs.forEach(r => { regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1; });
      for (const [eventId, count] of Object.entries(regCounts)) {
        await supabaseAdmin.from("events").update({ registration_count: count }).eq("id", eventId);
      }
    }

    // ===== SEED BLOG POSTS =====
    await supabaseAdmin.from("blog_posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const blogPosts = [
      {
        title: "Understanding SEBI's New Mutual Fund Categorisation Norms",
        slug: "sebi-mutual-fund-categorisation-2026",
        excerpt: "SEBI's updated categorisation framework impacts how AMCs structure their schemes. Here's what investors and intermediaries need to know.",
        category: "regulation",
        cover_image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
        tags: ["SEBI", "Mutual Funds", "Regulation", "AMC"],
        read_time_minutes: 7, published: true, featured: true,
        author_name: "Priya Sharma", author_avatar_url: "/images/avatars/priya-sharma.jpg",
        published_at: d(2),
        content: `<h2>Background</h2><p>The Securities and Exchange Board of India (SEBI) has issued revised guidelines for mutual fund categorisation, effective April 2026. These changes aim to bring greater transparency and reduce overlap between scheme categories.</p><h2>Key Changes</h2><ul><li><strong>Flexi-Cap Redefined:</strong> Minimum 25% allocation each to large-cap, mid-cap, and small-cap segments.</li><li><strong>New Thematic Categories:</strong> ESG, Innovation, and Digital Economy now have standalone classification.</li><li><strong>Debt Fund Simplification:</strong> Duration-based categories reduced from 16 to 10.</li><li><strong>Hybrid Adjustments:</strong> Balanced Advantage Funds must disclose dynamic allocation models quarterly.</li></ul><h2>Impact on Investors</h2><p>Retail investors will benefit from clearer product labels. The overlap between multi-cap and flexi-cap has been a persistent source of confusion — these norms address that directly.</p><blockquote><p>"This is the most significant reclassification since 2018. AMCs will need to realign portfolios within 6 months." — SEBI Circular, Feb 2026</p></blockquote><h2>What Intermediaries Should Do</h2><ol><li>Review existing client portfolios for category overlap</li><li>Update risk profiling documents with new category definitions</li><li>Communicate changes proactively to HNI and retail clients</li><li>Attend AMFI's upcoming training sessions on the new framework</li></ol><h2>Conclusion</h2><p>While the transition period is 6 months, early adopters — both AMCs and distributors — will have a competitive advantage. Stay tuned for our detailed scheme-by-scheme impact analysis next week.</p>`,
      },
      {
        title: "India's IT Services: Q3 FY26 Earnings Analysis",
        slug: "it-services-q3-fy26-analysis",
        excerpt: "IT bellwethers reported mixed results. AI/ML revenues now contribute 8-12% of total revenue. Here's our deep dive.",
        category: "market-insights",
        cover_image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
        tags: ["IT Sector", "Earnings", "Analysis", "TCS", "Infosys"],
        read_time_minutes: 10, published: true, featured: false,
        author_name: "Meera Reddy", author_avatar_url: "/images/avatars/meera-reddy.jpg",
        published_at: d(4),
        content: `<h2>Executive Summary</h2><p>India's top-4 IT services companies reported Q3 FY26 earnings with <strong>4-6% QoQ revenue growth</strong> in constant currency terms. The sector showed resilience despite global macro headwinds.</p><h3>TCS</h3><p>Revenue: ₹64,200 Cr (+5.2% QoQ). EBIT margin: 25.8%. Large deal TCV: $12.2B — highest in 8 quarters.</p><h3>Infosys</h3><p>Revenue: ₹41,800 Cr (+4.8% QoQ). Raised guidance to 5-6% for FY26. Topaz AI platform driving cross-sell.</p><h3>Wipro</h3><p>Revenue: ₹23,400 Cr (+3.1% QoQ). Margin improvement of 120bps driven by operational efficiency.</p><h3>HCL Technologies</h3><p>Revenue: ₹29,600 Cr (+6.1% QoQ). Strong performance in engineering services.</p><h2>AI/ML Revenue Contribution</h2><table><thead><tr><th>Company</th><th>AI/ML Revenue %</th><th>QoQ Change</th></tr></thead><tbody><tr><td>TCS</td><td>12%</td><td>+2.1pp</td></tr><tr><td>Infosys</td><td>10%</td><td>+1.8pp</td></tr><tr><td>Wipro</td><td>8%</td><td>+1.2pp</td></tr><tr><td>HCL Tech</td><td>11%</td><td>+2.4pp</td></tr></tbody></table><h2>Sector Outlook</h2><p>We maintain an <strong>Overweight</strong> stance on Indian IT. Key catalysts: US Fed rate cuts, GenAI monetisation inflection, and rupee depreciation tailwinds.</p><blockquote><p>Top Picks: TCS (large-cap stability), LTIMindtree (mid-cap alpha)</p></blockquote>`,
      },
      {
        title: "Budget 2026: Tax Changes Every Investor Must Know",
        slug: "budget-2026-tax-changes-investors",
        excerpt: "From revised LTCG slabs to ELSS lock-in changes — a comprehensive guide to Union Budget 2026 implications for your portfolio.",
        category: "investing",
        cover_image_url: "https://images.unsplash.com/photo-1554224155-1696413565d3?w=1200&q=80",
        tags: ["Budget 2026", "Tax", "LTCG", "ELSS"],
        read_time_minutes: 8, published: true, featured: false,
        author_name: "Sneha Patel", author_avatar_url: "/images/avatars/sneha-patel.jpg",
        published_at: d(6),
        content: `<h2>Overview</h2><p>The Union Budget 2026-27 introduced several changes that directly impact retail investors, HNIs, and financial intermediaries.</p><h2>Capital Gains Tax Changes</h2><h3>Long-Term Capital Gains (LTCG)</h3><ul><li>Exemption limit increased from ₹1.25 lakh to ₹1.5 lakh per annum</li><li>LTCG rate remains at 12.5% for equity and equity-oriented MFs</li><li>Holding period for listed bonds reduced from 12 to 9 months</li></ul><h3>Short-Term Capital Gains (STCG)</h3><ul><li>STCG on equity remains at 20%</li><li>Intraday equity gains now taxed at flat 25%</li></ul><h2>ELSS Changes</h2><p>Lock-in period reduced from 3 years to 2 years, making it more attractive. Section 80C deduction limit remains ₹1.5 lakh.</p><h2>Impact Matrix</h2><table><thead><tr><th>Change</th><th>Benefit To</th><th>Action Required</th></tr></thead><tbody><tr><td>LTCG exemption ↑</td><td>All equity investors</td><td>Harvest gains up to ₹1.5L</td></tr><tr><td>ELSS lock-in ↓</td><td>Tax-saving investors</td><td>Review SIP allocation</td></tr><tr><td>Intraday tax ↑</td><td>None (negative)</td><td>Reconsider frequent trading</td></tr></tbody></table><h2>Recommended Actions</h2><ol><li>Review your tax harvesting strategy with the new ₹1.5L LTCG limit</li><li>Consider increasing NPS allocation if your employer offers enhanced contribution</li><li>If you trade intraday frequently, the 25% flat rate may increase your tax outgo</li></ol>`,
      },
      {
        title: "NFO Alert: Bluechip Capital India Innovation Fund",
        slug: "bluechip-capital-india-innovation-fund-nfo",
        excerpt: "Bluechip Capital AMC launches its thematic fund focused on AI, EV, Clean Energy, and Fintech sectors. NFO opens March 1-15.",
        category: "investing",
        cover_image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
        tags: ["NFO", "Mutual Funds", "Innovation", "AI"],
        read_time_minutes: 5, published: true, featured: false,
        author_name: "Arjun Mehta", author_avatar_url: "/images/avatars/arjun-mehta.jpg",
        published_at: d(8),
        content: `<h2>Fund Overview</h2><p>Bluechip Capital AMC announces the <strong>India Innovation Fund</strong>, a thematic equity fund targeting India's fastest-growing innovation sectors.</p><h2>Key Details</h2><ul><li><strong>NFO Period:</strong> March 1-15, 2026</li><li><strong>Minimum Investment:</strong> ₹5,000 (SIP: ₹500/month)</li><li><strong>Benchmark:</strong> Nifty India Digital Index</li><li><strong>Fund Manager:</strong> Arjun Mehta, CFA (15+ years experience)</li><li><strong>Exit Load:</strong> 1% if redeemed within 365 days</li></ul><h2>Sector Allocation Strategy</h2><ul><li><strong>AI & Machine Learning (30%):</strong> Companies building or heavily adopting AI</li><li><strong>Electric Vehicles (25%):</strong> EV OEMs, battery tech, charging infrastructure</li><li><strong>Clean Energy (25%):</strong> Solar, wind, green hydrogen</li><li><strong>Fintech (20%):</strong> Digital payments, neo-banks, insurtech</li></ul><blockquote><p>"We believe innovation-driven companies will deliver 2-3x market returns over the next decade." — Arjun Mehta, CIO</p></blockquote><h2>Who Should Invest?</h2><p>Investors with a <strong>5+ year horizon</strong> and <strong>high risk appetite</strong> looking for satellite allocation to India's structural growth themes.</p>`,
      },
      {
        title: "Pharma Sector: CY2026 Outlook & Top Picks",
        slug: "pharma-sector-cy2026-outlook",
        excerpt: "Indian pharma companies are well-positioned with robust generic pipelines and biosimilar opportunities.",
        category: "market-insights",
        cover_image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80",
        tags: ["Pharma", "Healthcare", "Research"],
        read_time_minutes: 9, published: true, featured: false,
        author_name: "Meera Reddy", author_avatar_url: "/images/avatars/meera-reddy.jpg",
        published_at: d(10),
        content: `<h2>Sector Overview</h2><p>The Indian pharmaceutical sector enters CY2026 with strong tailwinds: a robust ANDA pipeline, biosimilar launches, and domestic formulations growth of 10-12%.</p><h2>Key Growth Drivers</h2><ol><li><strong>US Generics Pipeline:</strong> 800+ ANDAs pending approval</li><li><strong>Biosimilars:</strong> 15+ launches expected targeting $40B worth of biologics</li><li><strong>CDMO Opportunity:</strong> India's global share expected to grow from 5% to 8%</li><li><strong>Domestic Market:</strong> Chronic therapies growing at 14-16% CAGR</li></ol><h2>Valuation Snapshot</h2><table><thead><tr><th>Company</th><th>CMP (₹)</th><th>P/E</th><th>Growth</th><th>Rating</th></tr></thead><tbody><tr><td>Sun Pharma</td><td>1,845</td><td>32x</td><td>+14%</td><td>BUY</td></tr><tr><td>Cipla</td><td>1,520</td><td>28x</td><td>+11%</td><td>BUY</td></tr><tr><td>Divi's Labs</td><td>4,200</td><td>42x</td><td>+18%</td><td>ACCUMULATE</td></tr><tr><td>Lupin</td><td>1,680</td><td>26x</td><td>+16%</td><td>BUY</td></tr></tbody></table><h2>Top Picks</h2><p><strong>Sun Pharma</strong> (specialty diversification), <strong>Cipla</strong> (respiratory strength), and <strong>Divi's Labs</strong> (CDMO tailwinds) are our top conviction ideas.</p>`,
      },
      {
        title: "A Beginner's Guide to Systematic Investment Plans (SIPs)",
        slug: "beginners-guide-to-sip",
        excerpt: "Everything you need to know about SIPs — how they work, why they matter, and how to start your first SIP today.",
        category: "general",
        cover_image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80",
        tags: ["SIP", "Mutual Funds", "Beginners"],
        read_time_minutes: 6, published: true, featured: false,
        author_name: "FindOO Team",
        published_at: d(12),
        content: `<h2>What is a SIP?</h2><p>A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly into a mutual fund scheme. Think of it as a recurring deposit — but for equity and debt markets.</p><h2>How Does SIP Work?</h2><p>When you invest via SIP, you buy units at the prevailing NAV. When the market is low, you get more units; when it's high, you get fewer. This is <strong>Rupee Cost Averaging</strong>.</p><h3>Example</h3><table><thead><tr><th>Month</th><th>NAV (₹)</th><th>Investment</th><th>Units</th></tr></thead><tbody><tr><td>January</td><td>100</td><td>₹5,000</td><td>50.00</td></tr><tr><td>February</td><td>90</td><td>₹5,000</td><td>55.56</td></tr><tr><td>March</td><td>110</td><td>₹5,000</td><td>45.45</td></tr><tr><td>April</td><td>95</td><td>₹5,000</td><td>52.63</td></tr></tbody></table><p>Average cost per unit: ₹98.39 — SIP naturally buys more when prices are low!</p><h2>Benefits of SIP</h2><ol><li><strong>Discipline:</strong> Automates your investing habit</li><li><strong>Rupee Cost Averaging:</strong> Reduces impact of volatility</li><li><strong>Power of Compounding:</strong> ₹10,000/month at 12% = ₹1 Cr in ~20 years</li><li><strong>Flexibility:</strong> Start with ₹500/month</li></ol><h2>How to Start</h2><ol><li>Complete KYC (Aadhaar + PAN — 10 minutes online)</li><li>Choose an Index Fund for beginners</li><li>Select Direct plan for lower expense ratio</li><li>Set up auto-debit</li><li>Stay invested for 5-7 years minimum</li></ol><h2>Common Mistakes</h2><ul><li>Stopping SIP during market crashes</li><li>Investing in too many funds (3-4 is sufficient)</li><li>Chasing past returns</li><li>Not increasing SIP amount annually</li></ul><p><strong>Start small, stay consistent, think long-term.</strong></p>`,
      },
      {
        title: "AMFI Quarterly Report: MF Industry Hits ₹65 Lakh Crore AUM",
        slug: "amfi-quarterly-report-q4-fy26",
        excerpt: "India's mutual fund industry crossed a historic milestone. Key trends and data inside.",
        category: "market-insights",
        cover_image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
        tags: ["AMFI", "AUM", "Industry"],
        read_time_minutes: 6, published: true, featured: false,
        author_name: "Anita Desai", author_avatar_url: "/images/avatars/anita-desai.jpg",
        published_at: d(14),
        content: `<h2>Industry Milestone</h2><p>AMFI's Q4 FY26 data confirms the Indian mutual fund industry crossed <strong>₹65 lakh crore AUM</strong> — a 22% YoY growth.</p><h2>Key Highlights</h2><ul><li><strong>SIP Flows:</strong> Monthly inflows hit ₹24,500 crore</li><li><strong>SIP Accounts:</strong> 9.8 crore active accounts</li><li><strong>Equity AUM:</strong> ₹32 lakh crore (49% of total)</li><li><strong>Debt AUM:</strong> ₹18 lakh crore (28%)</li></ul><h2>Growth Drivers</h2><ol><li>Digital-first distribution expanding to Tier-3/4 cities</li><li>Investor education campaigns showing results</li><li>New fund categories attracting younger investors</li><li>Equity market performance boosting AUM</li></ol><blockquote><p>"India's MF penetration is still only 18% of GDP vs 120% in the US. The runway is immense." — AMFI Chairman</p></blockquote><h2>What This Means for Distributors</h2><p>The expanding pie means opportunities for MFDs and RIAs, especially in under-penetrated geographies. Digital tools like FindOO are making client acquisition more efficient than ever.</p>`,
      },
      {
        title: "5 Red Flags to Watch Before Investing in Small-Cap Stocks",
        slug: "red-flags-small-cap-investing",
        excerpt: "Small-caps can deliver outsized returns, but they carry significant risks. Here are 5 warning signs every investor should know.",
        category: "general",
        cover_image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80",
        tags: ["Small Cap", "Risk", "Awareness"],
        read_time_minutes: 5, published: true, featured: false,
        author_name: "Priya Sharma", author_avatar_url: "/images/avatars/priya-sharma.jpg",
        published_at: d(16),
        content: `<h2>The Small-Cap Allure</h2><p>Small-cap stocks have delivered 35%+ returns in the last 2 years. But with great returns come great risks.</p><h2>1. Promoter Pledging Above 40%</h2><p>When promoters pledge a significant portion of holdings, it signals financial stress. If the stock falls, lenders can sell pledged shares — creating a vicious spiral.</p><h2>2. Frequent Related-Party Transactions</h2><p>Excessive transactions with promoter-linked entities can signal fund siphoning. Look for loans to group companies at non-market rates.</p><h2>3. Auditor Changes or Qualifications</h2><p>Frequent auditor changes or qualified opinions are often the earliest warning signs of accounting irregularities.</p><h2>4. Revenue Without Cash Flow</h2><p>Revenue growth with deteriorating operating cash flow may indicate aggressive revenue recognition. Always compare:</p><ul><li>Revenue growth vs receivables growth</li><li>PAT vs operating cash flow</li><li>Inventory days trend</li></ul><h2>5. Sudden Bulk/Block Deals</h2><p>Large unexplained block deals before positive announcements can indicate insider activity.</p><h2>The Bottom Line</h2><p>Small-caps can be portfolio multipliers, but <strong>due diligence is non-negotiable</strong>. Use these red flags as a screening checklist.</p>`,
      },
    ];

    const { error: blogErr } = await supabaseAdmin.from("blog_posts").insert(blogPosts);
    if (blogErr) console.error("Blog seed error:", blogErr.message);

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
      events: seededEvents.length,
      event_speakers: speakerData.length,
      event_registrations: eventRegs.length,
      blog_posts: blogPosts.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
