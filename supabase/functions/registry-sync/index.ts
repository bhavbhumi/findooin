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

const DEFAULT_MAX_PAGES = 8;
const SAFE_EXECUTION_BUDGET_MS = 45_000;

const HEADER_LIKE_NAME_PATTERN = /^(name|reg(?:istration)?\.?\s*no\.?|sr\.?\s*no\.?|s\.?\s*no\.?|category|address|telephone|phone|email)$/i;

const SEBI_OPTIONAL_REGISTRATION_CATEGORIES = new Set([
  "Qualified Depository Participant",
  "Designated Depository Participant",
  "Custodian",
  "KYC Registration Agency",
  "Registrar & Transfer Agent",
  "SCSB - Syndicate ASBA Equity",
  "SCSB - Direct ASBA Equity",
  "SCSB - Issuer Bank UPI",
  "SCSB - Sponsor Bank UPI",
  "UPI Mobile App",
  "SCSB - Direct ASBA Debt",
  "SCSB - Syndicate ASBA Debt",
  "Vault Manager",
]);

const STATE_ALIASES: Record<string, string> = {
  "ANDAMAN AND NICOBAR": "Andaman and Nicobar Islands",
  "ANDAMAN AND NICOBAR ISLANDS": "Andaman and Nicobar Islands",
  "ARUNACHAL PRADESH": "Arunachal Pradesh",
  "ASSAM": "Assam",
  "BIHAR": "Bihar",
  "CHANDIGARH": "Chandigarh",
  "CHHATTISGARH": "Chhattisgarh",
  "DADRA AND NAGAR HAVELI": "Dadra and Nagar Haveli and Daman and Diu",
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": "Dadra and Nagar Haveli and Daman and Diu",
  "DAMAN AND DIU": "Dadra and Nagar Haveli and Daman and Diu",
  "DELHI": "Delhi",
  "GOA": "Goa",
  "GUJARAT": "Gujarat",
  "HARYANA": "Haryana",
  "HIMACHAL PRADESH": "Himachal Pradesh",
  "JAMMU AND KASHMIR": "Jammu and Kashmir",
  "JHARKHAND": "Jharkhand",
  "KARNATAKA": "Karnataka",
  "KERALA": "Kerala",
  "LADAKH": "Ladakh",
  "LAKSHADWEEP": "Lakshadweep",
  "MADHYA PRADESH": "Madhya Pradesh",
  "MAHARASHTRA": "Maharashtra",
  "MANIPUR": "Manipur",
  "MEGHALAYA": "Meghalaya",
  "MIZORAM": "Mizoram",
  "NAGALAND": "Nagaland",
  "ODISHA": "Odisha",
  "ORISSA": "Odisha",
  "PUDUCHERRY": "Puducherry",
  "PONDICHERRY": "Puducherry",
  "PUNJAB": "Punjab",
  "RAJASTHAN": "Rajasthan",
  "SIKKIM": "Sikkim",
  "TAMIL NADU": "Tamil Nadu",
  "TELANGANA": "Telangana",
  "TRIPURA": "Tripura",
  "UTTAR PRADESH": "Uttar Pradesh",
  "UTTARAKHAND": "Uttarakhand",
  "UTTRAKHAND": "Uttarakhand",
  "WEST BENGAL": "West Bengal",
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeEntityName(value: string): string {
  return normalizeWhitespace(value)
    .replace(/\bLTD\.?\b/gi, "LIMITED")
    .replace(/\bPVT\.?\b/gi, "PRIVATE")
    .replace(/\bCO\.?\b/gi, "COMPANY")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/\s+\.$/, "")
    .trim();
}

function isHeaderLikeName(value: string): boolean {
  return HEADER_LIKE_NAME_PATTERN.test(normalizeWhitespace(value));
}

function normalizeEmail(value?: string): string | null {
  if (!value) return null;
  const trimmed = normalizeWhitespace(value).toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return null;
  return trimmed;
}

function normalizePhone(value?: string): string | null {
  if (!value) return null;
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly.length >= 7 ? digitsOnly : null;
}

