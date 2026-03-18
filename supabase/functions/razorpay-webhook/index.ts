import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.224.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(`Processing webhook event: ${eventType}`);

    switch (eventType) {
      case "subscription.authenticated":
      case "subscription.activated": {
        const rpSubId = payload.subscription?.entity?.id;
        if (!rpSubId) break;

        const { data: sub } = await serviceClient
          .from("user_subscriptions")
          .select("id, user_id, plan_id")
          .eq("razorpay_subscription_id", rpSubId)
          .maybeSingle();

        if (sub) {
          const now = new Date().toISOString();
          await serviceClient
            .from("user_subscriptions")
            .update({
              status: "active",
              current_period_start: now,
            })
            .eq("id", sub.id);

          await serviceClient.from("subscription_events").insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            event_type: "activated",
            to_plan_id: sub.plan_id,
            metadata: { razorpay_event: eventType },
          });
        }
        break;
      }

      case "subscription.charged": {
        const rpSubId = payload.subscription?.entity?.id;
        const payment = payload.payment?.entity;
        if (!rpSubId || !payment) break;

        const { data: sub } = await serviceClient
          .from("user_subscriptions")
          .select("id, user_id, plan_id")
          .eq("razorpay_subscription_id", rpSubId)
          .maybeSingle();

        if (sub) {
          // Update subscription period
          const periodStart = new Date().toISOString();
          const rpSub = payload.subscription?.entity;
          const periodEnd = rpSub?.current_end
            ? new Date(rpSub.current_end * 1000).toISOString()
            : null;

          await serviceClient
            .from("user_subscriptions")
            .update({
              status: "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
            })
            .eq("id", sub.id);

          // Record payment
          await serviceClient.from("payment_history").insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            amount: payment.amount || 0,
            currency: payment.currency || "INR",
            status: "captured",
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            razorpay_invoice_id: payload.invoice?.entity?.id || null,
            payment_method: payment.method || "unknown",
            description: `Subscription payment for ${rpSubId}`,
          });

          await serviceClient.from("subscription_events").insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            event_type: "payment_success",
            to_plan_id: sub.plan_id,
            metadata: {
              razorpay_payment_id: payment.id,
              amount: payment.amount,
            },
          });
        }
        break;
      }

      case "subscription.pending": {
        const rpSubId = payload.subscription?.entity?.id;
        if (!rpSubId) break;

        await serviceClient
          .from("user_subscriptions")
          .update({ status: "past_due" })
          .eq("razorpay_subscription_id", rpSubId);
        break;
      }

      case "subscription.halted":
      case "subscription.cancelled": {
        const rpSubId = payload.subscription?.entity?.id;
        if (!rpSubId) break;

        const { data: sub } = await serviceClient
          .from("user_subscriptions")
          .select("id, user_id, plan_id")
          .eq("razorpay_subscription_id", rpSubId)
          .maybeSingle();

        if (sub) {
          await serviceClient
            .from("user_subscriptions")
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
            })
            .eq("id", sub.id);

          await serviceClient.from("subscription_events").insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            event_type: eventType === "subscription.halted" ? "halted" : "cancelled",
            from_plan_id: sub.plan_id,
            metadata: { razorpay_event: eventType },
          });
        }
        break;
      }

      case "subscription.paused": {
        const rpSubId = payload.subscription?.entity?.id;
        if (!rpSubId) break;

        await serviceClient
          .from("user_subscriptions")
          .update({ status: "paused" })
          .eq("razorpay_subscription_id", rpSubId);
        break;
      }

      case "subscription.resumed": {
        const rpSubId = payload.subscription?.entity?.id;
        if (!rpSubId) break;

        await serviceClient
          .from("user_subscriptions")
          .update({ status: "active" })
          .eq("razorpay_subscription_id", rpSubId);
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        // Try to find subscription by notes
        const rpSubId = payment.subscription_id;
        if (rpSubId) {
          const { data: sub } = await serviceClient
            .from("user_subscriptions")
            .select("id, user_id")
            .eq("razorpay_subscription_id", rpSubId)
            .maybeSingle();

          if (sub) {
            await serviceClient.from("payment_history").insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              amount: payment.amount || 0,
              currency: payment.currency || "INR",
              status: "failed",
              razorpay_payment_id: payment.id,
              payment_method: payment.method || "unknown",
              description: `Failed payment: ${payment.error_description || "Unknown reason"}`,
              metadata: {
                error_code: payment.error_code,
                error_description: payment.error_description,
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
