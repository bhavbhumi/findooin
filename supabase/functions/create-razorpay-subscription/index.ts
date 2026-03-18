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

    // Get Razorpay keys
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay not configured. Please add API keys." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan_id } = await req.json();
    if (!plan_id) {
      return new Response(JSON.stringify({ error: "plan_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for writes
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch plan
    const { data: plan, error: planError } = await serviceClient
      .from("subscription_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("status", "active")
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing active subscription
    const { data: existing } = await serviceClient
      .from("user_subscriptions")
      .select("id, razorpay_subscription_id")
      .eq("user_id", userId)
      .in("status", ["active", "trialing", "past_due", "paused"])
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "You already have an active subscription. Please manage it from settings." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Free plan — just insert directly
    if (plan.tier === "free") {
      const { data: sub, error: subErr } = await serviceClient
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          status: "active",
          billing_interval: plan.billing_interval,
          current_period_start: new Date().toISOString(),
        })
        .select()
        .single();

      if (subErr) throw subErr;

      await serviceClient.from("subscription_events").insert({
        user_id: userId,
        subscription_id: sub.id,
        event_type: "subscribed",
        to_plan_id: plan.id,
        metadata: { tier: plan.tier },
      });

      return new Response(JSON.stringify({ success: true, subscription: sub }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email for Razorpay customer
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("full_name, display_name")
      .eq("id", userId)
      .single();

    const { data: { user } } = await supabase.auth.getUser(token);
    const email = user?.email || "";
    const name = profile?.display_name || profile?.full_name || "User";

    // Create or fetch Razorpay customer
    const authString = btoa(`${keyId}:${keySecret}`);

    // Check if plan has a Razorpay plan ID, if not create one
    let razorpayPlanId = plan.razorpay_plan_id;
    if (!razorpayPlanId) {
      const period = plan.billing_interval === "annual" ? "yearly" : "monthly";
      const rpPlanRes = await fetch(`${RAZORPAY_BASE}/plans`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          period,
          interval: 1,
          item: {
            name: plan.name,
            amount: plan.price_amount,
            currency: plan.price_currency,
            description: plan.description || plan.name,
          },
        }),
      });

      const rpPlan = await rpPlanRes.json();
      if (!rpPlanRes.ok) {
        throw new Error(`Razorpay plan creation failed [${rpPlanRes.status}]: ${JSON.stringify(rpPlan)}`);
      }

      razorpayPlanId = rpPlan.id;

      // Store the Razorpay plan ID
      await serviceClient
        .from("subscription_plans")
        .update({ razorpay_plan_id: razorpayPlanId })
        .eq("id", plan.id);
    }

    // Create Razorpay subscription
    const subPayload: Record<string, unknown> = {
      plan_id: razorpayPlanId,
      total_count: plan.billing_interval === "annual" ? 10 : 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: userId,
        plan_slug: plan.slug,
        internal_plan_id: plan.id,
      },
    };

    // Add trial if applicable
    if (plan.trial_days > 0) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + plan.trial_days);
      subPayload.start_at = Math.floor(trialEnd.getTime() / 1000);
    }

    const rpSubRes = await fetch(`${RAZORPAY_BASE}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subPayload),
    });

    const rpSub = await rpSubRes.json();
    if (!rpSubRes.ok) {
      throw new Error(`Razorpay subscription creation failed [${rpSubRes.status}]: ${JSON.stringify(rpSub)}`);
    }

    // Insert local subscription record
    const now = new Date().toISOString();
    const trialEndsAt = plan.trial_days > 0
      ? new Date(Date.now() + plan.trial_days * 86_400_000).toISOString()
      : null;

    const { data: localSub, error: localSubErr } = await serviceClient
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        status: plan.trial_days > 0 ? "trialing" : "active",
        billing_interval: plan.billing_interval,
        trial_starts_at: plan.trial_days > 0 ? now : null,
        trial_ends_at: trialEndsAt,
        current_period_start: now,
        razorpay_subscription_id: rpSub.id,
        razorpay_customer_id: rpSub.customer_id || null,
      })
      .select()
      .single();

    if (localSubErr) throw localSubErr;

    // Audit event
    await serviceClient.from("subscription_events").insert({
      user_id: userId,
      subscription_id: localSub.id,
      event_type: plan.trial_days > 0 ? "trial_started" : "subscribed",
      to_plan_id: plan.id,
      metadata: {
        razorpay_subscription_id: rpSub.id,
        tier: plan.tier,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: rpSub.id,
        short_url: rpSub.short_url,
        key_id: keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating subscription:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
