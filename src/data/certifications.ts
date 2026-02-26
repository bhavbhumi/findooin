/**
 * Curated Indian Financial Ecosystem Certifications & Licenses.
 * Grouped by regulatory body / category.
 */

export interface CertificationEntry {
  id: string;
  name: string;
  shortName: string;
  category: string;
  issuingBody: string;
}

export const CERTIFICATIONS: CertificationEntry[] = [
  // ─── NISM Certifications (SEBI mandated) ───
  { id: "nism-va", name: "NISM Series V-A: Mutual Fund Distributors", shortName: "NISM V-A", category: "NISM", issuingBody: "NISM" },
  { id: "nism-vb", name: "NISM Series V-B: Mutual Fund Foundation", shortName: "NISM V-B", category: "NISM", issuingBody: "NISM" },
  { id: "nism-viii", name: "NISM Series VIII: Equity Derivatives", shortName: "NISM VIII", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xa", name: "NISM Series X-A: Investment Adviser (Level 1)", shortName: "NISM X-A", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xb", name: "NISM Series X-B: Investment Adviser (Level 2)", shortName: "NISM X-B", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xv", name: "NISM Series XV: Research Analyst", shortName: "NISM XV", category: "NISM", issuingBody: "NISM" },
  { id: "nism-vi", name: "NISM Series VI: Depository Operations", shortName: "NISM VI", category: "NISM", issuingBody: "NISM" },
  { id: "nism-vii", name: "NISM Series VII: Securities Operations & Risk Management", shortName: "NISM VII", category: "NISM", issuingBody: "NISM" },
  { id: "nism-ix", name: "NISM Series IX: Merchant Banking", shortName: "NISM IX", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xii", name: "NISM Series XII: Securities Markets Foundation", shortName: "NISM XII", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xiii", name: "NISM Series XIII: Common Derivatives", shortName: "NISM XIII", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xiv", name: "NISM Series XIV: Internal Auditors for Stock Brokers", shortName: "NISM XIV", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xvi", name: "NISM Series XVI: Commodity Derivatives", shortName: "NISM XVI", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xxi-a", name: "NISM Series XXI-A: Portfolio Managers", shortName: "NISM XXI-A", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xxi-b", name: "NISM Series XXI-B: Portfolio Managers", shortName: "NISM XXI-B", category: "NISM", issuingBody: "NISM" },
  { id: "nism-xxii", name: "NISM Series XXII: AIF Managers", shortName: "NISM XXII", category: "NISM", issuingBody: "NISM" },

  // ─── SEBI Registrations ───
  { id: "sebi-ria", name: "SEBI Registered Investment Adviser (RIA)", shortName: "SEBI RIA", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-ra", name: "SEBI Registered Research Analyst", shortName: "SEBI RA", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-amc", name: "SEBI Registered AMC", shortName: "SEBI AMC", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-pms", name: "SEBI Registered Portfolio Manager", shortName: "SEBI PMS", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-aif", name: "SEBI Registered AIF Manager", shortName: "SEBI AIF", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-stock-broker", name: "SEBI Registered Stock Broker", shortName: "Stock Broker", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-dp", name: "SEBI Registered Depository Participant", shortName: "SEBI DP", category: "SEBI", issuingBody: "SEBI" },
  { id: "sebi-merchant-banker", name: "SEBI Registered Merchant Banker", shortName: "Merchant Banker", category: "SEBI", issuingBody: "SEBI" },

  // ─── AMFI ───
  { id: "amfi-arn", name: "AMFI Registered Mutual Fund Distributor (ARN)", shortName: "AMFI ARN", category: "AMFI", issuingBody: "AMFI" },

  // ─── Professional Qualifications ───
  { id: "ca-icai", name: "Chartered Accountant (ICAI)", shortName: "CA", category: "Professional", issuingBody: "ICAI" },
  { id: "cs-icsi", name: "Company Secretary (ICSI)", shortName: "CS", category: "Professional", issuingBody: "ICSI" },
  { id: "cma-icmai", name: "Cost & Management Accountant (ICMAI)", shortName: "CMA", category: "Professional", issuingBody: "ICMAI" },
  { id: "cfa", name: "CFA Charterholder", shortName: "CFA", category: "Professional", issuingBody: "CFA Institute" },
  { id: "cfa-l1", name: "CFA Level I", shortName: "CFA L1", category: "Professional", issuingBody: "CFA Institute" },
  { id: "cfa-l2", name: "CFA Level II", shortName: "CFA L2", category: "Professional", issuingBody: "CFA Institute" },
  { id: "cfa-l3", name: "CFA Level III", shortName: "CFA L3", category: "Professional", issuingBody: "CFA Institute" },
  { id: "cfp", name: "Certified Financial Planner (CFP)", shortName: "CFP", category: "Professional", issuingBody: "FPSB India" },
  { id: "frm", name: "Financial Risk Manager (FRM)", shortName: "FRM", category: "Professional", issuingBody: "GARP" },
  { id: "caia", name: "Chartered Alternative Investment Analyst", shortName: "CAIA", category: "Professional", issuingBody: "CAIA Association" },

  // ─── Insurance ───
  { id: "irdai-agent", name: "IRDAI Licensed Insurance Agent", shortName: "IRDAI Agent", category: "Insurance", issuingBody: "IRDAI" },
  { id: "irdai-broker", name: "IRDAI Licensed Insurance Broker", shortName: "IRDAI Broker", category: "Insurance", issuingBody: "IRDAI" },
  { id: "irdai-surveyor", name: "IRDAI Licensed Surveyor", shortName: "IRDAI Surveyor", category: "Insurance", issuingBody: "IRDAI" },
  { id: "licentiate", name: "Licentiate (Insurance Institute of India)", shortName: "Licentiate", category: "Insurance", issuingBody: "III" },
  { id: "associate-iii", name: "Associate (Insurance Institute of India)", shortName: "Associate III", category: "Insurance", issuingBody: "III" },
  { id: "fellow-iii", name: "Fellow (Insurance Institute of India)", shortName: "Fellow III", category: "Insurance", issuingBody: "III" },

  // ─── Banking & NBFC ───
  { id: "caiib", name: "Certified Associate of Indian Institute of Bankers", shortName: "CAIIB", category: "Banking", issuingBody: "IIBF" },
  { id: "jaiib", name: "Junior Associate of Indian Institute of Bankers", shortName: "JAIIB", category: "Banking", issuingBody: "IIBF" },
  { id: "rbi-nbfc", name: "RBI Registered NBFC", shortName: "RBI NBFC", category: "Banking", issuingBody: "RBI" },

  // ─── Pension ───
  { id: "pfrda-pop", name: "PFRDA Registered Point of Presence (PoP)", shortName: "PFRDA PoP", category: "Pension", issuingBody: "PFRDA" },

  // ─── Exchange Memberships ───
  { id: "nse-member", name: "NSE Trading Member", shortName: "NSE Member", category: "Exchange", issuingBody: "NSE" },
  { id: "bse-member", name: "BSE Trading Member", shortName: "BSE Member", category: "Exchange", issuingBody: "BSE" },
  { id: "mcx-member", name: "MCX Trading Member", shortName: "MCX Member", category: "Exchange", issuingBody: "MCX" },
  { id: "ncdex-member", name: "NCDEX Trading Member", shortName: "NCDEX Member", category: "Exchange", issuingBody: "NCDEX" },
];

/** Get certifications grouped by category */
export function getCertificationsByCategory(): Record<string, CertificationEntry[]> {
  const grouped: Record<string, CertificationEntry[]> = {};
  for (const cert of CERTIFICATIONS) {
    if (!grouped[cert.category]) grouped[cert.category] = [];
    grouped[cert.category].push(cert);
  }
  return grouped;
}

/** Search certifications */
export function searchCertifications(query: string): CertificationEntry[] {
  if (!query.trim()) return CERTIFICATIONS;
  const q = query.toLowerCase();
  return CERTIFICATIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.issuingBody.toLowerCase().includes(q)
  );
}
