import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Source configs ───
const SOURCE_CONFIG: Record<string, {
  entity_type: string;
  registration_category: string;
  scraper: (sb: any, logId: string) => Promise<ScrapeSummary>;
}> = {
  amfi: {
    entity_type: "distributor",
    registration_category: "MF Distributor",
    scraper: scrapeAmfi,
  },
  sebi: {
    entity_type: "intermediary",
    registration_category: "Investment Adviser",
    scraper: scrapeSebi,
  },
  irdai: {
    entity_type: "intermediary",
    registration_category: "Insurance Broker",
    scraper: scrapeIrdai,
  },
  pfrda: {
    entity_type: "intermediary",
    registration_category: "Point of Presence",
    scraper: scrapePfrda,
  },
};

interface ScrapeSummary {
  found: number;
  inserted: number;
  updated: number;
  skipped: number;
  details?: string;
}

interface RawEntity {
  entity_name: string;
  registration_number?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  raw_data?: Record<string, unknown>;
}

const HEADERS = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// ─── Upsert helper ───
async function upsertEntities(
  supabase: any,
  source: string,
  entityType: string,
  regCategory: string,
  records: RawEntity[]
): Promise<{ inserted: number; updated: number; skipped: number }> {
  let inserted = 0, updated = 0, skipped = 0;

  for (const rec of records) {
    if (!rec.entity_name || rec.entity_name.length < 2) { skipped++; continue; }

    const data: Record<string, unknown> = {
      entity_name: rec.entity_name.trim(),
      entity_type: entityType,
      registration_number: rec.registration_number?.trim() || null,
      registration_category: regCategory,
      source,
      source_id: rec.registration_number?.trim() || null,
      contact_email: rec.contact_email?.toLowerCase().trim() || null,
      contact_phone: rec.contact_phone?.trim() || null,
      address: rec.address?.trim() || null,
      city: rec.city?.trim() || null,
      state: rec.state?.trim() || null,
      pincode: rec.pincode?.trim() || null,
      status: "active",
      last_synced_at: new Date().toISOString(),
      raw_data: rec.raw_data || {},
    };

    if (rec.registration_number) {
      const { data: existing } = await supabase
        .from("registry_entities")
        .select("id")
        .eq("source", source)
        .eq("source_id", rec.registration_number.trim())
        .maybeSingle();

      if (existing) {
        await supabase.from("registry_entities").update(data).eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("registry_entities").insert(data);
        inserted++;
      }
    } else {
      await supabase.from("registry_entities").insert(data);
      inserted++;
    }
  }

  return { inserted, updated, skipped };
}

// ─── AMFI Scraper ───
const AMFI_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Pune", "Jaipur", "Lucknow", "Surat", "Indore",
];

