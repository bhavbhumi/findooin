import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAMPLE_USERS = [
  {
    email: "rajesh.kumar@findoo.test",
    password: "Test@1234",
    full_name: "Rajesh Kumar",
    user_type: "individual" as const,
    bio: "Retail investor passionate about mutual funds and equity markets",
    roles: [{ role: "investor", sub_type: "Retail Individual" }],
    verification_status: "verified",
    onboarding_completed: true,
  },
  {
    email: "priya.sharma@findoo.test",
    password: "Test@1234",
    full_name: "Priya Sharma",
    user_type: "individual" as const,
    bio: "SEBI Registered Investment Adviser & active equity investor",
    roles: [
      { role: "intermediary", sub_type: "RIA" },
      { role: "investor", sub_type: "HNI" },
    ],
    verification_status: "verified",
    onboarding_completed: true,
  },
  {
    email: "arjun.mehta@findoo.test",
    password: "Test@1234",
    full_name: "Arjun Mehta",
    user_type: "entity" as const,
    bio: "Leading AMC with ₹50,000 Cr+ AUM across equity, debt, and hybrid funds",
    display_name: "Bluechip Capital AMC",
    roles: [
      { role: "issuer", sub_type: "AMC" },
      { role: "investor", sub_type: "Institutional" },
    ],
    verification_status: "verified",
    onboarding_completed: true,
  },
  {
    email: "sneha.patel@findoo.test",
    password: "Test@1234",
    full_name: "Sneha Patel",
    user_type: "individual" as const,
    bio: "Chartered Accountant specializing in tax-efficient investment strategies",
    roles: [{ role: "intermediary", sub_type: "CA/CS" }],
    verification_status: "pending",
    onboarding_completed: true,
  },
  {
    email: "vikram.singh@findoo.test",
    password: "Test@1234",
    full_name: "Vikram Singh",
    user_type: "entity" as const,
    bio: "BSE & NSE listed infrastructure company. Building India's future.",
    display_name: "Singh Infrastructure Ltd",
    roles: [{ role: "issuer", sub_type: "Listed Company" }],
    verification_status: "verified",
    onboarding_completed: true,
  },
  {
    email: "anita.desai@findoo.test",
    password: "Test@1234",
    full_name: "Anita Desai",
    user_type: "entity" as const,
    bio: "Full-service NBFC and mutual fund distribution house",
    display_name: "Desai Financial Services",
    roles: [
      { role: "issuer", sub_type: "NBFC" },
      { role: "intermediary", sub_type: "MF Distributor" },
      { role: "investor", sub_type: "Institutional" },
    ],
    verification_status: "verified",
    onboarding_completed: true,
  },
  {
    email: "karan.joshi@findoo.test",
    password: "Test@1234",
    full_name: "Karan Joshi",
    user_type: "individual" as const,
    bio: "NRI investor focused on Indian real estate and equity markets",
    roles: [{ role: "investor", sub_type: "NRI" }],
    verification_status: "unverified",
    onboarding_completed: true,
  },
  {
    email: "meera.reddy@findoo.test",
    password: "Test@1234",
    full_name: "Meera Reddy",
    user_type: "individual" as const,
    bio: "SEBI-registered Research Analyst covering pharma and IT sectors",
    roles: [
      { role: "intermediary", sub_type: "Research Analyst" },
      { role: "investor", sub_type: "Retail Individual" },
    ],
    verification_status: "verified",
    onboarding_completed: true,
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const user of SAMPLE_USERS) {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name },
      });

      if (authError) {
        results.push({ email: user.email, status: "skipped", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Update profile
      await supabaseAdmin.from("profiles").update({
        user_type: user.user_type,
        bio: user.bio,
        display_name: user.display_name || user.full_name,
        verification_status: user.verification_status,
        onboarding_completed: user.onboarding_completed,
      }).eq("id", userId);

      // Insert roles
      for (const r of user.roles) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: userId,
          role: r.role,
          sub_type: r.sub_type,
        });
      }

      results.push({ email: user.email, status: "created", roles: user.roles.map(r => r.role) });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
