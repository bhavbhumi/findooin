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

const HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// ═══════════════════════════════════════════════════
// SEBI: Complete 37 intermediary types with Findoo mapping
// ═══════════════════════════════════════════════════
interface SebiTypeConfig {
  intmId: number;
  label: string;
  findoo_bucket: string; // issuer | intermediary | enabler | investor
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
// Source configs (AMFI, IRDAI, PFRDA remain, SEBI expanded)
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
  }

  return { inserted, updated, skipped };
}

// ═══════════════════════════════════════════════════
// SEBI SCRAPER — Comprehensive all-types scraper
// ═══════════════════════════════════════════════════

const SEBI_BASE = "https://www.sebi.gov.in/sebiweb/other/OtherAction.do";

// Parse SEBI card-style HTML into records
function parseSebiCards(html: string): RawEntity[] {
  const records: RawEntity[] = [];
  // Clean HTML: remove scripts, styles
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");

  // Split by "Name" label which starts each record card
  // Pattern: label-value pairs separated by HTML structure
  // Extract all text content between meaningful markers
  const textContent = clean
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(div|span|p|td|tr|th|table|tbody|thead|a|b|strong|em|i|font|li|ul|ol|h\d)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\r/g, "");

  // Split into lines and clean
  const lines = textContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  // State machine: parse label/value pairs
  let currentRecord: Record<string, string> = {};
  let currentLabel = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip navigation, pagination, header noise
    if (/^(Search|GO$|Show All|Note:|1 to |\d+ to \d+ of|0-9|A B C|---|\-\-|Select|records$)/i.test(line)) continue;
    if (/^(Name \/ Trade Name|Registration No\.|Contact Person|Email|Location|Exchange Name):?$/i.test(line) && lines[i+1]?.startsWith("GO")) continue;

    // Detect field labels
    const labelPatterns: Record<string, string> = {
      "^Name$": "name",
      "^Trade Name$": "trade_name",
      "^Registration No\\.?$": "registration_number",
      "^E-?mail$": "email",
      "^Telephone$": "telephone",
      "^Fax No\\.?$": "fax",
      "^Address$": "address",
      "^Correspondence Address$": "correspondence_address",
      "^Contact Person$": "contact_person",
      "^Validity$": "validity",
      "^Exchange Name$": "exchange_name",
      "^Principal Officer$": "principal_officer",
      "^Compliance Officer$": "compliance_officer",
      "^Category$": "category",
      "^Type$": "type",
      "^Sponsor$": "sponsor",
      "^Manager$": "manager",
      "^Trustee$": "trustee",
      "^Registrar$": "registrar",
      "^Custodian$": "custodian",
    };

    let isLabel = false;
    for (const [pattern, field] of Object.entries(labelPatterns)) {
      if (new RegExp(pattern, "i").test(line)) {
        // If we encounter "Name" again and have a current record, save it
        if (field === "name" && currentRecord.name) {
          const entity = buildEntityFromRecord(currentRecord);
          if (entity) records.push(entity);
          currentRecord = {};
        }
        currentLabel = field;
        isLabel = true;
        break;
      }
    }

    if (!isLabel && currentLabel) {
      // This line is the value for the current label
      if (currentRecord[currentLabel]) {
        currentRecord[currentLabel] += ", " + line;
      } else {
        currentRecord[currentLabel] = line;
      }
      // Reset label for next iteration (value consumed)
      // But some values span multiple lines (addresses)
      // Only reset if next line is a known label
      const nextLine = lines[i + 1] || "";
      const isNextLabel = Object.keys(labelPatterns).some(p => new RegExp(p, "i").test(nextLine));
      if (isNextLabel) currentLabel = "";
    }
  }

  // Don't forget the last record
  if (currentRecord.name) {
    const entity = buildEntityFromRecord(currentRecord);
    if (entity) records.push(entity);
  }

  return records;
}

