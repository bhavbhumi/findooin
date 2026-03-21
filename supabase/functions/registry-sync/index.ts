import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Types ───
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

const HEADERS: Record<string, string> = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// ═══════════════════════════════════════════════════
// SEBI: Complete 37 intermediary types with Findoo mapping
// ═══════════════════════════════════════════════════
interface SebiTypeConfig {
  intmId: number;
  label: string;
  findoo_bucket: string;
  entity_type: string;
  registration_category: string;
  expected_count: number;
}

const SEBI_TYPES: SebiTypeConfig[] = [
  { intmId: 16, label: "Registered Alternative Investment Funds", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "Alternative Investment Fund", expected_count: 1830 },
  { intmId: 30, label: "Registered Stock Brokers in equity segment", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Stock Broker - Equity", expected_count: 4946 },
  { intmId: 31, label: "Registered Stock Brokers in Equity Derivative Segment", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Stock Broker - Equity Derivative", expected_count: 3737 },
  { intmId: 32, label: "Registered Stock Brokers in Currency Derivative Segment", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Stock Broker - Currency Derivative", expected_count: 2730 },
  { intmId: 38, label: "Registered Stock Brokers in Interest Rate Derivative Segment", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Stock Broker - Interest Rate Derivative", expected_count: 1521 },
  { intmId: 37, label: "Registered Stock Brokers in Debt Segment", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Stock Broker - Debt", expected_count: 742 },
  { intmId: 2, label: "Registered Stock Brokers in Commodity Derivative Segment", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Stock Broker - Commodity Derivative", expected_count: 2017 },
  { intmId: 5, label: "Banker to an Issue", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Banker to Issue", expected_count: 60 },
  { intmId: 7, label: "Credit Rating Agency - CRA", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Credit Rating Agency", expected_count: 8 },
  { intmId: 27, label: "Registered Custodians", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "Custodian", expected_count: 17 },
  { intmId: 6, label: "Debentures Trustee", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Debentures Trustee", expected_count: 26 },
  { intmId: 4, label: "Designated Depository Participants", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Designated Depository Participant", expected_count: 17 },
  { intmId: 15, label: "Qualified Depository Participants", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Qualified Depository Participant", expected_count: 62 },
  { intmId: 18, label: "Registered Depository Participants - CDSL", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Depository Participant - CDSL", expected_count: 736 },
  { intmId: 19, label: "Registered Depository Participants - NSDL", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Depository Participant - NSDL", expected_count: 343 },
  { intmId: 29, label: "FPIs / Deemed FPIs (Erstwhile FIIs/QFIs)", findoo_bucket: "investor", entity_type: "investor", registration_category: "Foreign Portfolio Investor", expected_count: 11735 },
  { intmId: 25, label: "Registered Foreign Venture Capital Investors", findoo_bucket: "investor", entity_type: "investor", registration_category: "Foreign Venture Capital Investor", expected_count: 314 },
  { intmId: 13, label: "Investment Adviser", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Investment Adviser", expected_count: 995 },
  { intmId: 20, label: "Registered Infrastructure Investment Trusts", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "Infrastructure Investment Trust", expected_count: 28 },
  { intmId: 8, label: "KYC Registration Agency", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "KYC Registration Agency", expected_count: 6 },
  { intmId: 9, label: "Merchant Bankers", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Merchant Banker", expected_count: 241 },
  { intmId: 23, label: "Registered Mutual Funds", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "Mutual Fund", expected_count: 56 },
  { intmId: 33, label: "Registered Portfolio Managers", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "Portfolio Manager", expected_count: 505 },
  { intmId: 10, label: "Registrars to an issue and share Transfer Agents", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "Registrar & Transfer Agent", expected_count: 80 },
  { intmId: 14, label: "Research Analyst", findoo_bucket: "intermediary", entity_type: "intermediary", registration_category: "Research Analyst", expected_count: 1844 },
  { intmId: 35, label: "SCSB - Syndicate ASBA (equity)", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "SCSB - Syndicate ASBA Equity", expected_count: 54 },
  { intmId: 34, label: "SCSB - Direct ASBA (equity)", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "SCSB - Direct ASBA Equity", expected_count: 54 },
  { intmId: 21, label: "Registered Venture Capital Funds", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "Venture Capital Fund", expected_count: 149 },
  { intmId: 47, label: "Registered ESG Rating Providers", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "ESG Rating Provider", expected_count: 19 },
  { intmId: 48, label: "Registered SM REITs", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "SM REIT", expected_count: 6 },
  { intmId: 40, label: "SCSB - Issuer Banks for UPI", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "SCSB - Issuer Bank UPI", expected_count: 54 },
  { intmId: 41, label: "SCSB - Sponsor Banks for UPI", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "SCSB - Sponsor Bank UPI", expected_count: 8 },
  { intmId: 42, label: "Real Estate Investment Trust", findoo_bucket: "issuer", entity_type: "issuer", registration_category: "REIT", expected_count: 6 },
  { intmId: 43, label: "UPI Mobile Applications", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "UPI Mobile App", expected_count: 39 },
  { intmId: 44, label: "SCSB - Direct ASBA (debt)", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "SCSB - Direct ASBA Debt", expected_count: 38 },
  { intmId: 45, label: "SCSB - Syndicate ASBA (debt)", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "SCSB - Syndicate ASBA Debt", expected_count: 44 },
  { intmId: 46, label: "Registered Vault Managers", findoo_bucket: "enabler", entity_type: "enabler", registration_category: "Vault Manager", expected_count: 3 },
];

// ═══════════════════════════════════════════════════
// Source configs
// ═══════════════════════════════════════════════════
type SourceScraper = (sb: any, logId: string, opts?: Record<string, unknown>) => Promise<ScrapeSummary>;

const SOURCE_CONFIG: Record<string, {
  entity_type: string;
  registration_category: string;
  scraper: SourceScraper;
}> = {
  amfi: { entity_type: "distributor", registration_category: "MF Distributor", scraper: scrapeAmfi },
  sebi: { entity_type: "intermediary", registration_category: "SEBI Registered", scraper: scrapeSebiAll },
  irdai: { entity_type: "intermediary", registration_category: "Insurance Broker", scraper: scrapeIrdai },
  pfrda: { entity_type: "intermediary", registration_category: "Point of Presence", scraper: scrapePfrda },
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
  const BATCH_SIZE = 50;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    for (const rec of batch) {
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

      // Deduplicate: prefer registration_number, fall back to name+category+source
      let existing: any = null;
      if (rec.registration_number) {
        const { data: found } = await supabase
          .from("registry_entities")
          .select("id")
          .eq("source", source)
          .eq("source_id", rec.registration_number.trim())
          .maybeSingle();
        existing = found;
      }
      if (!existing) {
        // Fallback: match by name + category + source to prevent duplicates for entities without reg numbers
        const { data: found } = await supabase
          .from("registry_entities")
          .select("id")
          .eq("source", source)
          .eq("registration_category", regCategory)
          .eq("entity_name", rec.entity_name.trim())
          .maybeSingle();
        existing = found;
      }

      if (existing) {
        await supabase.from("registry_entities").update(data).eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("registry_entities").insert(data);
        inserted++;
      }
    }
  }

  return { inserted, updated, skipped };
}

// ═══════════════════════════════════════════════════
// SEBI SCRAPER — HTML card-based parser + session pagination
// ═══════════════════════════════════════════════════

const SEBI_BASE = "https://www.sebi.gov.in/sebiweb/other/OtherAction.do";
const SEBI_AJAX = "https://www.sebi.gov.in/sebiweb/ajax/other/getintmfpiinfo.jsp";

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// ─── HTML structure-aware parser ───
// Parses <div class="fixed-table-body card-table"> blocks containing
// <div class="card-view"><div class="title"><span>LABEL</span></div><div class="value..."><span>VALUE</span></div></div>
function parseSebiCards(html: string): RawEntity[] {
  const records: RawEntity[] = [];

  // Split by card-table blocks (each is one entity record)
  // Handle both single and double quotes in attributes
  const cardBlockRegex = /<div\s+class=["']fixed-table-body\s+card-table["']>([\s\S]*?)(?=<div\s+class=["']fixed-table-body\s+card-table["']|<div\s+class=["']pagination["']|$)/gi;
  let blockMatch;

  while ((blockMatch = cardBlockRegex.exec(html)) !== null) {
    const block = blockMatch[1];
    const fields: Record<string, string> = {};

    // Extract title/value pairs from card-view divs
    const cardViewRegex = /<div\s+class=["']card-view["'][^>]*>[\s\S]*?<div\s+class=["']title["']>\s*<span>([\s\S]*?)<\/span>\s*<\/div>\s*<div\s+class=["']value[^"']*["']>\s*<span>([\s\S]*?)<\/span>/gi;
    let fieldMatch;

    while ((fieldMatch = cardViewRegex.exec(block)) !== null) {
      const label = decodeHtmlEntities(fieldMatch[1].replace(/<[^>]*>/g, "").trim());
      const value = decodeHtmlEntities(fieldMatch[2].replace(/<[^>]*>/g, "").trim());
      if (label && value) {
        fields[label] = value;
      }
    }

    if (!fields["Name"] || fields["Name"].length < 2) continue;

    // Extract address parts
    const addr = fields["Address"] || fields["Correspondence Address"] || "";
    let city = "", state = "", pincode = "";
    const pincodeMatch = addr.match(/(\d{6})\s*$/);
    if (pincodeMatch) pincode = pincodeMatch[1];
    const parts = addr.split(",").map(p => p.trim());
    if (parts.length >= 3) {
      const last = parts[parts.length - 1];
      const secondLast = parts[parts.length - 2];
      const thirdLast = parts[parts.length - 3];
      if (/^\d{6}$/.test(last)) {
        state = secondLast;
        city = thirdLast;
      } else if (/\d{6}/.test(last)) {
        state = secondLast;
        city = thirdLast;
      } else {
        state = last;
        city = secondLast;
      }
    }

    // Map various email/phone label variants
    const email = fields["E-mail"] || fields["Email"] || fields["Correspondence E-mail"] || fields["Correspondence Email"] || "";
    const phone = fields["Telephone"] || fields["Correspondence Telephone"] || fields["Tel."] || "";

    records.push({
      entity_name: fields["Name"],
      registration_number: fields["Registration No."] || fields["Registration No"] || "",
      contact_email: email,
      contact_phone: phone,
      address: addr,
      city: city.replace(/^\d+/, "").trim(),
      state: state.replace(/\d/g, "").trim(),
      pincode,
      raw_data: {
        trade_name: fields["Trade Name"] || "",
        contact_person: fields["Contact Person"] || "",
        validity: (fields["Validity"] || fields[" Validity "] || "").trim(),
        exchange_name: fields["Exchange Name"] || "",
        correspondence_address: fields["Correspondence Address"] || "",
        fax: fields["Fax No."] || fields["Fax No"] || "",
        principal_officer: fields["Principal Officer"] || "",
        compliance_officer: fields["Compliance Officer"] || "",
        category: fields["Category"] || "",
        sponsor: fields["Sponsor"] || "",
        manager: fields["Manager"] || "",
        source_url: "sebi.gov.in",
      },
    });
  }

  return records;
}

// Extract session cookie from response
function extractSessionId(resp: Response, html?: string): string {
  // Method 1: getSetCookie()
  try {
    const setCookies = resp.headers.getSetCookie?.() || [];
    for (const c of setCookies) {
      const m = c.match(/JSESSIONID=([^;]+)/);
      if (m) return m[1];
    }
  } catch { /* fallback */ }

  // Method 2: Raw set-cookie header
  const raw = resp.headers.get("set-cookie") || "";
  const m1 = raw.match(/JSESSIONID=([^;]+)/);
  if (m1) return m1[1];

  // Method 3: Extract from form action URL in HTML (jsessionid=XXX)
  if (html) {
    const m2 = html.match(/jsessionid=([A-F0-9]+)/i);
    if (m2) return m2[1];
  }

  return "";
}

// Fetch initial SEBI page (establishes session) and parse page 1
async function fetchSebiInitialPage(intmId: number): Promise<{ html: string; totalRecords: number; sessionId: string }> {
  const url = `${SEBI_BASE}?doRecognisedFpi=yes&intmId=${intmId}`;
  const resp = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(25000) });
  if (!resp.ok) throw new Error(`SEBI returned ${resp.status} for intmId=${intmId}`);

  const html = await resp.text();
  const sessionId = extractSessionId(resp, html);

  const totalMatch = html.match(/\d+\s+to\s+\d+\s+of\s+([\d,]+)\s+record/i);
  const totalRecords = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 0;

  return { html, totalRecords, sessionId };
}

// Fetch subsequent page via AJAX POST with session cookie
async function fetchSebiAjaxPage(intmId: number, pageIndex: number, sessionId: string): Promise<string> {
  const body = new URLSearchParams({
    nextValue: "0",
    next: "n",
    intmId: String(intmId),
    contPer: "",
    name: "",
    regNo: "",
    email: "",
    location: "",
    exchange: "",
    affiliate: "",
    alp: "",
    doDirect: String(pageIndex),
    intmIds: "",
  });

  const resp = await fetch(SEBI_AJAX, {
    method: "POST",
    headers: {
      ...HEADERS,
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${SEBI_BASE}?doRecognisedFpi=yes&intmId=${intmId}`,
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": `JSESSIONID=${sessionId}`,
    },
    body: body.toString(),
    signal: AbortSignal.timeout(25000),
  });

  if (!resp.ok) throw new Error(`SEBI AJAX returned ${resp.status}`);
  const html = await resp.text();

  if (html.includes("Unauthorized Request Blocked") || html.includes("Unauthorized Activity")) {
    throw new Error("SEBI WAF blocked request");
  }

  return html;
}

// Scrape a single SEBI intermediary type with session-based pagination
async function scrapeSebiType(
  supabase: any,
  typeConfig: SebiTypeConfig,
): Promise<ScrapeSummary> {
  const allRecords: RawEntity[] = [];
  const seenKeys = new Set<string>();
  const PER_PAGE = 25;

  const addUnique = (records: RawEntity[]) => {
    for (const r of records) {
      const key = r.registration_number || r.entity_name;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        allRecords.push(r);
      }
    }
  };

  try {
    // Step 1: Fetch initial page (gets session cookie + page 1 data)
    const { html: firstHtml, totalRecords, sessionId } = await fetchSebiInitialPage(typeConfig.intmId);
    const firstRecords = parseSebiCards(firstHtml);
    addUnique(firstRecords);

    const totalPages = Math.ceil(totalRecords / PER_PAGE);
    console.log(`[SEBI:${typeConfig.intmId}] ${typeConfig.label}: ${totalRecords} total, ${totalPages} pages, session=${sessionId ? sessionId.substring(0, 8) + "..." : "NONE"}, page1=${firstRecords.length} parsed`);

    if (!sessionId) {
      console.warn(`[SEBI:${typeConfig.intmId}] No session cookie found — will try pagination anyway using form action jsessionid`);
    }

    // Step 2: Fetch remaining pages via AJAX with session cookie
    if (totalPages > 1 && sessionId) {
      let consecutiveFailures = 0;

      for (let pageIdx = 1; pageIdx < totalPages; pageIdx++) {
        try {
          const html = await fetchSebiAjaxPage(typeConfig.intmId, pageIdx, sessionId);
          const parsed = parseSebiCards(html);

          if (parsed.length === 0) {
            console.warn(`[SEBI:${typeConfig.intmId}] Page ${pageIdx + 1}/${totalPages}: 0 records (html length=${html.length})`);
            consecutiveFailures++;
          } else {
            consecutiveFailures = 0;
            addUnique(parsed);
            if ((pageIdx + 1) % 10 === 0 || pageIdx === totalPages - 1) {
              console.log(`[SEBI:${typeConfig.intmId}] Page ${pageIdx + 1}/${totalPages}: +${parsed.length}, total=${allRecords.length}`);
            }
          }

          if (consecutiveFailures >= 3) {
            console.warn(`[SEBI:${typeConfig.intmId}] Stopping after 3 consecutive empty pages at page ${pageIdx + 1}`);
            break;
          }
        } catch (err) {
          console.error(`[SEBI:${typeConfig.intmId}] Page ${pageIdx + 1} error: ${err}`);
          consecutiveFailures++;
          if (consecutiveFailures >= 3) break;
        }
        // Rate limit between pages
        await new Promise(r => setTimeout(r, 500));
      }
    }
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `Failed intmId=${typeConfig.intmId}: ${err}` };
  }

  console.log(`[SEBI:${typeConfig.intmId}] Final: ${allRecords.length} unique records`);

  if (allRecords.length === 0) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `No records parsed for ${typeConfig.label}` };
  }

  const result = await upsertEntities(supabase, "sebi", typeConfig.entity_type, typeConfig.registration_category, allRecords);
  return { found: allRecords.length, ...result };
}

// Entry: scrape ALL or specific SEBI types
async function scrapeSebiAll(supabase: any, _logId: string, opts?: Record<string, unknown>): Promise<ScrapeSummary> {
  const typeIds = opts?.sebi_type_ids as number[] | undefined;
  const configs = typeIds
    ? SEBI_TYPES.filter(t => typeIds.includes(t.intmId))
    : SEBI_TYPES;

  let totalFound = 0, totalInserted = 0, totalUpdated = 0, totalSkipped = 0;
  const typeResults: Record<string, ScrapeSummary> = {};

  for (const config of configs) {
    console.log(`\n── SEBI Type: ${config.label} (intmId=${config.intmId}) ──`);
    const result = await scrapeSebiType(supabase, config);
    totalFound += result.found;
    totalInserted += result.inserted;
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    typeResults[`${config.intmId}_${config.registration_category}`] = result;
    console.log(`   found=${result.found} ins=${result.inserted} upd=${result.updated} skip=${result.skipped}`);

    // Breathing room between types
    await new Promise(r => setTimeout(r, 1000));
  }

  return {
    found: totalFound,
    inserted: totalInserted,
    updated: totalUpdated,
    skipped: totalSkipped,
    details: JSON.stringify(typeResults),
  };
}

// ═══════════════════════════════════════════════════
// AMFI Scraper
// ═══════════════════════════════════════════════════
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
        headers: { ...HEADERS, Referer: "https://www.amfiindia.com/locate-distributor" },
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
        return parseAmfiHtmlTable(html, city);
      }
    } catch { /* try next */ }
  }

  try {
    const resp = await fetch("https://www.amfiindia.com/modules/NearestFinancialAdvisorsDetails", {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/x-www-form-urlencoded" },
      body: `nfaType=All&nfaCity=${encodeURIComponent(city)}`,
      signal: AbortSignal.timeout(10000),
    });
    if (resp.ok) {
      const html = await resp.text();
      return parseAmfiHtmlTable(html, city);
    }
  } catch { /* noop */ }

  return [];
}

function parseAmfiHtmlTable(html: string, city: string): RawEntity[] {
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

// ═══════════════════════════════════════════════════
// IRDAI Scraper
// ═══════════════════════════════════════════════════
async function scrapeIrdai(supabase: any, _logId: string): Promise<ScrapeSummary> {
  const records: RawEntity[] = [];
  try {
    const resp = await fetch("https://irdai.gov.in/list-of-brokers", {
      headers: HEADERS, signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `IRDAI returned ${resp.status}` };

    const html = await resp.text();
    const parsed = parseIrdaiHtml(html);
    records.push(...parsed);
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `IRDAI scrape failed: ${err}` };
  }

  if (records.length === 0) return { found: 0, inserted: 0, updated: 0, skipped: 0, details: "No data from IRDAI" };
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
      if (first.includes("sl") || first.includes("no") || first === "#") { headerSkipped = true; continue; }
    }
    if (cells.length >= 8) {
      const corNo = cells[1]?.trim();
      const name = cells[2]?.trim();
      if (!name || name.length < 3) continue;
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

// ═══════════════════════════════════════════════════
// PFRDA Scraper
// ═══════════════════════════════════════════════════
async function scrapePfrda(supabase: any, _logId: string): Promise<ScrapeSummary> {
  const records: RawEntity[] = [];
  try {
    const resp = await fetch("https://pfrda.org.in/list-of-pops", {
      headers: HEADERS, signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `PFRDA returned ${resp.status}` };

    const html = await resp.text();
    const parsed = parsePfrdaHtml(html);
    records.push(...parsed);
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `PFRDA scrape failed: ${err}` };
  }

  if (records.length === 0) return { found: 0, inserted: 0, updated: 0, skipped: 0, details: "No data from PFRDA" };
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
    if (cells.length >= 2) {
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

// ═══════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════
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
    const sebiTypeIds = body.sebi_type_ids as number[] | undefined;

    const results: Record<string, ScrapeSummary & { log_id?: string }> = {};

    // Load pause config once
    const { data: pauseConfigs } = await supabase
      .from("registry_sync_config")
      .select("source, sebi_intm_id, is_paused")
      .eq("is_paused", true);
    const pausedSources = new Set((pauseConfigs || []).filter(c => !c.sebi_intm_id).map(c => c.source));
    const pausedSebiTypes = new Set((pauseConfigs || []).filter(c => c.sebi_intm_id).map(c => c.sebi_intm_id));

    for (const source of sources) {
      // Check source-level pause
      if (pausedSources.has(source)) {
        console.log(`[${source}] PAUSED — skipping`);
        results[source] = { found: 0, inserted: 0, updated: 0, skipped: 0, details: "Paused" };
        continue;
      }

      console.log(`\n━━━ Syncing ${source.toUpperCase()} ━━━`);

      let subSource: string | null = null;
      // Filter out paused SEBI types
      let effectiveSebiTypeIds = sebiTypeIds;
      if (source === "sebi" && sebiTypeIds && sebiTypeIds.length > 0) {
        effectiveSebiTypeIds = sebiTypeIds.filter(id => !pausedSebiTypes.has(id));
        if (effectiveSebiTypeIds.length === 0) {
          console.log(`[sebi] All requested types are paused — skipping`);
          results[source] = { found: 0, inserted: 0, updated: 0, skipped: 0, details: "All types paused" };
          continue;
        }
        const labels = effectiveSebiTypeIds.map(id => {
          const t = SEBI_TYPES.find(st => st.intmId === id);
          return t ? t.registration_category : `intm${id}`;
        });
        subSource = labels.join(", ");
      } else if (source === "sebi" && !sebiTypeIds) {
        // Full SEBI sync — filter out paused types
        effectiveSebiTypeIds = pausedSebiTypes.size > 0
          ? SEBI_TYPES.filter(t => !pausedSebiTypes.has(t.intmId)).map(t => t.intmId)
          : undefined;
      }

      const { data: logEntry } = await supabase
        .from("registry_sync_log")
        .insert({
          source,
          sync_type: syncType,
          status: "running",
          triggered_by: triggeredBy,
          metadata: subSource ? { sub_source: subSource, sebi_type_ids: effectiveSebiTypeIds } : {},
        })
        .select("id")
        .single();

      const logId = logEntry?.id || "";

      try {
        const config = SOURCE_CONFIG[source];
        const opts: Record<string, unknown> = {};
        if (source === "sebi" && effectiveSebiTypeIds) opts.sebi_type_ids = effectiveSebiTypeIds;

        const summary = await config.scraper(supabase, logId, opts);

        await supabase.from("registry_sync_log").update({
          status: summary.found > 0 ? "completed" : "no_data",
          records_found: summary.found,
          records_inserted: summary.inserted,
          records_updated: summary.updated,
          records_skipped: summary.skipped,
          completed_at: new Date().toISOString(),
          metadata: {
            ...(subSource ? { sub_source: subSource, sebi_type_ids: sebiTypeIds } : {}),
            ...(summary.details ? { details: summary.details } : {}),
          },
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

    // Run consolidation after sync to merge duplicate entities
    try {
      console.log("[consolidation] Running entity consolidation...");
      const { data: consolResult } = await supabase.rpc("consolidate_registry_entities");
      console.log("[consolidation] Result:", consolResult);
    } catch (consolErr) {
      console.warn("[consolidation] Non-fatal error:", consolErr);
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

export { SEBI_TYPES };
