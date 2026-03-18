import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, new_plan_id, cancel_at_period_end } = await req.json();

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get current subscription
    const { data: currentSub, error: subError } = await serviceClient
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due", "paused"])
      .maybeSingle();

    if (subError) throw subError;

    const authString = btoa(`${keyId}:${keySecret}`);

    switch (action) {
      case "upgrade":
      case "downgrade": {
        if (!new_plan_id) {
          return new Response(JSON.stringify({ error: "new_plan_id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch new plan
        const { data: newPlan } = await serviceClient
          .from("subscription_plans")
          .select("*")
          .eq("id", new_plan_id)
          .eq("status", "active")
          .single();

        if (!newPlan) {
          return new Response(JSON.stringify({ error: "Plan not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // If user has no subscription, redirect to create
        if (!currentSub) {
          return new Response(
            JSON.stringify({ error: "No active subscription. Please subscribe first.", redirect: "subscribe" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Cancel current Razorpay subscription
        if (currentSub.razorpay_subscription_id) {
          const cancelRes = await fetch(
            `${RAZORPAY_BASE}/subscriptions/${currentSub.razorpay_subscription_id}/cancel`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cancel_at_cycle_end: 0 }),
            }
          );
          const cancelData = await cancelRes.json();
          if (!cancelRes.ok) {
            console.error("Failed to cancel old subscription:", cancelData);
          }
        }

        // Mark old subscription as cancelled
        const oldPlanId = currentSub.plan_id;
        await serviceClient
          .from("user_subscriptions")
          .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
          .eq("id", currentSub.id);

        // Log the change event
        await serviceClient.from("subscription_events").insert({
          user_id: userId,
          subscription_id: currentSub.id,
          event_type: action,
          from_plan_id: oldPlanId,
          to_plan_id: new_plan_id,
          metadata: { action },
        });

        // Return instruction to create new subscription
        return new Response(
          JSON.stringify({
            success: true,
            action,
            message: `Old plan cancelled. Create new subscription with plan_id: ${new_plan_id}`,
            next_step: "create_subscription",
            new_plan_id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        if (!currentSub) {
          return new Response(JSON.stringify({ error: "No active subscription" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const cancelAtEnd = cancel_at_period_end !== false;

        if (currentSub.razorpay_subscription_id) {
          const cancelRes = await fetch(
            `${RAZORPAY_BASE}/subscriptions/${currentSub.razorpay_subscription_id}/cancel`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                cancel_at_cycle_end: cancelAtEnd ? 1 : 0,
              }),
            }
          );
          const cancelData = await cancelRes.json();
          if (!cancelRes.ok) {
            throw new Error(`Razorpay cancel failed [${cancelRes.status}]: ${JSON.stringify(cancelData)}`);
          }
        }

        if (cancelAtEnd) {
          await serviceClient
            .from("user_subscriptions")
            .update({ cancel_at_period_end: true })
            .eq("id", currentSub.id);
        } else {
          await serviceClient
            .from("user_subscriptions")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
            .eq("id", currentSub.id);
        }

        await serviceClient.from("subscription_events").insert({
          user_id: userId,
          subscription_id: currentSub.id,
          event_type: cancelAtEnd ? "cancel_scheduled" : "cancelled",
          from_plan_id: currentSub.plan_id,
          metadata: { cancel_at_period_end: cancelAtEnd },
        });

        return new Response(
          JSON.stringify({
            success: true,
            cancel_at_period_end: cancelAtEnd,
            message: cancelAtEnd
              ? "Subscription will be cancelled at the end of the current billing period."
              : "Subscription cancelled immediately.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reactivate": {
        if (!currentSub || currentSub.status !== "cancelled") {
          return new Response(JSON.stringify({ error: "No cancelled subscription to reactivate" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // For cancel_at_period_end, just remove the flag
        if (currentSub.cancel_at_period_end) {
          await serviceClient
            .from("user_subscriptions")
            .update({ cancel_at_period_end: false, cancelled_at: null })
            .eq("id", currentSub.id);

          return new Response(
            JSON.stringify({ success: true, message: "Subscription reactivated." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "Subscription is fully cancelled. Please create a new subscription." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: upgrade, downgrade, cancel, reactivate" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("Manage subscription error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