function buildEntityFromRecord(rec: Record<string, string>): RawEntity | null {
  const name = rec.name?.trim();
  if (!name || name.length < 2) return null;

  // Extract city/state/pincode from address
  let city = "", state = "", pincode = "";
  const addr = rec.address || rec.correspondence_address || "";
  const pincodeMatch = addr.match(/(\d{6})\s*$/);
  if (pincodeMatch) pincode = pincodeMatch[1];

  // Common pattern: "..., CITY, STATE, PINCODE"
  const parts = addr.split(",").map(p => p.trim());
  if (parts.length >= 3) {
    state = parts[parts.length - 2] || "";
    city = parts[parts.length - 3] || "";
    if (/^\d{6}$/.test(state)) { state = parts[parts.length - 3] || ""; city = parts[parts.length - 4] || ""; }
  }

  return {
    entity_name: name,
    registration_number: rec.registration_number?.trim() || "",
    contact_email: rec.email?.trim() || "",
    contact_phone: rec.telephone?.trim() || "",
    address: addr,
    city: city.replace(/^\d+/, "").trim(),
    state: state.replace(/\d/g, "").trim(),
    pincode,
    raw_data: {
      trade_name: rec.trade_name || "",
      contact_person: rec.contact_person || "",
      validity: rec.validity || "",
      exchange_name: rec.exchange_name || "",
      correspondence_address: rec.correspondence_address || "",
      fax: rec.fax || "",
      principal_officer: rec.principal_officer || "",
      compliance_officer: rec.compliance_officer || "",
      category: rec.category || "",
      sponsor: rec.sponsor || "",
      manager: rec.manager || "",
      source_url: "sebi.gov.in",
    },
  };
}

// Fetch a single SEBI page
async function fetchSebiPage(intmId: number, pageNo: number): Promise<{ html: string; totalRecords: number }> {
  const url = `${SEBI_BASE}?doRecognisedFpi=yes&intmId=${intmId}&pageNo=${pageNo}`;
  const resp = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
  if (!resp.ok) throw new Error(`SEBI returned ${resp.status} for intmId=${intmId} page=${pageNo}`);
  const html = await resp.text();

  // Extract total from "1 to 25 of XXXX records"
  const totalMatch = html.match(/\d+\s+to\s+\d+\s+of\s+(\d+)\s+record/i);
  const totalRecords = totalMatch ? parseInt(totalMatch[1], 10) : 0;

  return { html, totalRecords };
}

// Scrape a single SEBI intermediary type (by intmId)
async function scrapeSebiType(
  supabase: any,
  typeConfig: SebiTypeConfig,
): Promise<ScrapeSummary> {
  const allRecords: RawEntity[] = [];
  const seenRegNums = new Set<string>();
  const PER_PAGE = 25;

  try {
    // Fetch first page to get total count
    const { html: firstHtml, totalRecords } = await fetchSebiPage(typeConfig.intmId, 1);
    const firstRecords = parseSebiCards(firstHtml);
    for (const r of firstRecords) {
      const key = r.registration_number || r.entity_name;
      if (!seenRegNums.has(key)) { seenRegNums.add(key); allRecords.push(r); }
    }

    const totalPages = Math.ceil(totalRecords / PER_PAGE);
    console.log(`[SEBI:${typeConfig.intmId}] ${typeConfig.label}: ${totalRecords} records, ${totalPages} pages`);

    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      try {
        const { html } = await fetchSebiPage(typeConfig.intmId, page);
        const parsed = parseSebiCards(html);
        for (const r of parsed) {
          const key = r.registration_number || r.entity_name;
          if (!seenRegNums.has(key)) { seenRegNums.add(key); allRecords.push(r); }
        }
      } catch (err) {
        console.log(`[SEBI:${typeConfig.intmId}] Page ${page} failed: ${err}`);
      }
      // Rate limit: 300ms between requests
      await new Promise(r => setTimeout(r, 300));
    }
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `Failed to scrape intmId=${typeConfig.intmId}: ${err}` };
  }

  if (allRecords.length === 0) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `No records parsed for ${typeConfig.label}` };
  }

  // Upsert with SEBI sub-source for dedup
  const sourceKey = `sebi`;
  const result = await upsertEntities(supabase, sourceKey, typeConfig.entity_type, typeConfig.registration_category, allRecords);
  return { found: allRecords.length, ...result };
}

// Entry: scrape ALL SEBI types (called when source=sebi with no sebi_type_ids)
// Or scrape specific types via sebi_type_ids array
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
    await new Promise(r => setTimeout(r, 500));
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
// AMFI Scraper (unchanged)
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
    // For SEBI: optionally pass specific type IDs
    const sebiTypeIds = body.sebi_type_ids as number[] | undefined;

    const results: Record<string, ScrapeSummary & { log_id?: string }> = {};

    for (const source of sources) {
      console.log(`\n━━━ Syncing ${source.toUpperCase()} ━━━`);

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
        const opts: Record<string, unknown> = {};
        if (source === "sebi" && sebiTypeIds) opts.sebi_type_ids = sebiTypeIds;

        const summary = await config.scraper(supabase, logId, opts);

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

// Export SEBI_TYPES for reference
export { SEBI_TYPES };
