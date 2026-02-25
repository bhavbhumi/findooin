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

    // Get all sample users
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
      return new Response(JSON.stringify({ 
        error: "Some users not found", 
        found: { rajesh: !!rajesh, priya: !!priya, arjun: !!arjun, sneha: !!sneha, vikram: !!vikram, anita: !!anita, karan: !!karan, meera: !!meera },
        userMap 
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== POSTS =====
    const posts = [
      // Text posts
      {
        author_id: rajesh,
        content: "Just started my SIP journey with index funds. The power of compounding is real! 📈 Anyone else prefer passive investing over active fund management?\n\n#IndexFunds #SIP #PassiveInvesting",
        post_type: "text",
        hashtags: ["IndexFunds", "SIP", "PassiveInvesting"],
      },
      {
        author_id: karan,
        content: "As an NRI, navigating the Indian market regulations can be quite complex. Looking for a good RIA who understands cross-border tax implications. Any recommendations on FindOO?\n\n#NRIInvesting #TaxPlanning",
        post_type: "text",
        hashtags: ["NRIInvesting", "TaxPlanning"],
      },

      // Market commentary
      {
        author_id: priya,
        content: "🔍 Market Commentary — Feb 2026\n\nNifty 50 continues its consolidation around 24,500 levels. FII selling has moderated this week, with DII flows remaining robust.\n\nKey sectors to watch:\n• IT — Strong earnings momentum, favorable USD/INR\n• Pharma — US FDA approvals driving optimism\n• Banking — NPA concerns easing, credit growth at 15%+\n\nMy view: Stay invested, avoid timing the market. Quality large-caps remain attractive at current valuations.\n\n#MarketCommentary #Nifty50 #IndianMarkets",
        post_type: "market_commentary",
        hashtags: ["MarketCommentary", "Nifty50", "IndianMarkets"],
      },
      {
        author_id: meera,
        content: "📊 Weekly Pharma Sector Update\n\nSun Pharma & Dr. Reddy's leading the rally after strong Q3 results. Generic pipeline looks robust for CY2026.\n\nKey catalysts:\n1. US FDA inspection outcomes (positive trend)\n2. Biosimilar launches in EU markets\n3. Domestic formulation growth at 12% YoY\n\nTop picks: Sun Pharma, Cipla, Divi's Labs\n\n⚠️ Disclaimer: SEBI-registered Research Analyst. Views are personal. Not investment advice.\n\n#Pharma #ResearchNote #SEBI",
        post_type: "market_commentary",
        hashtags: ["Pharma", "ResearchNote", "SEBI"],
      },

      // Research notes
      {
        author_id: meera,
        content: "📝 Deep Dive: India's IT Services Sector — Q3 FY26 Review\n\nThe IT sector showed resilience with top-tier companies reporting 4-6% QoQ revenue growth in constant currency terms.\n\nKey highlights:\n• Deal pipeline remains healthy with large deal TCV at multi-quarter highs\n• BFSI vertical recovery is gaining traction\n• Margins are stabilizing post wage hike cycles\n• AI/ML practice revenues now contribute 8-12% of total revenue\n\nValuation: Sector trading at 25x forward P/E — at historical average. Selective stock picking recommended.\n\nFull report attached 📄\n\n#ITSector #ResearchNote #Earnings",
        post_type: "research_note",
        hashtags: ["ITSector", "ResearchNote", "Earnings"],
        attachment_type: "document",
        attachment_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
        attachment_name: "IT_Sector_Deep_Dive_Q3FY26.pdf",
      },
      {
        author_id: priya,
        content: "📋 Model Portfolio Update — Conservative Growth Strategy\n\nRebalanced my recommended model portfolio for Q4 FY26:\n\n🟢 Equity (60%): Large-cap focused with quality bias\n🔵 Debt (30%): Short-duration funds + corporate bonds\n🟡 Gold (10%): Tactical allocation amid global uncertainty\n\nDetailed allocation sheet attached for my connected clients.\n\n#PortfolioManagement #AssetAllocation #RIA",
        post_type: "research_note",
        hashtags: ["PortfolioManagement", "AssetAllocation", "RIA"],
        attachment_type: "document",
        attachment_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
        attachment_name: "Model_Portfolio_Q4FY26.xlsx",
      },

      // Announcements
      {
        author_id: vikram,
        content: "🏗️ Singh Infrastructure Ltd — Press Release\n\nWe are pleased to announce that Singh Infrastructure has been awarded a ₹2,400 Cr highway construction project by NHAI under the Bharatmala Pariyojana Phase-II.\n\nProject Details:\n• 148 km highway stretch in Rajasthan\n• Expected completion: 30 months\n• EPC mode with hybrid annuity\n\nThis takes our total order book to ₹12,800 Cr, providing strong revenue visibility for the next 3-4 years.\n\n#Infrastructure #NHAI #BSE #NSE",
        post_type: "announcement",
        hashtags: ["Infrastructure", "NHAI", "BSE", "NSE"],
        attachment_type: "image",
        attachment_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
        attachment_name: "highway_project.jpg",
      },
      {
        author_id: arjun,
        content: "🚀 Bluechip Capital AMC — New Fund Launch\n\nWe're excited to announce the launch of \"Bluechip India Innovation Fund\" — an open-ended equity scheme investing in companies driving India's innovation economy.\n\nNFO Period: March 1-15, 2026\nMin Investment: ₹5,000\nBenchmark: Nifty 500\nFund Manager: Sanjay Kapoor (15 yrs experience)\n\nFocus areas: AI/ML, EV, Clean Energy, Deeptech, Fintech\n\nSID and KIM available on our website.\n\n#MutualFunds #NFO #Innovation #AMC",
        post_type: "announcement",
        hashtags: ["MutualFunds", "NFO", "Innovation", "AMC"],
      },
      {
        author_id: anita,
        content: "📢 Desai Financial Services — Milestone Update\n\nProud to share that we've crossed ₹5,000 Cr in AUM across our mutual fund distribution and NBFC lending verticals!\n\nThank you to our 50,000+ clients and 200+ partner intermediaries for their trust.\n\nWe're also expanding to 15 new Tier-2 cities this quarter. 🇮🇳\n\n#NBFC #MFDistribution #GrowthStory",
        post_type: "announcement",
        hashtags: ["NBFC", "MFDistribution", "GrowthStory"],
        attachment_type: "image",
        attachment_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        attachment_name: "milestone_celebration.jpg",
      },

      // Articles
      {
        author_id: sneha,
        content: "📝 Understanding the New Tax Regime — A Comprehensive Guide for Investors\n\nWith the Union Budget 2026 introducing significant changes to the tax structure, here's what every investor needs to know:\n\n1️⃣ New vs Old Regime — Which is better for you?\n2️⃣ Impact on ELSS and 80C deductions\n3️⃣ Capital gains tax changes — LTCG & STCG updates\n4️⃣ NRI taxation implications\n5️⃣ Tax-efficient investment strategies for FY27\n\nAs a CA, I see many investors making mistakes during this transition. The key is to model both regimes with your actual numbers before deciding.\n\nDetailed article with calculation templates attached.\n\n#TaxPlanning #Budget2026 #CA #IncomeTax",
        post_type: "article",
        hashtags: ["TaxPlanning", "Budget2026", "CA", "IncomeTax"],
        attachment_type: "document",
        attachment_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6e?w=800",
        attachment_name: "Tax_Regime_Guide_FY27.pdf",
      },
      {
        author_id: priya,
        content: "🎙️ Just recorded a new podcast episode on \"Why Most Retail Investors Underperform — And How to Fix It\"\n\nTopics covered:\n• The behavior gap in investing\n• Why SIPs beat lump-sum for most investors\n• Common biases: recency, anchoring, herd mentality\n• Building a simple, evidence-based portfolio\n\nListen to the full episode here 🎧\n\n#InvestorEducation #Podcast #BehavioralFinance",
        post_type: "article",
        hashtags: ["InvestorEducation", "Podcast", "BehavioralFinance"],
        attachment_type: "audio",
        attachment_url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
        attachment_name: "Investor_Behavior_Podcast_Ep12.mp3",
      },

      // Post with video attachment
      {
        author_id: arjun,
        content: "🎥 Watch: CIO Sanjay Kapoor discusses our market outlook for H1 CY2026\n\nKey topics:\n• Global macro trends and India's positioning\n• Sector rotation strategy\n• Why mid-caps deserve allocation now\n• Our top 5 conviction ideas\n\nFull video interview from our annual investor conference.\n\n#MarketOutlook #AMC #InvestorConference",
        post_type: "market_commentary",
        hashtags: ["MarketOutlook", "AMC", "InvestorConference"],
        attachment_type: "video",
        attachment_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
        attachment_name: "CIO_Market_Outlook_H1_2026.mp4",
      },

      // More text posts for variety
      {
        author_id: anita,
        content: "Attended the AMFI annual conference yesterday. The mutual fund industry's growth trajectory is incredible — from ₹10 Lakh Cr to ₹60 Lakh Cr AUM in just 10 years.\n\nAs both a distributor and NBFC, we're seeing massive demand from Tier-2 and Tier-3 cities. Financial inclusion is truly happening. 🙏\n\n#AMFI #MutualFunds #FinancialInclusion",
        post_type: "text",
        hashtags: ["AMFI", "MutualFunds", "FinancialInclusion"],
      },
      {
        author_id: rajesh,
        content: "6 months into my investing journey on FindOO and I've learned more from verified RIAs and research analysts here than from any YouTube channel. The quality of discussion here is unmatched. 💯\n\n#FindOO #RetailInvestor #LearningJourney",
        post_type: "text",
        hashtags: ["FindOO", "RetailInvestor", "LearningJourney"],
      },
      {
        author_id: vikram,
        content: "🏗️ Q3 FY26 Results Snapshot — Singh Infrastructure Ltd\n\nRevenue: ₹1,840 Cr (+22% YoY)\nEBITDA: ₹276 Cr (15% margin)\nPAT: ₹142 Cr (+28% YoY)\nOrder Book: ₹12,800 Cr\n\nInvestor presentation attached. Conference call details to follow.\n\n#QuarterlyResults #InfrastructureSector #Earnings",
        post_type: "announcement",
        hashtags: ["QuarterlyResults", "InfrastructureSector", "Earnings"],
        attachment_type: "document",
        attachment_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        attachment_name: "Singh_Infra_Q3FY26_Investor_Presentation.pdf",
      },
    ];

    const insertedPosts = [];
    for (const post of posts) {
      const { data, error } = await supabaseAdmin.from("posts").insert(post).select("id, author_id").single();
      if (data) insertedPosts.push(data);
      if (error) console.error("Post insert error:", error.message);
    }

    // ===== COMMENTS =====
    const comments = [];
    if (insertedPosts.length > 0) {
      // Comments on Rajesh's SIP post
      comments.push(
        { post_id: insertedPosts[0].id, author_id: priya, content: "Great decision! Index funds are the backbone of wealth building. As an RIA, I always recommend starting with Nifty 50 + Nifty Next 50 for beginners. 👍" },
        { post_id: insertedPosts[0].id, author_id: sneha, content: "From a tax perspective, growth option in equity funds is more efficient than dividend option under the new regime. Happy to discuss!" },
        { post_id: insertedPosts[0].id, author_id: meera, content: "Passive investing is catching on in India. UTI Nifty 50 and Motilal Oswal S&P 500 are excellent choices for core portfolio allocation." },
      );

      // Comments on Priya's market commentary
      if (insertedPosts[2]) {
        comments.push(
          { post_id: insertedPosts[2].id, author_id: rajesh, content: "Very helpful analysis! I've been worried about FII selling. Good to know DII flows are strong." },
          { post_id: insertedPosts[2].id, author_id: arjun, content: "Agree on banking sector. Our banking & financial services fund has been outperforming benchmark consistently." },
          { post_id: insertedPosts[2].id, author_id: karan, content: "What's your view on IT sector for NRI investors looking at rupee depreciation benefit?" },
        );
      }

      // Comments on Vikram's announcement
      if (insertedPosts[6]) {
        comments.push(
          { post_id: insertedPosts[6].id, author_id: anita, content: "Congratulations! Bharatmala projects have been game-changers for infrastructure companies. Well deserved! 🎉" },
          { post_id: insertedPosts[6].id, author_id: rajesh, content: "Great news! I've been tracking Singh Infra. The order book growth is impressive." },
        );
      }

      // Comments on Arjun's NFO
      if (insertedPosts[7]) {
        comments.push(
          { post_id: insertedPosts[7].id, author_id: priya, content: "Innovation-focused fund is an interesting theme. Will review the SID for my clients. What's the expected expense ratio?" },
          { post_id: insertedPosts[7].id, author_id: karan, content: "Can NRIs invest in this NFO? Interested in the AI/Deeptech angle." },
        );
      }

      // Comments on Sneha's tax article
      if (insertedPosts[9]) {
        comments.push(
          { post_id: insertedPosts[9].id, author_id: karan, content: "The NRI taxation section is super helpful. The DTAA implications are often overlooked. Thank you!" },
          { post_id: insertedPosts[9].id, author_id: rajesh, content: "Shared this with my friends. Most retail investors don't understand the LTCG changes. Great explainer!" },
          { post_id: insertedPosts[9].id, author_id: anita, content: "Excellent article Sneha! We've been recommending similar strategies to our NBFC clients. Can we collaborate on a webinar?" },
        );
      }
    }

    for (const comment of comments) {
      await supabaseAdmin.from("comments").insert(comment);
    }

    // ===== INTERACTIONS (likes, bookmarks) =====
    const interactions = [];
    for (const post of insertedPosts) {
      // Each post gets random likes from other users
      const allUsers = [rajesh, priya, arjun, sneha, vikram, anita, karan, meera].filter(u => u && u !== post.author_id);
      const likeCount = Math.floor(Math.random() * allUsers.length) + 1;
      for (let i = 0; i < likeCount; i++) {
        interactions.push({ post_id: post.id, user_id: allUsers[i], interaction_type: "like" });
      }
      // Some bookmarks
      const bookmarkCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < bookmarkCount; i++) {
        interactions.push({ post_id: post.id, user_id: allUsers[i], interaction_type: "bookmark" });
      }
    }

    for (const interaction of interactions) {
      await supabaseAdmin.from("post_interactions").insert(interaction);
    }

    // ===== CONNECTIONS =====
    const connectionData = [
      // Rajesh follows/connects with advisers
      { from_user_id: rajesh, to_user_id: priya, connection_type: "connect", status: "accepted" },
      { from_user_id: rajesh, to_user_id: meera, connection_type: "follow", status: "accepted" },
      { from_user_id: rajesh, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: rajesh, to_user_id: arjun, connection_type: "follow", status: "accepted" },

      // Priya connects with other professionals
      { from_user_id: priya, to_user_id: sneha, connection_type: "connect", status: "accepted" },
      { from_user_id: priya, to_user_id: meera, connection_type: "connect", status: "accepted" },
      { from_user_id: priya, to_user_id: anita, connection_type: "connect", status: "accepted" },

      // Arjun (AMC) connects with intermediaries
      { from_user_id: arjun, to_user_id: priya, connection_type: "connect", status: "accepted" },
      { from_user_id: arjun, to_user_id: anita, connection_type: "connect", status: "accepted" },
      { from_user_id: arjun, to_user_id: sneha, connection_type: "follow", status: "accepted" },

      // Karan follows key accounts
      { from_user_id: karan, to_user_id: priya, connection_type: "connect", status: "pending" },
      { from_user_id: karan, to_user_id: sneha, connection_type: "follow", status: "accepted" },
      { from_user_id: karan, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: karan, to_user_id: arjun, connection_type: "follow", status: "accepted" },

      // Vikram connects with investors & intermediaries
      { from_user_id: vikram, to_user_id: anita, connection_type: "connect", status: "accepted" },
      { from_user_id: vikram, to_user_id: arjun, connection_type: "connect", status: "accepted" },

      // Anita connects broadly (triple-role entity)
      { from_user_id: anita, to_user_id: meera, connection_type: "connect", status: "accepted" },
      { from_user_id: anita, to_user_id: vikram, connection_type: "follow", status: "accepted" },

      // Meera connects with issuers she covers
      { from_user_id: meera, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: meera, to_user_id: arjun, connection_type: "connect", status: "accepted" },

      // Sneha follows entities
      { from_user_id: sneha, to_user_id: vikram, connection_type: "follow", status: "accepted" },
      { from_user_id: sneha, to_user_id: arjun, connection_type: "follow", status: "accepted" },
      { from_user_id: sneha, to_user_id: anita, connection_type: "connect", status: "pending" },
    ];

    let connectionsCreated = 0;
    for (const conn of connectionData) {
      const { error } = await supabaseAdmin.from("connections").insert(conn);
      if (!error) connectionsCreated++;
    }

    return new Response(JSON.stringify({
      success: true,
      posts_created: insertedPosts.length,
      comments_created: comments.length,
      interactions_created: interactions.length,
      connections_created: connectionsCreated,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
