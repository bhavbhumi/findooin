/**
 * Coded Messaging Detector — SEBI 2026 Compliance
 *
 * Detects coded buy/sell references, market manipulation language,
 * and financial "tip" patterns in user-generated content.
 * Used across Opinions, Feed, Comments, and Messages.
 */

export interface DetectionResult {
  flagged: boolean;
  matches: DetectionMatch[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface DetectionMatch {
  pattern: string;
  category: CodedCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  matched: string;
}

export type CodedCategory =
  | 'buy_sell_call'
  | 'price_target'
  | 'guaranteed_returns'
  | 'urgency_fomo'
  | 'coded_emoji'
  | 'pump_dump'
  | 'insider_tip'
  | 'unregistered_advice';

const CATEGORY_LABELS: Record<CodedCategory, string> = {
  buy_sell_call: 'Buy/Sell Call',
  price_target: 'Price Target',
  guaranteed_returns: 'Guaranteed Returns',
  urgency_fomo: 'Urgency / FOMO',
  coded_emoji: 'Coded Emoji Signal',
  pump_dump: 'Pump & Dump Language',
  insider_tip: 'Insider Tip',
  unregistered_advice: 'Unregistered Advice',
};

interface PatternDef {
  regex: RegExp;
  category: CodedCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  label: string;
}

/**
 * Pattern library — curated for the Indian BFSI context.
 * Covers Hindi/English code words commonly used on social media.
 */
const PATTERNS: PatternDef[] = [
  // ─── Buy/Sell Calls ───
  { regex: /\b(buy|sell|short|long)\s+(now|today|immediately|asap|urgently)\b/i, category: 'buy_sell_call', severity: 'critical', label: 'Direct buy/sell instruction' },
  { regex: /\b(strong\s+buy|strong\s+sell|must\s+buy|must\s+sell)\b/i, category: 'buy_sell_call', severity: 'critical', label: 'Emphatic buy/sell call' },
  { regex: /\b(accumulate|offload|dump|exit)\s+(at|near|around|above|below)\b/i, category: 'buy_sell_call', severity: 'high', label: 'Coded buy/sell with price reference' },
  { regex: /\bBTST\b/i, category: 'buy_sell_call', severity: 'high', label: 'BTST (Buy Today Sell Tomorrow)' },
  { regex: /\bSTBT\b/i, category: 'buy_sell_call', severity: 'high', label: 'STBT (Sell Today Buy Tomorrow)' },
  { regex: /\bintraday\s+(pick|tip|call)\b/i, category: 'buy_sell_call', severity: 'high', label: 'Intraday tip' },

  // ─── Price Targets ───
  { regex: /\b(target|tgt|tp)\s*[:=]?\s*₹?\s*\d+/i, category: 'price_target', severity: 'high', label: 'Price target specified' },
  { regex: /\b(stoploss|sl|stop.?loss)\s*[:=]?\s*₹?\s*\d+/i, category: 'price_target', severity: 'high', label: 'Stop-loss level specified' },
  { regex: /\bentry\s*(price|point|level)\s*[:=]?\s*₹?\s*\d+/i, category: 'price_target', severity: 'high', label: 'Entry point specified' },
  { regex: /\b\d+\s*%\s*(return|gain|profit|upside)\b/i, category: 'price_target', severity: 'medium', label: 'Percentage return claim' },

  // ─── Guaranteed Returns ───
  { regex: /\bguaranteed\s+(return|profit|income|gain)/i, category: 'guaranteed_returns', severity: 'critical', label: 'Guaranteed returns promise' },
  { regex: /\b(risk[\s-]*free|no[\s-]*risk|zero[\s-]*risk)\s*(return|investment|profit)/i, category: 'guaranteed_returns', severity: 'critical', label: 'Risk-free return promise' },
  { regex: /\b(assured|certain|fixed)\s+(return|profit|income)/i, category: 'guaranteed_returns', severity: 'critical', label: 'Assured return claim' },
  { regex: /\bdouble\s+your\s+(money|investment|capital)/i, category: 'guaranteed_returns', severity: 'critical', label: 'Double money promise' },

  // ─── Urgency / FOMO ───
  { regex: /\b(last\s+chance|don'?t\s+miss|hurry|limited\s+time|act\s+fast)\b/i, category: 'urgency_fomo', severity: 'medium', label: 'Urgency language' },
  { regex: /\b(rocket|moon|to\s+the\s+moon|lambo|100x|10x|1000x)\b/i, category: 'urgency_fomo', severity: 'medium', label: 'Hype / moon language' },
  { regex: /\bmultibagger\b/i, category: 'urgency_fomo', severity: 'medium', label: 'Multibagger claim' },
  { regex: /\b(jackpot|wealth\s+creator|money\s+machine)\b/i, category: 'urgency_fomo', severity: 'medium', label: 'Exaggerated wealth claim' },

  // ─── Coded Emoji Signals ───
  { regex: /🚀{2,}/, category: 'coded_emoji', severity: 'low', label: 'Multiple rocket emojis (buy signal)' },
  { regex: /📈\s*(🔥|💰|💎)+/, category: 'coded_emoji', severity: 'low', label: 'Chart + fire/money emojis (hype signal)' },
  { regex: /💰{3,}/, category: 'coded_emoji', severity: 'low', label: 'Multiple money bag emojis' },
  { regex: /🐂|🐻/, category: 'coded_emoji', severity: 'low', label: 'Bull/bear emoji (directional signal)' },

  // ─── Pump & Dump ───
  { regex: /\b(penny\s+stock|smallcap\s+gem|hidden\s+gem|next\s+big\s+thing)\b/i, category: 'pump_dump', severity: 'high', label: 'Pump language for small stocks' },
  { regex: /\b(operator\s+driven|operator\s+stock|satta|circuit)\b/i, category: 'pump_dump', severity: 'high', label: 'Market manipulation reference' },
  { regex: /\b(block\s+deal|bulk\s+deal)\s+(confirmed|expected|coming)\b/i, category: 'pump_dump', severity: 'medium', label: 'Unverified deal claim' },

  // ─── Insider Tip ───
  { regex: /\b(insider|inside\s+info|board\s+decision|confidential)\s+(tip|information|news|source)\b/i, category: 'insider_tip', severity: 'critical', label: 'Insider information claim' },
  { regex: /\b(my\s+source|reliable\s+source|bird\s+told|khabar)\b/i, category: 'insider_tip', severity: 'high', label: 'Unverified source claim' },

  // ─── Unregistered Advice ───
  { regex: /\b(I\s+recommend|my\s+recommendation|you\s+should\s+(buy|sell|invest))\b/i, category: 'unregistered_advice', severity: 'medium', label: 'Personal investment recommendation' },
  { regex: /\b(invest\s+in|put\s+money\s+in|allocate\s+to)\s+[A-Z]{2,}/i, category: 'unregistered_advice', severity: 'medium', label: 'Direct investment advice with ticker' },
  { regex: /\b(portfolio\s+allocation|asset\s+allocation)\s*[:=]/i, category: 'unregistered_advice', severity: 'medium', label: 'Specific allocation advice' },
];

/**
 * Scan text content for coded messaging patterns.
 */
export function detectCodedMessaging(text: string): DetectionResult {
  if (!text || text.trim().length === 0) {
    return { flagged: false, matches: [], severity: 'none', summary: '' };
  }

  const matches: DetectionMatch[] = [];

  for (const pattern of PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      matches.push({
        pattern: pattern.label,
        category: pattern.category,
        severity: pattern.severity,
        matched: match[0],
      });
    }
  }

  if (matches.length === 0) {
    return { flagged: false, matches: [], severity: 'none', summary: '' };
  }

  // Overall severity = highest severity among matches
  const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  const maxSeverity = matches.reduce((max, m) => {
    return severityOrder[m.severity] > severityOrder[max] ? m.severity : max;
  }, 'low' as 'low' | 'medium' | 'high' | 'critical');

  const categories = [...new Set(matches.map(m => CATEGORY_LABELS[m.category]))];
  const summary = `${matches.length} pattern(s) detected: ${categories.join(', ')}`;

  return { flagged: true, matches, severity: maxSeverity, summary };
}

/**
 * Get human-readable category label.
 */
export function getCategoryLabel(category: CodedCategory): string {
  return CATEGORY_LABELS[category] || category;
}
