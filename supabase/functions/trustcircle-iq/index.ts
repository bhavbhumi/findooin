/**
 * TrustCircle IQ™ — Edge Function API Layer
 * 
 * Hybrid approach: Calls the DB scoring function, caches results in affinity_scores,
 * returns paginated results with profile data.
 */
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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the user via fast JWT claims check
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = { id: claimsData.claims.sub as string };

    const url = new URL(req.url);
    const circle = url.searchParams.get("circle"); // '1', '2', '3', or null for all
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "60"), 100);
    const forceRefresh = url.searchParams.get("refresh") === "true";

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache freshness (1 hour)
    const cacheWindow = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    let useCache = false;
    if (!forceRefresh) {
      const { count } = await adminClient
        .from("affinity_scores")
        .select("id", { count: "exact", head: true })
        .eq("viewer_id", user.id)
        .gte("computed_at", cacheWindow);
      useCache = (count || 0) > 0;
    }

    if (!useCache) {
      // Compute fresh scores via DB function
      const { data: scores, error: scoreError } = await adminClient.rpc(
        "compute_trustcircle_iq",
        { p_viewer_id: user.id, p_limit: limit }
      );

      if (scoreError) {
        console.error("Scoring error:", scoreError);
        return new Response(JSON.stringify({ error: "Scoring failed", details: scoreError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (scores && scores.length > 0) {
        // Clear old scores for this viewer
        await adminClient
          .from("affinity_scores")
          .delete()
          .eq("viewer_id", user.id);

        // Upsert new scores
        const rows = scores.map((s: any) => ({
          viewer_id: user.id,
          target_id: s.target_id,
          affinity_score: s.affinity_score,
          circle_tier: s.circle_tier,
          role_weight: s.role_weight,
          intent_multiplier: s.intent_multiplier,
          trust_proximity: s.trust_proximity,
          activity_resonance: s.activity_resonance,
          freshness_decay: s.freshness_decay,
          referral_boost: s.referral_boost,
          referral_source: s.referral_source,
          computed_at: new Date().toISOString(),
        }));

        await adminClient.from("affinity_scores").upsert(rows, {
          onConflict: "viewer_id,target_id",
        });
      }
    }

    // Fetch cached results with profile data
    let query = adminClient
      .from("affinity_scores")
      .select("target_id, affinity_score, circle_tier, role_weight, intent_multiplier, trust_proximity, activity_resonance, freshness_decay, referral_boost, referral_source")
      .eq("viewer_id", user.id)
      .order("circle_tier", { ascending: true })
      .order("affinity_score", { ascending: false });

    if (circle) {
      query = query.eq("circle_tier", parseInt(circle));
    }

    const { data: cachedScores, error: fetchError } = await query.limit(limit);

    if (fetchError) {
      return new Response(JSON.stringify({ error: "Fetch failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enrich with profile data
    const targetIds = (cachedScores || []).map((s: any) => s.target_id);
    
    let profiles: any[] = [];
    let roles: any[] = [];
    
    if (targetIds.length > 0) {
      const [profilesRes, rolesRes] = await Promise.all([
        adminClient
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, headline, organization, location, verification_status, specializations, certifications, user_type")
          .in("id", targetIds),
        adminClient
          .from("user_roles")
          .select("user_id, role, sub_type")
          .in("user_id", targetIds),
      ]);
      profiles = profilesRes.data || [];
      roles = rolesRes.data || [];
    }

    const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
    const roleMap = new Map<string, any[]>();
    roles.forEach((r: any) => {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
      roleMap.get(r.user_id)!.push({ role: r.role, sub_type: r.sub_type });
    });

    const results = (cachedScores || []).map((score: any) => ({
      ...score,
      profile: profileMap.get(score.target_id) || null,
      roles: roleMap.get(score.target_id) || [],
    })).filter((r: any) => r.profile !== null);

    // Group by 5 circles
    const grouped = {
      inner_circle: results.filter((r: any) => r.circle_tier === 1),
      primary_network: results.filter((r: any) => r.circle_tier === 2),
      secondary_network: results.filter((r: any) => r.circle_tier === 3),
      tertiary_network: results.filter((r: any) => r.circle_tier === 4),
      ecosystem: results.filter((r: any) => r.circle_tier === 5),
      total: results.length,
      cached: useCache,
    };

    return new Response(JSON.stringify(grouped), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("TrustCircle IQ error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