async function scrapeAmfi(supabase: any, _logId: string): Promise<ScrapeSummary> {
  let totalFound = 0, totalInserted = 0, totalUpdated = 0, totalSkipped = 0;

  for (const city of AMFI_CITIES) {
    const records = await fetchAmfiCity(city);
    totalFound += records.length;

    if (records.length > 0) {
      const result = await upsertEntities(supabase, "amfi", "distributor", "MF Distributor", records);
      totalInserted += result.inserted;
      totalUpdated += result.updated;
      totalSkipped += result.skipped;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  return { found: totalFound, inserted: totalInserted, updated: totalUpdated, skipped: totalSkipped };
}

async function fetchAmfiCity(city: string): Promise<RawEntity[]> {
  const urls = [
    `https://www.amfiindia.com/api/locate-distributor/find?type=All&city=${encodeURIComponent(city)}`,
    `https://www.amfiindia.com/api/locate-distributor?type=All&nfaCity=${encodeURIComponent(city)}`,
  ];

  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        headers: { ...HEADERS, "Referer": "https://www.amfiindia.com/locate-distributor" },
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) continue;

      const ct = resp.headers.get("content-type") || "";
      if (ct.includes("json")) {
        const json = await resp.json();
        const items = Array.isArray(json) ? json : json?.data || [];
        return items.filter((i: any) => i.arn || i.arnNumber || i.ARN).map((i: any) => {
          const a = i.attributes || i;
          return {
            entity_name: a.name || a.arnHolderName || a.ARNHolderName || "",
            registration_number: a.arn || a.arnNumber || a.ARN || "",
            contact_email: a.email || a.emailId || "",
            contact_phone: a.phone || a.telephone || "",
            address: a.address || "",
            city: a.city || city,
            pincode: a.pin || a.pincode || "",
            raw_data: { arn_valid_till: a.arnValidTill || "", kyd_compliant: a.kydCompliant || "", euin: a.euin || "" },
          };
        });
      } else {
        const html = await resp.text();
        return parseHtmlTable(html, city);
      }
    } catch { /* try next */ }
  }

  // POST fallback
  try {
    const resp = await fetch("https://www.amfiindia.com/modules/NearestFinancialAdvisorsDetails", {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
      body: `nfaType=All&nfaCity=${encodeURIComponent(city)}`,
      signal: AbortSignal.timeout(10000),
    });
    if (resp.ok) {
      const html = await resp.text();
      return parseHtmlTable(html, city);
    }
  } catch { /* noop */ }

  return [];
}

function parseHtmlTable(html: string, city: string): RawEntity[] {
  const rows: RawEntity[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let trMatch;
  let isHeader = true;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let tdMatch;
    tdRegex.lastIndex = 0;
    while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim());
    }
    if (isHeader && cells.length > 0) { isHeader = false; continue; }
    if (cells.length >= 7) {
      rows.push({
        entity_name: cells[2] || "",
        registration_number: cells[1] || "",
        address: cells[3] || "",
        pincode: cells[4] || "",
        contact_email: cells[5] || "",
        city: cells[6] || city,
        contact_phone: cells[8] || cells[7] || "",
        raw_data: { arn_valid_till: cells[9] || "", kyd_compliant: cells[11] || "", euin: cells[12] || "" },
      });
    }
  }
  return rows;
}

