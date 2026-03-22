/**
 * ai-compose — AI-powered post composition for Intermediaries & Issuers.
 * 
 * Modes:
 * - "draft": Generate a post draft from a topic/prompt
 * - "repurpose": Convert pasted content (article, report) into a social post
 * - "auto_suggest": Generate multiple scheduled post ideas for a week
 * 
 * Gated to Enterprise add-on subscribers only (checked client-side via plan tier).
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  draft: `You are a professional content writer for findoo, India's trusted professional network for the financial services industry. 
Generate a compelling social media post based on the user's topic/prompt.

Rules:
- Write in a professional but engaging tone suitable for financial professionals
- Keep it under 2000 characters
- Include 2-3 relevant hashtags at the end
- Use the specified tone if provided (formal, conversational, thought-leadership, educational)
- DO NOT include any disclaimers or legal text — the platform handles that
- Output ONLY the post content, no meta-commentary`,

  repurpose: `You are a content strategist for findoo, India's trusted professional network for financial services.
Convert the provided content (article, report, research note, etc.) into a concise, engaging social media post.

Rules:
- Distill the key insight or takeaway into 1-3 paragraphs
- Make it conversational and suitable for a professional feed
- Add 2-3 relevant hashtags
- Keep under 2000 characters
- Preserve attribution if the source is mentioned
- Use the specified tone if provided
- Output ONLY the post content, no meta-commentary`,

  auto_suggest: `You are a content calendar strategist for findoo, India's professional financial services network.
Generate 5 post ideas for the coming week based on the user's role, expertise, and topics of interest.

For each post, provide:
1. A suggested day (Monday-Friday)
2. The post content (under 1500 characters)
3. 2-3 hashtags
4. The recommended post category (market_commentary, research_note, announcement, article, or text)

Format your response as a JSON array with objects containing: day, content, hashtags (array), category.
Output ONLY valid JSON, no markdown fences or commentary.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, prompt, tone, role, source_content } = await req.json();

    if (!mode || !SYSTEM_PROMPTS[mode]) {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use: draft, repurpose, or auto_suggest" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userMessage = "";
    switch (mode) {
      case "draft":
        userMessage = `Topic: ${prompt || "general market insight"}`;
        if (tone) userMessage += `\nTone: ${tone}`;
        if (role) userMessage += `\nMy role: ${role}`;
        break;
      case "repurpose":
        userMessage = `Convert this content into a social post:\n\n${source_content || prompt}`;
        if (tone) userMessage += `\n\nTone: ${tone}`;
        break;
      case "auto_suggest":
        userMessage = `My role: ${role || "intermediary"}\nTopics I cover: ${prompt || "market analysis, investment strategies"}`;
        if (tone) userMessage += `\nPreferred tone: ${tone}`;
        break;
    }

    const isStreaming = mode !== "auto_suggest";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[mode] },
          { role: "user", content: userMessage },
        ],
        stream: isStreaming,
        ...(mode === "auto_suggest" ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isStreaming) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming (auto_suggest) — return JSON
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    return new Response(
      JSON.stringify({ suggestions: content }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ai-compose error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