function normalizeState(value?: string): string | null {
  if (!value) return null;
  const cleaned = normalizeWhitespace(value)
    .replace(/[^a-zA-Z\s]/g, "")
    .toUpperCase();
  if (!cleaned) return null;
  return STATE_ALIASES[cleaned] || null;
}

function normalizeRegistrationNumber(value?: string): string | null {
  if (!value) return null;
  const cleaned = normalizeWhitespace(value)
    .replace(/^REG(?:ISTRATION)?\.?\s*NO\.?\s*:?/i, "")
    .replace(/\s+/g, "")
    .toUpperCase();

  if (!cleaned) return null;
  if (["-", "NA", "N/A", "NIL", "NONE"].includes(cleaned)) return null;
  if (/^\d{1,4}$/.test(cleaned)) return null; // serial numbers are not stable registration IDs

  return cleaned;
}

function extractEmailFromText(value?: string): string | null {
  if (!value) return null;
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? normalizeEmail(match[0]) : null;
}

function extractPhoneFromText(value?: string): string | null {
  if (!value) return null;
  const match = value.match(/(?:\+?\d[\d\s().-]{6,}\d)/);
  return match ? normalizePhone(match[0]) : null;
}

function parseDateToIso(dateRaw?: string): string | null {
  if (!dateRaw) return null;
  const normalized = normalizeWhitespace(dateRaw);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parseValidity(rawValidity: unknown): { code: "P" | "T" | null; from: string | null; to: string | null; raw: string } {
  const raw = typeof rawValidity === "string" ? normalizeWhitespace(rawValidity) : "";
  if (!raw) return { code: null, from: null, to: null, raw: "" };

  const [fromRaw = "", toRaw = ""] = raw.split(/\s+-\s+/, 2);
  const from = parseDateToIso(fromRaw);
  const isPerpetual = /perpetual|permanen/i.test(toRaw || raw);

  if (isPerpetual) {
    return { code: "P", from, to: null, raw };
  }

  const to = parseDateToIso(toRaw || raw);
  return { code: to ? "T" : null, from, to, raw };
}

function createRecordHash(parts: string[]): string {
  let hash = 5381;
  const payload = parts.join("|");
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash) ^ payload.charCodeAt(i);
  }
  return `rh_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function isRegistrationExpected(source: string, regCategory: string): boolean {
  if (source !== "sebi") return false;
  return !SEBI_OPTIONAL_REGISTRATION_CATEGORIES.has(regCategory);
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
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const DB_BATCH_SIZE = 300;

  const chunk = <T>(arr: T[], size: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const dedupedRowsByHash = new Map<string, Record<string, unknown>>();
  const nowIso = new Date().toISOString();

  for (const rec of records) {
    const normalizedName = normalizeEntityName(rec.entity_name || "");
    if (!normalizedName || normalizedName.length < 2 || isHeaderLikeName(normalizedName)) {
      skipped++;
      continue;
    }

    const normalizedRegistration = normalizeRegistrationNumber(rec.registration_number);
    const requiresRegistration = isRegistrationExpected(source, regCategory);

    if (requiresRegistration && !normalizedRegistration) {
      skipped++;
      continue;
    }

    const normalizedEmail = normalizeEmail(rec.contact_email) || extractEmailFromText(rec.address);
    const normalizedPhone = normalizePhone(rec.contact_phone) || extractPhoneFromText(rec.address);
    const validity = parseValidity((rec.raw_data as Record<string, unknown> | undefined)?.validity);
    const sourceId = normalizedRegistration ? `${regCategory}::${normalizedRegistration}` : null;
    const recordHash = createRecordHash([
      source,
      regCategory,
      normalizedName.toLowerCase(),
      normalizedRegistration || "",
      normalizedEmail || "",
      normalizedPhone || "",
    ]);

    if (dedupedRowsByHash.has(recordHash)) {
      skipped++;
      continue;
    }

    dedupedRowsByHash.set(recordHash, {
      entity_name: normalizedName,
      entity_type: entityType,
      registration_number: normalizedRegistration,
      registration_category: regCategory,
      source,
      source_id: sourceId,
      contact_email: normalizedEmail,
      contact_phone: normalizedPhone,
      address: rec.address?.trim() || null,
      city: rec.city?.trim() || null,
      state: normalizeState(rec.state),
      pincode: rec.pincode?.trim() || null,
      status: "Active",
      last_synced_at: nowIso,
      raw_data: {
        ...(rec.raw_data || {}),
        record_hash: recordHash,
        validity_code: validity.code,
        validity_from: validity.from,
        validity_to: validity.to,
        validity_text: validity.raw,
        legacy_source_id: normalizedRegistration,
      },
    });
  }

  const normalizedRows = Array.from(dedupedRowsByHash.values());

  if (normalizedRows.length === 0) {
    return { inserted, updated, skipped };
  }

  // 1) Fast path: rows with registration/source_id (unique on source + source_id)
  const withSourceIdMap = new Map<string, Record<string, unknown>>();
  const withoutSourceIdMap = new Map<string, Record<string, unknown>>();

  for (const row of normalizedRows) {
    const sourceId = String(row.source_id || "").trim();
    if (sourceId) {
      withSourceIdMap.set(sourceId, row);
    } else {
      const dedupKey = `${source}|${regCategory}|${String(row.entity_name).trim().toLowerCase()}`;
      withoutSourceIdMap.set(dedupKey, row);
    }
  }

  const withSourceIdRows = Array.from(withSourceIdMap.values());
  if (withSourceIdRows.length > 0) {
    const sourceIdsSet = new Set<string>();
    for (const row of withSourceIdRows) {
      const canonicalSourceId = String(row.source_id || "").trim();
      const legacySourceId = String((row.raw_data as Record<string, unknown> | undefined)?.legacy_source_id || "").trim();
      if (canonicalSourceId) sourceIdsSet.add(canonicalSourceId);
      if (legacySourceId && legacySourceId !== canonicalSourceId) sourceIdsSet.add(legacySourceId);
    }

    const sourceIds = Array.from(sourceIdsSet);
    const existingBySourceId = new Map<string, string>();

    for (const idsChunk of chunk(sourceIds, DB_BATCH_SIZE)) {
      const { data, error } = await supabase
        .from("registry_entities")
        .select("id, source_id")
        .eq("source", source)
        .in("source_id", idsChunk);

      if (error) throw new Error(`Lookup failed for source IDs: ${error.message}`);
      for (const row of data || []) {
        if (row?.source_id && row?.id) existingBySourceId.set(String(row.source_id), String(row.id));
      }
    }

    const toInsert: Record<string, unknown>[] = [];
    const toUpdateById: Record<string, unknown>[] = [];

    for (const row of withSourceIdRows) {
      const sourceId = String(row.source_id || "");
      const legacySourceId = String((row.raw_data as Record<string, unknown> | undefined)?.legacy_source_id || "");
      const existingId = existingBySourceId.get(sourceId) || existingBySourceId.get(legacySourceId);
      if (existingId) {
        toUpdateById.push({ ...row, id: existingId });
      } else {
        toInsert.push(row);
      }
    }

    for (const rowsChunk of chunk(toInsert, DB_BATCH_SIZE)) {
      const { error } = await supabase.from("registry_entities").insert(rowsChunk);
      if (error) throw new Error(`Insert failed for source IDs: ${error.message}`);
    }

    for (const rowsChunk of chunk(toUpdateById, DB_BATCH_SIZE)) {
      const { error } = await supabase
        .from("registry_entities")
        .upsert(rowsChunk, { onConflict: "id" });
      if (error) throw new Error(`Update failed for source IDs: ${error.message}`);
    }

    inserted += toInsert.length;
    updated += toUpdateById.length;
  }

  // 2) Fallback path: rows without source_id (dedupe via source+category+entity_name)
  const withoutSourceIdRows = Array.from(withoutSourceIdMap.values());
  if (withoutSourceIdRows.length > 0) {
    const entityNames = withoutSourceIdRows.map((r) => String(r.entity_name).trim());
    const existingByName = new Map<string, string>();

    for (const namesChunk of chunk(entityNames, DB_BATCH_SIZE)) {
      const { data, error } = await supabase
        .from("registry_entities")
        .select("id, entity_name")
        .eq("source", source)
        .eq("registration_category", regCategory)
        .in("entity_name", namesChunk);

      if (error) throw new Error(`Lookup failed for name dedupe: ${error.message}`);
      for (const row of data || []) {
        if (row?.entity_name && row?.id) {
          existingByName.set(String(row.entity_name).trim().toLowerCase(), String(row.id));
        }
      }
    }

    const toInsert: Record<string, unknown>[] = [];
    const toUpdateById: Record<string, unknown>[] = [];

    for (const row of withoutSourceIdRows) {
      const key = String(row.entity_name).trim().toLowerCase();
      const existingId = existingByName.get(key);
      if (existingId) {
        toUpdateById.push({ ...row, id: existingId });
      } else {
        toInsert.push(row);
      }
    }

    for (const rowsChunk of chunk(toInsert, DB_BATCH_SIZE)) {
      const { error } = await supabase.from("registry_entities").insert(rowsChunk);
      if (error) throw new Error(`Insert failed for null source_id rows: ${error.message}`);
    }

    for (const rowsChunk of chunk(toUpdateById, DB_BATCH_SIZE)) {
      const { error } = await supabase
        .from("registry_entities")
        .upsert(rowsChunk, { onConflict: "id" });
      if (error) throw new Error(`Update failed for null source_id rows: ${error.message}`);
    }

    inserted += toInsert.length;
    updated += toUpdateById.length;
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

    records.push(mapSebiFieldsToEntity(fields));
  }

  const sanitizedCardRecords = records.filter((r) => {
    const normalizedName = normalizeEntityName(r.entity_name || "");
    return normalizedName.length >= 2 && !isHeaderLikeName(normalizedName);
  });

  // Fallback: try parsing as HTML table if no trustworthy card records found
  if (sanitizedCardRecords.length === 0) {
    const tableRecords = parseSebiTable(html);
    return tableRecords;
  }

  return sanitizedCardRecords;
}

// Maps extracted key-value fields to a RawEntity
function mapSebiFieldsToEntity(fields: Record<string, string>): RawEntity {
  const addr = fields["Address"] || fields["Correspondence Address"] || "";
  let city = "", state = "", pincode = "";
  const pincodeMatch = addr.match(/(\d{6})\s*$/);
  if (pincodeMatch) pincode = pincodeMatch[1];
  const parts = addr.split(",").map(p => p.trim());
  if (parts.length >= 3) {
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];
    const thirdLast = parts[parts.length - 3];
    if (/^\d{6}$/.test(last) || /\d{6}/.test(last)) {
      state = secondLast;
      city = thirdLast;
    } else {
      state = last;
      city = secondLast;
    }
  }

  const email = fields["E-mail"] || fields["Email"] || fields["Correspondence E-mail"] || fields["Correspondence Email"] || "";
  const phone = fields["Telephone"] || fields["Correspondence Telephone"] || fields["Tel."] || "";

  return {
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
  };
}

// Fallback: parse SEBI table-based layouts (used by SCSB, UPI, and some enabler categories)
function parseSebiTable(html: string): RawEntity[] {
  const records: RawEntity[] = [];

  // Find <table> blocks and extract <thead> headers + <tbody> rows
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];

    // Extract headers
    const headers: string[] = [];
    const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
    let thMatch;
    while ((thMatch = thRegex.exec(tableHtml)) !== null) {
      headers.push(decodeHtmlEntities(thMatch[1].replace(/<[^>]*>/g, "").trim()));
    }

    if (headers.length < 2) continue;

    // Find header indices for known fields
    const nameIdx = headers.findIndex(h => /^(name|entity\s*name|bank\s*name|app\s*name|sponsor\s*name)/i.test(h));
    const regIdx = headers.findIndex(h => /reg\.?\s*no|registration/i.test(h));
    const serialIdx = headers.findIndex(h => /^sr\.?\s*no|s\.?\s*no|serial/i.test(h));
    const emailIdx = headers.findIndex(h => /e-?mail/i.test(h));
    const phoneIdx = headers.findIndex(h => /tel|phone|contact/i.test(h));
    const addressIdx = headers.findIndex(h => /address/i.test(h));
    const validityIdx = headers.findIndex(h => /validity/i.test(h));
    const categoryIdx = headers.findIndex(h => /^category$/i.test(h));

    if (nameIdx < 0) continue; // Must have at least a name column

    // Extract rows
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    let isFirstRow = true;

    while ((trMatch = trRegex.exec(tableHtml)) !== null) {
      // Skip header row(s)
      if (trMatch[1].includes("<th")) continue;

      const cells: string[] = [];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let tdMatch;
      while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
        cells.push(decodeHtmlEntities(tdMatch[1].replace(/<[^>]*>/g, "").trim()));
      }

      if (cells.length < 2) continue;
      // Skip if first data row looks like a repeated header
      if (isFirstRow && cells[nameIdx] && /^(name|entity|sr)/i.test(cells[nameIdx])) {
        isFirstRow = false;
        continue;
      }
      isFirstRow = false;

      const name = cells[nameIdx] || "";
      if (name.length < 2 || isHeaderLikeName(name)) continue;

      const address = addressIdx >= 0 ? (cells[addressIdx] || "") : "";
      const validity = validityIdx >= 0 ? (cells[validityIdx] || "") : "";
      const category = categoryIdx >= 0 ? (cells[categoryIdx] || "") : "";
      const email = emailIdx >= 0 ? (cells[emailIdx] || "") : "";
      const phone = phoneIdx >= 0 ? (cells[phoneIdx] || "") : "";

      records.push({
        entity_name: name,
        registration_number: regIdx >= 0 ? (cells[regIdx] || "") : "",
        contact_email: email || extractEmailFromText(address) || "",
        contact_phone: phone || extractPhoneFromText(address) || "",
        address,
        raw_data: {
          all_columns: Object.fromEntries(headers.map((h, i) => [h, cells[i] || ""])),
          serial_no: serialIdx >= 0 ? (cells[serialIdx] || "") : "",
          validity,
          category,
          source_url: "sebi.gov.in",
        },
      });
    }
  }

  // Additional fallback: look for plain-text list patterns (e.g. numbered lists)
  if (records.length === 0) {
    // Some SEBI pages list entities as simple text blocks
    const listItemRegex = /(?:^|\n)\s*\d+[\.\)]\s+([A-Z][A-Za-z\s&().,'/-]{3,}?)(?:\s*[-–]\s*|\s*\()/gm;
    let listMatch;
    while ((listMatch = listItemRegex.exec(html)) !== null) {
      const name = listMatch[1].trim();
      if (name.length > 3 && name.length < 200) {
        records.push({ entity_name: name, raw_data: { source_url: "sebi.gov.in" } });
      }
    }
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
// Supports chunked sync: startPage/maxPages allow resuming from where we left off
async function scrapeSebiType(
  supabase: any,
  typeConfig: SebiTypeConfig,
  startPage: number = 0,
  maxPages: number = 40,
  executionBudgetMs: number = SAFE_EXECUTION_BUDGET_MS,
): Promise<ScrapeSummary & { lastPage?: number; totalPages?: number; partial?: boolean }> {
  const allRecords: RawEntity[] = [];
  const seenKeys = new Set<string>();
  const PER_PAGE = 25;
  const startedAt = Date.now();
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  const addUnique = (records: RawEntity[]) => {
    for (const r of records) {
      const registration = normalizeRegistrationNumber(r.registration_number);
      const key = registration
        ? `reg:${registration}`
        : `name:${normalizeWhitespace(r.entity_name || "").toLowerCase()}`;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        allRecords.push(r);
      }
    }
  };

  let lastPage = Math.max(startPage - 1, -1);
  let totalPages = 1;

  try {
    // Step 1: Fetch initial page (gets session cookie + page 1 data)
    const { html: firstHtml, totalRecords, sessionId } = await fetchSebiInitialPage(typeConfig.intmId);
    totalPages = Math.ceil(totalRecords / PER_PAGE);
    console.log(`[SEBI:${typeConfig.intmId}] ${typeConfig.label}: ${totalRecords} total, ${totalPages} pages, session=${sessionId ? sessionId.substring(0, 8) + "..." : "NONE"}, startPage=${startPage}, maxPages=${maxPages}`);

    if (startPage === 0) {
      const firstRecords = parseSebiCards(firstHtml);
      addUnique(firstRecords);
      lastPage = 0;
      console.log(`[SEBI:${typeConfig.intmId}] Page 1/${totalPages}: ${firstRecords.length} parsed`);

      // Upsert page 1 immediately
      if (firstRecords.length > 0) {
        const pageResult = await upsertEntities(supabase, "sebi", typeConfig.entity_type, typeConfig.registration_category, firstRecords);
        totalInserted += pageResult.inserted;
        totalUpdated += pageResult.updated;
        totalSkipped += pageResult.skipped;
      }
    }

    if (!sessionId) {
      console.warn(`[SEBI:${typeConfig.intmId}] No session cookie found`);
    }

    // Step 2: Fetch pages via AJAX with session cookie
    if (totalPages > 1 && sessionId) {
      let consecutiveFailures = 0;
      const effectiveStart = startPage === 0 ? 1 : startPage;
      const effectiveEnd = Math.min(effectiveStart + maxPages, totalPages);

      for (let pageIdx = effectiveStart; pageIdx < effectiveEnd; pageIdx++) {
        if (Date.now() - startedAt > executionBudgetMs) {
          console.warn(`[SEBI:${typeConfig.intmId}] Safety budget reached, stopping at page ${pageIdx + 1}`);
          break;
        }

        try {
          const html = await fetchSebiAjaxPage(typeConfig.intmId, pageIdx, sessionId);
          const parsed = parseSebiCards(html);

          if (parsed.length === 0) {
            console.warn(`[SEBI:${typeConfig.intmId}] Page ${pageIdx + 1}/${totalPages}: 0 records (html length=${html.length})`);
            consecutiveFailures++;
          } else {
            consecutiveFailures = 0;
            // Upsert each page's records immediately to save progress
            const pageResult = await upsertEntities(supabase, "sebi", typeConfig.entity_type, typeConfig.registration_category, parsed);
            totalInserted += pageResult.inserted;
            totalUpdated += pageResult.updated;
            totalSkipped += pageResult.skipped;
            addUnique(parsed);
            if ((pageIdx + 1) % 10 === 0 || pageIdx === effectiveEnd - 1) {
              console.log(`[SEBI:${typeConfig.intmId}] Page ${pageIdx + 1}/${totalPages}: +${parsed.length}, batch total=${allRecords.length}`);
            }
          }

          lastPage = pageIdx;

          if (consecutiveFailures >= 3) {
            console.warn(`[SEBI:${typeConfig.intmId}] Stopping after 3 consecutive empty pages at page ${pageIdx + 1}`);
            break;
          }
        } catch (err) {
          console.error(`[SEBI:${typeConfig.intmId}] Page ${pageIdx + 1} error: ${err}`);
          consecutiveFailures++;
          lastPage = pageIdx;
          if (consecutiveFailures >= 3) break;
        }
        // Rate limit between pages
        await new Promise(r => setTimeout(r, 120));
      }
    }
  } catch (err) {
    return { found: 0, inserted: 0, updated: 0, skipped: 0, details: `Failed intmId=${typeConfig.intmId}: ${err}` };
  }

  const isPartial = lastPage + 1 < totalPages;
  console.log(`[SEBI:${typeConfig.intmId}] Batch done: ${allRecords.length} records, pages ${startPage}-${lastPage}/${totalPages}${isPartial ? " (PARTIAL — more pages remain)" : ""}`);

  return {
    found: allRecords.length,
    inserted: totalInserted,
    updated: totalUpdated,
    skipped: totalSkipped,
    lastPage,
    totalPages,
    partial: isPartial,
    details: isPartial ? `Partial sync: pages ${startPage}-${lastPage} of ${totalPages}. Resume with startPage=${lastPage + 1}` : undefined,
  };
}

// Entry: scrape ALL or specific SEBI types
async function scrapeSebiAll(supabase: any, _logId: string, opts?: Record<string, unknown>): Promise<ScrapeSummary> {
  const typeIds = opts?.sebi_type_ids as number[] | undefined;
  const startPage = (opts?.start_page as number) || 0;
  const maxPages = (opts?.max_pages as number) || DEFAULT_MAX_PAGES;
  const configs = typeIds
    ? SEBI_TYPES.filter(t => typeIds.includes(t.intmId))
    : SEBI_TYPES;

  const runStartedAt = Date.now();
  const runBudgetMs = SAFE_EXECUTION_BUDGET_MS + 5_000;

  let totalFound = 0, totalInserted = 0, totalUpdated = 0, totalSkipped = 0;
  const typeResults: Record<string, any> = {};
  const partialTypes: { intmId: number; nextPage: number; totalPages: number }[] = [];
  const deferredTypeIds: number[] = [];

  const effectiveMaxPages = configs.length === 1 ? maxPages : Math.min(maxPages, 3);

  for (let index = 0; index < configs.length; index++) {
    const config = configs[index];
    if (Date.now() - runStartedAt > runBudgetMs) {
      deferredTypeIds.push(...configs.slice(index).map((c) => c.intmId));
      console.warn(`[SEBI] Time budget reached. Deferring ${deferredTypeIds.length} type(s).`);
      break;
    }

    console.log(`\n── SEBI Type: ${config.label} (intmId=${config.intmId}) ──`);
    // For single-type syncs, use the provided startPage; for multi-type, always start at 0
    const effectiveStartPage = configs.length === 1 ? startPage : 0;
    const result = await scrapeSebiType(supabase, config, effectiveStartPage, effectiveMaxPages);
    totalFound += result.found;
    totalInserted += result.inserted;
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    typeResults[`${config.intmId}_${config.registration_category}`] = result;
    console.log(`   found=${result.found} ins=${result.inserted} upd=${result.updated} skip=${result.skipped}`);

    if (result.partial && result.lastPage !== undefined && result.totalPages !== undefined) {
      partialTypes.push({ intmId: config.intmId, nextPage: result.lastPage + 1, totalPages: result.totalPages });
    }

    // Breathing room between types
    await new Promise(r => setTimeout(r, 150));
  }

  return {
    found: totalFound,
    inserted: totalInserted,
    updated: totalUpdated,
    skipped: totalSkipped,
    details: JSON.stringify({
      types: typeResults,
      ...(partialTypes.length > 0 ? { partial_types: partialTypes, resume_hint: "Re-trigger with start_page for each partial type" } : {}),
      ...(deferredTypeIds.length > 0 ? { deferred_type_ids: deferredTypeIds, resume_hint: "Re-trigger to continue deferred SEBI types" } : {}),
    }),
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
    const startPage = (body.start_page as number) || 0;
    const maxPages = (body.max_pages as number) || DEFAULT_MAX_PAGES;

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
        if (source === "sebi") {
          if (effectiveSebiTypeIds) opts.sebi_type_ids = effectiveSebiTypeIds;
          if (startPage > 0) opts.start_page = startPage;
          opts.max_pages = maxPages;
        }

        const summary = await config.scraper(supabase, logId, opts);

        await supabase.from("registry_sync_log").update({
          status: summary.found > 0 ? "completed" : "no_data",
          records_found: summary.found,
          records_inserted: summary.inserted,
          records_updated: summary.updated,
          records_skipped: summary.skipped,
          completed_at: new Date().toISOString(),
          metadata: {
            ...(subSource ? { sub_source: subSource, sebi_type_ids: effectiveSebiTypeIds } : {}),
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
