import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const maskRegulatoryIds = (raw: unknown): Record<string, string> | null => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const masked = Object.entries(raw as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value !== "string") return acc;
    const trimmed = value.trim();
    if (!trimmed) return acc;
    acc[key] = `${trimmed.slice(0, 4)}••••`;
    return acc;
  }, {});

  return Object.keys(masked).length ? masked : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const rawUserId = String((body as { userId?: string })?.userId ?? url.searchParams.get("userId") ?? "").trim();

    if (!UUID_REGEX.test(rawUserId)) {
      return new Response(JSON.stringify({ error: "Invalid user ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const [profileRes, rolesRes] = await Promise.all([
      admin
        .from("profiles")
        .select("id, full_name, display_name, designation, organization, headline, location, website, avatar_url, verification_status, user_type, social_links, specializations, certifications, regulatory_ids, digital_card_fields")
        .eq("id", rawUserId)
        .maybeSingle(),
      admin
        .from("user_roles")
        .select("role, sub_type")
        .eq("user_id", rawUserId),
    ]);

    if (profileRes.error) {
      console.error("[get-public-digital-card] profile query failed:", profileRes.error);
      return new Response(JSON.stringify({ error: "Failed to fetch profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profileRes.data) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rolesRes.error) {
      console.error("[get-public-digital-card] roles query failed:", rolesRes.error);
      return new Response(JSON.stringify({ error: "Failed to fetch roles" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile = {
      ...profileRes.data,
      regulatory_ids: maskRegulatoryIds(profileRes.data.regulatory_ids),
    };

    return new Response(JSON.stringify({
      profile,
      roles: rolesRes.data ?? [],
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[get-public-digital-card] unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
