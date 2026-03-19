import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Delete user data from all tables in order (respecting FK constraints)
    const tables = [
      { table: "xp_transactions", column: "user_id" },
      { table: "user_challenge_progress", column: "user_id" },
      { table: "user_badges", column: "user_id" },
      { table: "social_proof_events", column: "user_id" },
      { table: "referral_conversions", column: "referred_user_id" },
      { table: "referral_conversions", column: "referrer_id" },
      { table: "user_xp", column: "user_id" },
      { table: "profile_flair", column: "user_id" },
      { table: "profile_tab_privacy", column: "user_id" },
      { table: "profile_views", column: "viewer_id" },
      { table: "profile_views", column: "profile_id" },
      { table: "featured_posts", column: "user_id" },
      { table: "post_interactions", column: "user_id" },
      { table: "poll_votes", column: "user_id" },
      { table: "comments", column: "author_id" },
      { table: "posts", column: "author_id" },
      { table: "post_drafts", column: "user_id" },
      { table: "opinion_votes", column: "user_id" },
      { table: "opinion_comments", column: "author_id" },
      { table: "opinion_interactions", column: "user_id" },
      { table: "blog_poll_votes", column: "user_id" },
      { table: "blog_survey_responses", column: "user_id" },
      { table: "listing_reviews", column: "reviewer_id" },
      { table: "listing_enquiries", column: "enquirer_id" },
      { table: "listings", column: "user_id" },
      { table: "job_applications", column: "applicant_id" },
      { table: "jobs", column: "poster_id" },
      { table: "event_registrations", column: "user_id" },
      { table: "events", column: "organizer_id" },
      { table: "card_exchanges", column: "card_owner_id" },
      { table: "endorsements", column: "endorsed_user_id" },
      { table: "endorsements", column: "endorser_id" },
      { table: "recommendations", column: "author_id" },
      { table: "recommendations", column: "recipient_id" },
      { table: "publications", column: "user_id" },
      { table: "education", column: "user_id" },
      { table: "connections", column: "from_user_id" },
      { table: "connections", column: "to_user_id" },
      { table: "messages", column: "sender_id" },
      { table: "messages", column: "receiver_id" },
      { table: "notifications", column: "user_id" },
      { table: "user_contacts", column: "user_id" },
      { table: "intent_signals", column: "user_id" },
      { table: "affinity_scores", column: "viewer_id" },
      { table: "affinity_scores", column: "target_id" },
      { table: "file_uploads", column: "user_id" },
      { table: "active_sessions", column: "user_id" },
      { table: "user_settings", column: "user_id" },
      { table: "support_tickets", column: "user_id" },
      { table: "reports", column: "reporter_id" },
      { table: "user_roles", column: "user_id" },
      { table: "staff_permissions", column: "user_id" },
      { table: "invitations", column: "created_by" },
      { table: "audit_logs", column: "user_id" },
      { table: "user_subscriptions", column: "user_id" },
      { table: "payment_history", column: "user_id" },
      { table: "profiles", column: "id" },
    ];

    const errors: string[] = [];

    for (const { table, column } of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq(column, userId);
      if (error) {
        // Log but continue — some tables may not exist or have cascades
        errors.push(`${table}.${column}: ${error.message}`);
      }
    }

    // Finally, delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      return new Response(
        JSON.stringify({ error: "Failed to delete auth account", details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, warnings: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
