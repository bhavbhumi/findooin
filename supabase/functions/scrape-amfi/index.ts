import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * AMFI's new website (Next.js + Strapi) uses an internal API.
 * We attempt multiple known endpoint patterns.
 * The API accepts search by ARN name or city via query params.
 */
const AMFI_API_PATTERNS = [
  // Pattern 1: Strapi-style content API
  (city: string) =>
    `https://www.amfiindia.com/api/locate-distributor/find?type=All&city=${encodeURIComponent(city)}`,
  // Pattern 2: Next.js API route
  (city: string) =>
    `https://www.amfiindia.com/api/locate-distributor?type=All&nfaCity=${encodeURIComponent(city)}`,
  // Pattern 3: Legacy form post (may still work for some deployments)
  null, // handled separately as POST
];

// Major Indian cities
const DEFAULT_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Pune", "Jaipur", "Lucknow", "Surat", "Kanpur",
  "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Vadodara",
  "Coimbatore", "Ludhiana", "Agra", "Nashik", "Rajkot", "Varanasi",
  "Chandigarh", "Gurgaon", "Noida", "Patna", "Ranchi", "Jodhpur",
  "Kochi", "Bhubaneswar", "Mysore", "Dehradun", "Udaipur", "Raipur",
  "Amritsar", "Guwahati", "Jabalpur", "Gwalior", "Trivandrum", "Mangalore",
  "Hubli", "Aurangabad", "Navi Mumbai", "Faridabad", "Ghaziabad",
  "Meerut", "Allahabad", "Vijayawada", "Madurai", "Salem",
];

interface DistributorRecord {
  arn: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pin?: string;
  arn_valid_till?: string;
  arn_valid_from?: string;
  kyd_compliant?: string;
  euin?: string;
}

/**
 * Parse HTML table rows from AMFI response
 */
function parseAmfiHtml(html: string): DistributorRecord[] {
  const rows: DistributorRecord[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  let trMatch;
  let isHeader = true;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];
    const cells: string[] = [];
    let tdMatch;
    tdRegex.lastIndex = 0;

    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      const cellText = tdMatch[1]
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
      cells.push(cellText);
    }

    if (isHeader && cells.length > 0) {
      isHeader = false;
      continue;
    }

    if (cells.length >= 7) {
      rows.push({
        arn: cells[1] || "",
        name: cells[2] || "",
        address: cells[3] || "",
        pin: cells[4] || "",
        email: cells[5] || "",
        city: cells[6] || "",
        phone: cells[8] || cells[7] || "",
        arn_valid_till: cells[9] || "",
        arn_valid_from: cells[10] || "",
        kyd_compliant: cells[11] || "",
        euin: cells[12] || "",
      });
    }
  }

  return rows;
}

/**
 * Parse JSON response (new Strapi-style API)
 */
function parseAmfiJson(data: any): DistributorRecord[] {
  const rows: DistributorRecord[] = [];

  // Handle Strapi v4 response format { data: [...] }
  const items = Array.isArray(data) ? data : data?.data ? (Array.isArray(data.data) ? data.data : []) : [];

  for (const item of items) {
    const attrs = item.attributes || item;
    if (!attrs) continue;

    const record: DistributorRecord = {
      arn: attrs.arn || attrs.arnNumber || attrs.ARN || attrs.arn_number || "",
      name: attrs.name || attrs.arnHolderName || attrs.entity_name || attrs.ARNHolderName || "",
      email: attrs.email || attrs.emailId || "",
      phone: attrs.phone || attrs.telephone || attrs.telephoneO || "",
      address: attrs.address || "",
      city: attrs.city || "",
      pin: attrs.pin || attrs.pincode || "",
      arn_valid_till: attrs.arnValidTill || attrs.arn_valid_till || "",
      kyd_compliant: attrs.kydCompliant || attrs.kyd_compliant || "",
      euin: attrs.euin || attrs.EUIN || "",
    };

    if (record.arn && record.name) {
      rows.push(record);
    }
  }

  return rows;
}

/**
 * Try multiple API patterns to fetch distributor data
 */
