/**
 * Title Case formatter with financial abbreviation awareness.
 * Capitalizes first letter of each word, preserves known acronyms.
 */

const FINANCIAL_ABBREVIATIONS = new Set([
  "HDFC", "ICICI", "IDFC", "IDBI", "SBI", "PNB", "BOB", "BOI", "UCO",
  "SEBI", "RBI", "IRDAI", "AMFI", "PFRDA", "NPS", "NSE", "BSE", "MCX",
  "NSDL", "CDSL", "CAMS", "KRA", "RTA", "ASBA", "ESG", "NBFC",
  "AMC", "PMS", "AIF", "FII", "DII", "NRI", "HNI", "MF", "MFD",
  "RIA", "CA", "CS", "CFA", "CFP", "FRM", "FPSB", "NISM",
  "LLP", "PVT", "LTD", "LLC", "INC", "IPO", "FPO", "OFS",
  "GSTIN", "CIN", "PAN", "TAN", "DIN", "DRHP", "SARFAESI",
  "UTI", "GIC", "LIC", "EPFO", "NHB", "NABARD", "SIDBI", "EXIM",
  "II", "III", "IV", "JR", "SR",
]);

/**
 * Formats a name to Title Case with financial abbreviation awareness.
 * - "rajesh kumar" → "Rajesh Kumar"
 * - "hdfc securities pvt ltd" → "HDFC Securities Pvt Ltd"  
 * - "icici prudential amc" → "ICICI Prudential AMC"
 */
export function formatName(raw: string): string {
  if (!raw || !raw.trim()) return raw;

  return raw
    .trim()
    .replace(/\s+/g, " ") // collapse multiple spaces
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (FINANCIAL_ABBREVIATIONS.has(upper)) return upper;
      if (word.length === 0) return word;
      // Handle hyphenated names: "sharma-patel" → "Sharma-Patel"
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => {
            const partUpper = part.toUpperCase();
            if (FINANCIAL_ABBREVIATIONS.has(partUpper)) return partUpper;
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("-");
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Validates a name meets minimum quality standards.
 * Returns error message or null if valid.
 */
export function validateName(name: string): string | null {
  const trimmed = (name || "").trim();
  if (trimmed.length < 3) return "Name must be at least 3 characters";
  if (trimmed.length > 100) return "Name must be under 100 characters";
  if (/^\d+$/.test(trimmed)) return "Name cannot be only numbers";
  if (/^(.)\1+$/.test(trimmed)) return "Please enter a valid name";
  if (/^(test|asdf|qwerty|abc|xyz|user|admin|name)/i.test(trimmed)) return "Please enter your real name";
  return null;
}

/**
 * Validates PAN format (Indian Permanent Account Number).
 * Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
 */
export function validatePAN(pan: string): string | null {
  const trimmed = (pan || "").trim().toUpperCase();
  if (!trimmed) return "PAN is required";
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(trimmed)) return "Invalid PAN format (e.g. ABCDE1234F)";
  return null;
}
