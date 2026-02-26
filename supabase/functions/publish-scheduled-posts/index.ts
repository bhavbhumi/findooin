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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find posts where scheduled_at <= now and not yet published (scheduled_at is set)
    const now = new Date().toISOString();

    const { data: scheduledPosts, error: fetchError } = await supabase
      .from("posts")
      .select("id, scheduled_at")
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No scheduled posts to publish", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Clear scheduled_at to mark as published
    const ids = scheduledPosts.map((p) => p.id);
    const { error: updateError } = await supabase
      .from("posts")
      .update({ scheduled_at: null })
      .in("id", ids);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: "Published scheduled posts", count: ids.length, ids }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