async function fetchCityDistributors(city: string): Promise<DistributorRecord[]> {
  const headers = {
    "Accept": "application/json, text/html, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.amfiindia.com/locate-distributor",
    "Origin": "https://www.amfiindia.com",
  };

  // Attempt 1: GET-based API patterns
  for (const patternFn of AMFI_API_PATTERNS) {
    if (!patternFn) continue;
    const url = patternFn(city);
    try {
      const resp = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("json")) {
          const json = await resp.json();
          const records = parseAmfiJson(json);
          if (records.length > 0) {
            console.log(`[GET ${url}] Found ${records.length} distributors`);
            return records;
          }
        } else {
          const html = await resp.text();
          if (html.includes("<tr") && html.includes("<td")) {
            const records = parseAmfiHtml(html);
            if (records.length > 0) {
              console.log(`[GET ${url}] Found ${records.length} distributors (HTML)`);
              return records;
            }
          }
        }
      }
    } catch (err) {
      console.log(`[GET ${url}] failed: ${err}`);
    }
  }

  // Attempt 2: POST to legacy endpoint
  const legacyUrls = [
    "https://www.amfiindia.com/modules/NearestFinancialAdvisorsDetails",
    "https://www.amfiindia.com/api/locate-distributor",
  ];

  const formData = new URLSearchParams();
  formData.append("nfaType", "All");
  formData.append("nfaARN", "");
  formData.append("nfaARNName", "");
  formData.append("nfaAddress", "");
  formData.append("nfaCity", city);
  formData.append("nfaPin", "");

  for (const url of legacyUrls) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        signal: AbortSignal.timeout(10000),
      });
      if (resp.ok) {
        const text = await resp.text();
        try {
          const json = JSON.parse(text);
          const records = parseAmfiJson(json);
          if (records.length > 0) return records;
        } catch {
          if (text.includes("<tr") && text.includes("<td")) {
            const records = parseAmfiHtml(text);
            if (records.length > 0) return records;
          }
        }
      }
    } catch (err) {
      console.log(`[POST ${url}] failed: ${err}`);
    }
  }

  // Attempt 3: JSON POST with body
  try {
    const resp = await fetch("https://www.amfiindia.com/api/locate-distributor", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "All", city, searchText: "", state: "", pincode: "" }),
      signal: AbortSignal.timeout(10000),
    });
    if (resp.ok) {
      const json = await resp.json();
      const records = parseAmfiJson(json);
      if (records.length > 0) return records;
    }
  } catch (err) {
    console.log(`[JSON POST] failed: ${err}`);
  }

  return [];
}

/**
 * Process bulk seed data passed directly in the request body.
 * This allows admins to upload CSV-parsed data directly.
 */
