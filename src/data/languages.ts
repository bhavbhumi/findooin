/**
 * Global languages list with proficiency levels.
 */

export interface LanguageEntry {
  code: string;
  name: string;
  nativeName: string;
  region: "Indian" | "European" | "East Asian" | "Middle Eastern" | "African" | "Other";
}

export type LanguageProficiency = "basic" | "conversational" | "professional" | "fluent" | "native";

export interface UserLanguage {
  code: string;
  name: string;
  proficiency: LanguageProficiency;
  isMotherTongue: boolean;
}

export const PROFICIENCY_LEVELS: { value: LanguageProficiency; label: string; description: string }[] = [
  { value: "basic", label: "Basic", description: "Can understand simple phrases" },
  { value: "conversational", label: "Conversational", description: "Can hold basic conversations" },
  { value: "professional", label: "Professional", description: "Can work professionally in this language" },
  { value: "fluent", label: "Fluent", description: "Can speak and write with ease" },
  { value: "native", label: "Native", description: "Native or bilingual proficiency" },
];

export const LANGUAGES: LanguageEntry[] = [
  // ─── Indian Languages ───
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "Indian" },
  { code: "en", name: "English", nativeName: "English", region: "Indian" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "Indian" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "Indian" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "Indian" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "Indian" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "Indian" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "Indian" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "Indian" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "Indian" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "Indian" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", region: "Indian" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "Indian" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", region: "Indian" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", region: "Indian" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर", region: "Indian" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", region: "Indian" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", region: "Indian" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", region: "Indian" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", region: "Indian" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", region: "Indian" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", region: "Indian" },
  { code: "bo", name: "Bodo", nativeName: "बड़ो", region: "Indian" },
  { code: "raj", name: "Rajasthani", nativeName: "राजस्थानी", region: "Indian" },
  { code: "bh", name: "Bhojpuri", nativeName: "भोजपुरी", region: "Indian" },
  { code: "tcy", name: "Tulu", nativeName: "ತುಳು", region: "Indian" },
  { code: "gom", name: "Goan Konkani", nativeName: "गोंयची कोंकणी", region: "Indian" },

  // ─── European Languages ───
  { code: "fr", name: "French", nativeName: "Français", region: "European" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "European" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "European" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "European" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "European" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "European" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "European" },
  { code: "pl", name: "Polish", nativeName: "Polski", region: "European" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", region: "European" },
  { code: "da", name: "Danish", nativeName: "Dansk", region: "European" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", region: "European" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", region: "European" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", region: "European" },
  { code: "cs", name: "Czech", nativeName: "Čeština", region: "European" },
  { code: "ro", name: "Romanian", nativeName: "Română", region: "European" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", region: "European" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", region: "European" },

  // ─── East Asian Languages ───
  { code: "zh", name: "Mandarin Chinese", nativeName: "普通话", region: "East Asian" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "East Asian" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "East Asian" },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "East Asian" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", region: "East Asian" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", region: "East Asian" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "East Asian" },
  { code: "tl", name: "Filipino", nativeName: "Filipino", region: "East Asian" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာစာ", region: "East Asian" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ", region: "East Asian" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", region: "East Asian" },

  // ─── Middle Eastern Languages ───
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "Middle Eastern" },
  { code: "fa", name: "Persian", nativeName: "فارسی", region: "Middle Eastern" },
  { code: "he", name: "Hebrew", nativeName: "עברית", region: "Middle Eastern" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "Middle Eastern" },

  // ─── African Languages ───
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", region: "African" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", region: "African" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", region: "African" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá", region: "African" },
  { code: "ha", name: "Hausa", nativeName: "هَوُسَ", region: "African" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", region: "African" },
];

/** Search languages by name or native name */
export function searchLanguages(query: string): LanguageEntry[] {
  if (!query.trim()) return LANGUAGES;
  const q = query.toLowerCase();
  return LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase() === q
  );
}
