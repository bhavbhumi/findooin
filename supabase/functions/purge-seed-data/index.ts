import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify admin role
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claims.claims.sub;
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    // Get seed user IDs
    const { data: seedIds } = await supabaseAdmin.rpc("get_seed_user_ids");
    const allUsers: string[] = seedIds || [];

    if (allUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, action, message: "No seed users found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list") {
      // Return seed user profiles
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, display_name, user_type")
        .in("id", allUsers);
      return new Response(
        JSON.stringify({ success: true, action: "list", seed_users: profiles, count: allUsers.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "purge") {
      const deleteCounts: Record<string, number> = {};
      const deleteFrom = async (table: string, column: string, ids: string[]) => {
        const { count } = await supabaseAdmin.from(table).delete({ count: "exact" }).in(column, ids);
        deleteCounts[table] = (deleteCounts[table] || 0) + (count || 0);
      };

      // 1. Reports
      await deleteFrom("reports", "reporter_id", allUsers);

      // 2. Notifications
      await deleteFrom("notifications", "user_id", allUsers);
      await deleteFrom("notifications", "actor_id", allUsers);

      // 3. Survey responses
      await deleteFrom("survey_responses", "user_id", allUsers);

      // 4. Listings cascade
      const { data: listings } = await supabaseAdmin.from("listings").select("id").in("user_id", allUsers);
      const listingIds = (listings || []).map((l: any) => l.id);
      if (listingIds.length) {
        await deleteFrom("listing_enquiries", "listing_id", listingIds);
        await deleteFrom("listing_reviews", "listing_id", listingIds);
        await deleteFrom("listings", "id", listingIds);
      }

      // 5. Endorsements
      await deleteFrom("endorsements", "endorser_id", allUsers);
      await deleteFrom("endorsements", "endorsed_user_id", allUsers);

      // 6. Featured posts
      await deleteFrom("featured_posts", "user_id", allUsers);

      // 7. Events cascade
      const { data: events } = await supabaseAdmin.from("events").select("id").in("organizer_id", allUsers);
      const eventIds = (events || []).map((e: any) => e.id);
      if (eventIds.length) {
        await deleteFrom("event_registrations", "event_id", eventIds);
        await deleteFrom("event_speakers", "event_id", eventIds);
        await deleteFrom("events", "id", eventIds);
      }
      // Also delete registrations BY seed users on non-seed events
      await deleteFrom("event_registrations", "user_id", allUsers);

      // 8. Jobs cascade
      await deleteFrom("saved_jobs", "user_id", allUsers);
      const { data: jobs } = await supabaseAdmin.from("jobs").select("id").in("poster_id", allUsers);
      const jobIds = (jobs || []).map((j: any) => j.id);
      if (jobIds.length) {
        await deleteFrom("job_applications", "job_id", jobIds);
        await deleteFrom("jobs", "id", jobIds);
      }
      // Also delete applications BY seed users on non-seed jobs
      await deleteFrom("job_applications", "applicant_id", allUsers);

      // 9. Profile views
      await deleteFrom("profile_views", "viewer_id", allUsers);
      await deleteFrom("profile_views", "profile_id", allUsers);

      // 10. Registry entities seeded
      await supabaseAdmin.from("registry_entities").delete().in("matched_user_id", allUsers);
      const { count: regCount } = await supabaseAdmin
        .from("registry_entities")
        .delete({ count: "exact" })
        .ilike("source_id", "seed%");
      deleteCounts["registry_entities"] = (deleteCounts["registry_entities"] || 0) + (regCount || 0);

      // 11. Posts cascade (polls, surveys, interactions, comments)
      const { data: posts } = await supabaseAdmin.from("posts").select("id").in("author_id", allUsers);
      const postIds = (posts || []).map((p: any) => p.id);
      if (postIds.length) {
        const { data: questions } = await supabaseAdmin.from("survey_questions").select("id").in("post_id", postIds);
        const qIds = (questions || []).map((q: any) => q.id);
        if (qIds.length) {
          await deleteFrom("survey_options", "question_id", qIds);
          await deleteFrom("survey_questions", "id", qIds);
        }
        const { data: pollOpts } = await supabaseAdmin.from("poll_options").select("id").in("post_id", postIds);
        const poIds = (pollOpts || []).map((o: any) => o.id);
        if (poIds.length) {
          await deleteFrom("poll_votes", "poll_option_id", poIds);
          await deleteFrom("poll_options", "id", poIds);
        }
        await deleteFrom("post_interactions", "post_id", postIds);
        await deleteFrom("comments", "post_id", postIds);
        await deleteFrom("posts", "id", postIds);
      }
      // Also delete comments BY seed users on non-seed posts
      await deleteFrom("comments", "author_id", allUsers);
      // Also delete interactions BY seed users
      await deleteFrom("post_interactions", "user_id", allUsers);

      // 12. Messages
      await deleteFrom("messages", "sender_id", allUsers);
      await deleteFrom("messages", "receiver_id", allUsers);

      // 13. Connections
      await deleteFrom("connections", "from_user_id", allUsers);
      await deleteFrom("connections", "to_user_id", allUsers);

      // 14. Blog posts (seeded ones — delete all since seed wipes them)
      // Only delete if body says includeBlog: true
      if (body.includeBlog) {
        const { count: blogCount } = await supabaseAdmin
          .from("blog_posts")
          .delete({ count: "exact" })
          .neq("id", "00000000-0000-0000-0000-000000000000");
        deleteCounts["blog_posts"] = blogCount || 0;
      }

      // 15. Active sessions
      await deleteFrom("active_sessions", "user_id", allUsers);

      // 16. Post drafts
      await deleteFrom("post_drafts", "user_id", allUsers);

      // 17. Card exchanges
      await deleteFrom("card_exchanges", "card_owner_id", allUsers);

      // 18. Affinity scores
      await deleteFrom("affinity_scores", "viewer_id", allUsers);
      await deleteFrom("affinity_scores", "target_id", allUsers);

      // 19. Intent signals
      await deleteFrom("intent_signals", "user_id", allUsers);

      // 20. Social proof events
      await deleteFrom("social_proof_events", "user_id", allUsers);

      // 21. Education & publications
      await deleteFrom("education", "user_id", allUsers);
      await deleteFrom("publications", "user_id", allUsers);

      // 22. Recommendations
      await deleteFrom("recommendations", "author_id", allUsers);
      await deleteFrom("recommendations", "recipient_id", allUsers);

      // 23. Profile flair & tab privacy
      await deleteFrom("profile_flair", "user_id", allUsers);
      await deleteFrom("profile_tab_privacy", "user_id", allUsers);

      // 24. Introductions
      await deleteFrom("introductions", "introducer_id", allUsers);

      // 25. Delete user_roles
      const { count: rolesCount } = await supabaseAdmin
        .from("user_roles")
        .delete({ count: "exact" })
        .in("user_id", allUsers);
      deleteCounts["user_roles"] = rolesCount || 0;

      // 26. Delete profiles
      await deleteFrom("profiles", "id", allUsers);

      // 27. Delete auth users
      let authDeleted = 0;
      for (const uid of allUsers) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
        if (!error) authDeleted++;
      }
      deleteCounts["auth_users"] = authDeleted;

      // Audit log
      await supabaseAdmin.from("audit_logs").insert({
        user_id: callerId,
        action: "purge_seed_data",
        resource_type: "platform",
        metadata: { delete_counts: deleteCounts, seed_user_count: allUsers.length },
      });

      return new Response(
        JSON.stringify({
          success: true,
          action: "purge",
          seed_users_purged: allUsers.length,
          delete_counts: deleteCounts,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'list' or 'purge'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Purge seed error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