// ─── SEBI Scraper (Investment Advisers) ───
async function scrapeSebi(supabase: any, _logId: string): Promise<ScrapeSummary> {
  const records: RawEntity[] = [];

  // SEBI lists IAs alphabetically A-Z + 0-9
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0".split("");

  for (const letter of letters) {
    try {
      const url = `https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13&alpha=${letter}`;
      const resp = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
      if (!resp.ok) continue;

      const html = await resp.text();
      const parsed = parseSebiHtml(html);
      records.push(...parsed);
      console.log(`[SEBI] Letter ${letter}: ${parsed.length} records`);
    } catch (err) {
      console.log(`[SEBI] Letter ${letter} failed: ${err}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  if (records.length === 0) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: "SEBI website not accessible from server" };
  }

  const result = await upsertEntities(supabase, "sebi", "intermediary", "Investment Adviser", records);
  return { found: records.length, ...result };
}

function parseSebiHtml(html: string): RawEntity[] {
  const records: RawEntity[] = [];

  // SEBI uses a card-style layout. Parse name + reg no + email + phone blocks
  // Pattern: Name\n\nRegistration No.\n\nINAxxxxxx\n\nE-mail\n\nemail@...\n\nTelephone\n\nxxx
  const nameRegex = /Registration No\.\s*<\/b>\s*<br\s*\/?>\s*(INA\d+)/gi;
  const blockRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;

  // Simpler approach: extract all INA registration numbers and adjacent text
  const inaPattern = /INA\d{9,12}/g;
  let match;
  const regNums = new Set<string>();

  while ((match = inaPattern.exec(html)) !== null) {
    regNums.add(match[0]);
  }

  // For each reg number, try to extract surrounding context
  for (const regNum of regNums) {
    const idx = html.indexOf(regNum);
    const context = html.substring(Math.max(0, idx - 500), Math.min(html.length, idx + 500));
    const cleanContext = context.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

    // Try to extract name (usually before "Registration No.")
    const nameMatch = cleanContext.match(/Name\s+(.*?)\s+Registration/i);
    const emailMatch = cleanContext.match(/(?:E-?mail|Email)\s+(\S+@\S+)/i);
    const phoneMatch = cleanContext.match(/(?:Telephone|Phone)\s+(\d[\d\s-]{6,})/i);
    const addrMatch = cleanContext.match(/Address\s+(.*?)(?:Telephone|Phone|Validity|E-?mail)/i);
    const validityMatch = cleanContext.match(/Validity\s+(.*?)(?:\s*$|\s+Name)/i);

    if (nameMatch) {
      records.push({
        entity_name: nameMatch[1].trim(),
        registration_number: regNum,
        contact_email: emailMatch?.[1]?.trim() || "",
        contact_phone: phoneMatch?.[1]?.trim() || "",
        address: addrMatch?.[1]?.trim() || "",
        raw_data: { validity: validityMatch?.[1]?.trim() || "", source_url: "sebi.gov.in" },
      });
    }
  }

  return records;
}

// ─── IRDAI Scraper (Insurance Brokers) ───
async function scrapeIrdai(supabase: any, _logId: string): Promise<ScrapeSummary> {
  const records: RawEntity[] = [];

  try {
    const resp = await fetch("https://irdai.gov.in/list-of-brokers", {
      headers: HEADERS,
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `IRDAI returned ${resp.status}` };
    }

    const html = await resp.text();
    const parsed = parseIrdaiHtml(html);
    records.push(...parsed);
    console.log(`[IRDAI] Parsed ${parsed.length} brokers`);
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `IRDAI scrape failed: ${err}` };
  }

  if (records.length === 0) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: "No data parsed from IRDAI" };
  }

  const result = await upsertEntities(supabase, "irdai", "intermediary", "Insurance Broker", records);
  return { found: records.length, ...result };
}

function parseIrdaiHtml(html: string): RawEntity[] {
  const records: RawEntity[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let trMatch;
  let headerSkipped = false;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let tdMatch;
    tdRegex.lastIndex = 0;
    while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim());
    }

    if (!headerSkipped && cells.length > 0) {
      const first = cells[0].toLowerCase();
      if (first.includes("sl") || first.includes("no") || first === "#") {
        headerSkipped = true;
        continue;
      }
    }

    // Expected: Sl No | CoR No | Name | Address | Phone | Category | Principal Officer | From | To | Email
    if (cells.length >= 8) {
      const corNo = cells[1]?.trim();
      const name = cells[2]?.trim();
      if (!name || name.length < 3) continue;

      // Extract English name if bilingual (Hindi / English)
      const englishName = name.includes("/") ? name.split("/").pop()?.trim() || name : name;

      records.push({
        entity_name: englishName,
        registration_number: corNo || "",
        address: cells[3]?.trim() || "",
        contact_phone: cells[4]?.trim() || "",
        contact_email: cells[9]?.trim() || "",
        raw_data: {
          category: cells[5]?.trim() || "",
          principal_officer: cells[6]?.trim() || "",
          valid_from: cells[7]?.trim() || "",
          valid_to: cells[8]?.trim() || "",
        },
      });
    }
  }

  return records;
}

// ─── PFRDA Scraper (Points of Presence) ───
async function scrapePfrda(supabase: any, _logId: string): Promise<ScrapeSummary> {
  const records: RawEntity[] = [];

  try {
    const resp = await fetch("https://pfrda.org.in/list-of-pops", {
      headers: HEADERS,
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `PFRDA returned ${resp.status}` };
    }

    const html = await resp.text();
    const parsed = parsePfrdaHtml(html);
    records.push(...parsed);
    console.log(`[PFRDA] Parsed ${parsed.length} PoPs`);
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `PFRDA scrape failed: ${err}` };
  }

  if (records.length === 0) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: "No data parsed from PFRDA" };
  }

  const result = await upsertEntities(supabase, "pfrda", "intermediary", "Point of Presence", records);
  return { found: records.length, ...result };
}

function parsePfrdaHtml(html: string): RawEntity[] {
  const records: RawEntity[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let tdMatch;
    tdRegex.lastIndex = 0;
    while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
      cells.push(tdMatch[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim());
    }

    // Expected: Reg Number | Date
    // Or: Name | Reg Number | Date
    if (cells.length >= 2) {
      const regMatch = cells[0]?.match(/POP\d+/);
      if (regMatch) {
        // Second cell might be date, name might be in previous context
        // For the table format: just reg number and date; name is in a preceding row/cell
        continue; // Skip pure reg-number rows, handled below
      }

      // Check if any cell has a POP number
      for (let i = 0; i < cells.length; i++) {
        const popMatch = cells[i]?.match(/(POP\d+)/);
        if (popMatch && cells.length >= 2) {
          const nameIdx = i === 0 ? 1 : 0;
          const name = cells[nameIdx]?.trim();
          if (name && name.length > 3 && !name.match(/^\d/)) {
            records.push({
              entity_name: name,
              registration_number: popMatch[1],
              raw_data: { registration_date: cells[2]?.trim() || "" },
            });
          }
        }
      }
    }
  }

  // Also try to parse the alternating name/reg-number pattern from PFRDA
  // Pattern: <entity name>\n\nPOPxxxxxxx | date
  const popPattern = /([A-Z][A-Za-z\s&().,-]+(?:Limited|Ltd|Bank|India|Corporation|Company|Association|Insurance|Financial|Services|Trust|Pvt)[\w\s.]*)\s*(?:<[^>]*>)*\s*(POP\d+)/gi;
  let popMatch;
  const existingRegs = new Set(records.map(r => r.registration_number));

  while ((popMatch = popPattern.exec(html)) !== null) {
    const name = popMatch[1].replace(/<[^>]*>/g, "").trim();
    const regNum = popMatch[2];
    if (!existingRegs.has(regNum) && name.length > 5) {
      records.push({ entity_name: name, registration_number: regNum });
      existingRegs.add(regNum);
    }
  }

  return records;
}

// ─── Main Handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* default */ }

    const sources: string[] = body.sources
      ? (body.sources as string[]).filter(s => s in SOURCE_CONFIG)
      : Object.keys(SOURCE_CONFIG);

    const syncType = (body.sync_type as string) || "manual";
    const triggeredBy = (body.triggered_by as string) || null;

    const results: Record<string, ScrapeSummary & { log_id?: string }> = {};

    for (const source of sources) {
      console.log(`\n━━━ Syncing ${source.toUpperCase()} ━━━`);

      // Create sync log entry
      const { data: logEntry } = await supabase
        .from("registry_sync_log")
        .insert({
          source,
          sync_type: syncType,
          status: "running",
          triggered_by: triggeredBy,
        })
        .select("id")
        .single();

      const logId = logEntry?.id || "";

      try {
        const config = SOURCE_CONFIG[source];
        const summary = await config.scraper(supabase, logId);

        // Update log
        await supabase.from("registry_sync_log").update({
          status: summary.found > 0 ? "completed" : "no_data",
          records_found: summary.found,
          records_inserted: summary.inserted,
          records_updated: summary.updated,
          records_skipped: summary.skipped,
          completed_at: new Date().toISOString(),
          metadata: summary.details ? { details: summary.details } : {},
        }).eq("id", logId);

        results[source] = { ...summary, log_id: logId };
        console.log(`[${source}] Done: found=${summary.found} ins=${summary.inserted} upd=${summary.updated} skip=${summary.skipped}`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`[${source}] Error:`, errMsg);

        await supabase.from("registry_sync_log").update({
          status: "failed",
          error_message: errMsg,
          completed_at: new Date().toISOString(),
        }).eq("id", logId);

        results[source] = { found: 0, inserted: 0, updated: 0, skipped: 0, details: errMsg, log_id: logId };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registry sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