async function processSeedData(
  supabase: ReturnType<typeof createClient>,
  records: Array<Record<string, string>>
): Promise<{ inserted: number; updated: number; skipped: number }> {
  let inserted = 0, updated = 0, skipped = 0;

  for (const rec of records) {
    const name = rec.name || rec.entity_name || rec.arn_holder_name || "";
    const arn = rec.arn || rec.arn_number || rec.registration_number || "";

    if (!name) { skipped++; continue; }

    const entityData: Record<string, any> = {
      entity_name: name,
      entity_type: "distributor",
      registration_number: arn || null,
      registration_category: "MF Distributor",
      source: "amfi",
      source_id: arn || null,
      contact_email: (rec.email || "").toLowerCase() || null,
      contact_phone: rec.phone || rec.telephone || null,
      address: rec.address || null,
      city: rec.city || null,
      state: rec.state || null,
      pincode: rec.pin || rec.pincode || null,
      status: "active",
      last_synced_at: new Date().toISOString(),
      raw_data: {
        arn_valid_till: rec.arn_valid_till || null,
        kyd_compliant: rec.kyd_compliant || null,
        euin: rec.euin || null,
      },
    };

    if (arn) {
      const { data: existing } = await supabase
        .from("registry_entities")
        .select("id")
        .eq("source", "amfi")
        .eq("source_id", arn)
        .maybeSingle();

      if (existing) {
        await supabase.from("registry_entities").update(entityData).eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("registry_entities").insert(entityData);
        inserted++;
      }
    } else {
      await supabase.from("registry_entities").insert(entityData);
      inserted++;
    }
  }

  return { inserted, updated, skipped };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let cities: string[] = DEFAULT_CITIES;
    let maxCities = 5;
    let seedData: Array<Record<string, string>> | null = null;

    try {
      const body = await req.json();

      // Mode 1: Seed data directly (from CSV upload on client)
      if (body.seed_data && Array.isArray(body.seed_data)) {
        seedData = body.seed_data;
      }

      if (body.cities && Array.isArray(body.cities) && body.cities.length > 0) {
        cities = body.cities;
      }
      if (body.max_cities && typeof body.max_cities === "number") {
        maxCities = Math.min(body.max_cities, 20);
      }
      if (body.all === true) {
        maxCities = cities.length;
      }
    } catch {
      // defaults
    }

    // Handle seed data mode
    if (seedData) {
      console.log(`Processing ${seedData.length} seed records`);
      const result = await processSeedData(supabase, seedData);
      console.log(`Seed complete: ${JSON.stringify(result)}`);

      return new Response(
        JSON.stringify({
          success: true,
          mode: "seed",
          summary: {
            total_records: seedData.length,
            ...result,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape mode
    const citiesToProcess = cities.slice(0, maxCities);
    console.log(`Scraping ${citiesToProcess.length} cities:`, citiesToProcess);

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalFound = 0;
    let apiWorking = false;
    const cityResults: Array<{ city: string; found: number; inserted: number; updated: number }> = [];

    for (const city of citiesToProcess) {
      console.log(`Fetching distributors for: ${city}`);
      const distributors = await fetchCityDistributors(city);
      console.log(`Found ${distributors.length} distributors in ${city}`);

      if (distributors.length > 0) apiWorking = true;

      let cityInserted = 0;
      let cityUpdated = 0;

      for (const dist of distributors) {
        if (!dist.arn || !dist.name) {
          totalSkipped++;
          continue;
        }

        const entityData = {
          entity_name: dist.name,
          entity_type: "distributor",
          registration_number: dist.arn,
          registration_category: "MF Distributor",
          source: "amfi",
          source_id: dist.arn,
          contact_email: dist.email && dist.email !== "" ? dist.email.toLowerCase() : null,
          contact_phone: dist.phone && dist.phone !== "" ? dist.phone : null,
          address: dist.address && dist.address !== "" ? dist.address : null,
          city: dist.city && dist.city !== "" ? dist.city : city,
          pincode: dist.pin && dist.pin !== "" ? dist.pin : null,
          status: "active",
          last_synced_at: new Date().toISOString(),
          raw_data: {
            arn_valid_from: dist.arn_valid_from || null,
            arn_valid_till: dist.arn_valid_till || null,
            kyd_compliant: dist.kyd_compliant || null,
            euin: dist.euin || null,
          },
        };

        const { data: existing } = await supabase
          .from("registry_entities")
          .select("id")
          .eq("source", "amfi")
          .eq("source_id", dist.arn)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("registry_entities")
            .update(entityData)
            .eq("id", existing.id);
          if (!error) { cityUpdated++; totalUpdated++; }
        } else {
          const { error } = await supabase
            .from("registry_entities")
            .insert(entityData);
          if (!error) { cityInserted++; totalInserted++; }
        }
      }

      totalFound += distributors.length;
      cityResults.push({ city, found: distributors.length, inserted: cityInserted, updated: cityUpdated });

      // Respectful delay
      await new Promise((r) => setTimeout(r, 500));
    }

    const result = {
      success: true,
      mode: "scrape",
      api_accessible: apiWorking,
      message: apiWorking
        ? undefined
        : "AMFI website API is currently not accessible from server. Use 'Bulk Import' with a CSV file downloaded from AMFI's 'Locate Distributor' page instead.",
      summary: {
        cities_processed: citiesToProcess.length,
        total_found: totalFound,
        total_inserted: totalInserted,
        total_updated: totalUpdated,
        total_skipped: totalSkipped,
      },
      city_results: cityResults,
    };

    console.log("Scrape complete:", JSON.stringify(result.summary));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AMFI scraper error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
