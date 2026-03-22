import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role for aggregation queries
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const signal = AbortSignal.timeout(8000);

    // Parallel queries for all stats
    const [
      profileRes,
      postsRes,
      connectionsRes,
      likesReceivedRes,
      commentsReceivedRes,
      eventsRes,
      jobAppsRes,
      listingsRes,
      xpRes,
      endorsementsRes,
      viewsRes,
      rolesRes,
      totalUsersRes,
    ] = await Promise.all([
      admin.from("profiles").select("full_name, display_name, avatar_url, verification_status, created_at").eq("id", userId).single().abortSignal(signal),
      admin.from("posts").select("id, created_at, hashtags, post_type").eq("author_id", userId).abortSignal(signal),
      admin.from("connections").select("id, status, connection_type").or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`).eq("status", "accepted").abortSignal(signal),
      admin.from("post_interactions").select("id, post_id").eq("interaction_type", "like").in("post_id", (await admin.from("posts").select("id").eq("author_id", userId).abortSignal(signal)).data?.map(p => p.id) || []).abortSignal(signal),
      admin.from("comments").select("id").in("post_id", (await admin.from("posts").select("id").eq("author_id", userId).abortSignal(signal)).data?.map(p => p.id) || []).abortSignal(signal),
      admin.from("event_registrations").select("id").eq("user_id", userId).abortSignal(signal),
      admin.from("job_applications").select("id").eq("applicant_id", userId).abortSignal(signal),
      admin.from("listings").select("id, view_count, enquiry_count").eq("user_id", userId).abortSignal(signal),
      admin.from("user_xp").select("total_xp, level, current_streak, longest_streak").eq("user_id", userId).single().abortSignal(signal),
      admin.from("endorsements").select("id, skill").eq("endorsed_user_id", userId).abortSignal(signal),
      admin.from("profile_views").select("id").eq("profile_id", userId).abortSignal(signal),
      admin.from("user_roles").select("role, sub_type").eq("user_id", userId).abortSignal(signal),
      admin.from("profiles").select("id", { count: "exact", head: true }).abortSignal(signal),
    ]);

    const profile = profileRes.data;
    const posts = postsRes.data || [];
    const connections = connectionsRes.data || [];
    const likesReceived = likesReceivedRes.data || [];
    const commentsReceived = commentsReceivedRes.data || [];
    const events = eventsRes.data || [];
    const jobApps = jobAppsRes.data || [];
    const listings = listingsRes.data || [];
    const xp = xpRes.data;
    const endorsements = endorsementsRes.data || [];
    const views = viewsRes.data || [];
    const roles = rolesRes.data || [];
    const totalUsers = totalUsersRes.count || 1;

    // Compute top hashtags
    const hashtagCounts: Record<string, number> = {};
    for (const post of posts) {
      if (post.hashtags) {
        for (const tag of post.hashtags as string[]) {
          const normalized = tag.startsWith("#") ? tag : `#${tag}`;
          hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
        }
      }
    }
    const topHashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Compute post type breakdown
    const postTypeCounts: Record<string, number> = {};
    for (const post of posts) {
      const t = (post.post_type as string) || "text";
      postTypeCounts[t] = (postTypeCounts[t] || 0) + 1;
    }

    // Top endorsed skill
    const skillCounts: Record<string, number> = {};
    for (const e of endorsements) {
      skillCounts[e.skill] = (skillCounts[e.skill] || 0) + 1;
    }
    const topSkill = Object.entries(skillCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Listing views total
    const totalListingViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
    const totalEnquiries = listings.reduce((sum, l) => sum + (l.enquiry_count || 0), 0);

    // XP percentile estimate
    const { count: usersAbove } = await admin
      .from("user_xp")
      .select("id", { count: "exact", head: true })
      .gt("total_xp", xp?.total_xp || 0)
      .abortSignal(signal);

    const xpPercentile = totalUsers > 0
      ? Math.max(1, Math.round(100 - ((usersAbove || 0) / totalUsers) * 100))
      : 50;

    const wrapped = {
      profile: {
        name: profile?.display_name || profile?.full_name || "User",
        avatar_url: profile?.avatar_url,
        verified: profile?.verification_status === "verified",
        joined: profile?.created_at,
      },
      roles: roles.map(r => r.role),
      stats: {
        posts_count: posts.length,
        connections_count: connections.length,
        likes_received: likesReceived.length,
        comments_received: commentsReceived.length,
        profile_views: views.length,
        events_attended: events.length,
        job_applications: jobApps.length,
        listings_count: listings.length,
        listing_views: totalListingViews,
        listing_enquiries: totalEnquiries,
        endorsements_count: endorsements.length,
      },
      gamification: {
        total_xp: xp?.total_xp || 0,
        level: xp?.level || 1,
        current_streak: xp?.current_streak || 0,
        longest_streak: xp?.longest_streak || 0,
        xp_percentile: xpPercentile,
      },
      highlights: {
        top_hashtags: topHashtags,
        top_skill: topSkill,
        post_types: postTypeCounts,
      },
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(wrapped), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Wrapped error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
