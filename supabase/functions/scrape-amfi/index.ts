import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMFI_URL = "https://www.amfiindia.com/modules/NearestFinancialAdvisorsDetails";

// Major Indian cities - used as default when no cities are specified
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

/**
 * Parse the HTML table returned by AMFI into structured rows.
 * The AMFI endpoint returns an HTML table with these columns:
 * Sr No | ARN | ARN Holder's Name | Address | Pin | Email | City |
 * Telephone (R) | Telephone (O) | ARN Valid Till | ARN Valid From | KYD Compliant | EUIN
 */
function parseAmfiHtml(html: string): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];

  // Extract table rows using regex (no DOM parser available in Deno edge runtime)
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  const columnNames = [
    "sr_no", "arn", "name", "address", "pin", "email", "city",
    "tel_r", "tel_o", "arn_valid_till", "arn_valid_from", "kyd_compliant", "euin",
  ];

  let trMatch;
  let isHeader = true;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];
    const cells: string[] = [];
    let tdMatch;

    // Reset tdRegex lastIndex for each row
    tdRegex.lastIndex = 0;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      // Strip HTML tags from cell content
      const cellText = tdMatch[1]
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
      cells.push(cellText);
    }

    // Skip header row and empty rows
    if (isHeader && cells.length > 0) {
      isHeader = false;
      continue;
    }

    if (cells.length >= 7) {
      const row: Record<string, string> = {};
      cells.forEach((cell, idx) => {
        if (idx < columnNames.length) {
          row[columnNames[idx]] = cell;
        }
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Fetch distributors from AMFI for a given city
 */
async function fetchCityDistributors(city: string): Promise<Array<Record<string, string>>> {
  try {
    const formData = new URLSearchParams();
    formData.append("nfaType", "All");
    formData.append("nfaARN", "");
    formData.append("nfaARNName", "");
    formData.append("nfaAddress", "");
    formData.append("nfaCity", city);
    formData.append("nfaPin", "");

    const response = await fetch(AMFI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/html",
        "User-Agent": "Mozilla/5.0 (compatible; FindOO Registry Sync)",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(`AMFI request failed for city ${city}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseAmfiHtml(html);
  } catch (err) {
    console.error(`Error fetching city ${city}:`, err);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body
    let cities: string[] = DEFAULT_CITIES;
    let maxCities = 5; // Default: process 5 cities per invocation to stay within time limits

    try {
      const body = await req.json();
      if (body.cities && Array.isArray(body.cities) && body.cities.length > 0) {
        cities = body.cities;
      }
      if (body.max_cities && typeof body.max_cities === "number") {
        maxCities = Math.min(body.max_cities, 20); // Cap at 20 per run
      }
      if (body.all === true) {
        maxCities = cities.length;
      }
    } catch {
      // Use defaults if no body or invalid JSON
    }

    const citiesToProcess = cities.slice(0, maxCities);
    console.log(`Processing ${citiesToProcess.length} cities:`, citiesToProcess);

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const cityResults: Array<{ city: string; found: number; inserted: number; updated: number }> = [];

    for (const city of citiesToProcess) {
      console.log(`Fetching distributors for: ${city}`);
      const distributors = await fetchCityDistributors(city);
      console.log(`Found ${distributors.length} distributors in ${city}`);

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
          contact_phone: dist.tel_o && dist.tel_o !== "" ? dist.tel_o : (dist.tel_r && dist.tel_r !== "" ? dist.tel_r : null),
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

        // Upsert by source + source_id (ARN)
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

          if (!error) {
            cityUpdated++;
            totalUpdated++;
          }
        } else {
          const { error } = await supabase
            .from("registry_entities")
            .insert(entityData);

          if (!error) {
            cityInserted++;
            totalInserted++;
          }
        }
      }

      cityResults.push({
        city,
        found: distributors.length,
        inserted: cityInserted,
        updated: cityUpdated,
      });

      // Small delay between cities to be respectful
      await new Promise((r) => setTimeout(r, 500));
    }

    const result = {
      success: true,
      summary: {
        cities_processed: citiesToProcess.length,
        total_found: cityResults.reduce((s, c) => s + c.found, 0),
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
