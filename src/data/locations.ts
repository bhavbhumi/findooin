/**
 * Curated global location list — all countries, all Indian states/UTs,
 * major US/UK/Canada/Australia states, and key cities.
 */

export interface LocationEntry {
  city: string;
  state: string;
  country: string;
  label: string;
  type: "city" | "state" | "country";
}

function c(city: string, state: string, country: string): [string, string, string, "city"] {
  return [city, state, country, "city"];
}
function s(state: string, country: string): [string, string, string, "state"] {
  return ["", state, country, "state"];
}
function co(country: string): [string, string, string, "country"] {
  return ["", "", country, "country"];
}

const raw: [string, string, string, "city" | "state" | "country"][] = [
  // ═══════════════════════════════════════
  // COUNTRIES (all major + relevant)
  // ═══════════════════════════════════════
  ...[
    "India", "United States", "United Kingdom", "Canada", "Australia",
    "Singapore", "Hong Kong", "UAE", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Oman",
    "Germany", "France", "Netherlands", "Switzerland", "Luxembourg", "Ireland",
    "Italy", "Spain", "Portugal", "Sweden", "Denmark", "Norway", "Finland",
    "Austria", "Belgium", "Poland", "Czech Republic", "Romania", "Hungary",
    "Greece", "Turkey", "Russia", "Ukraine",
    "Japan", "China", "South Korea", "Taiwan", "Thailand", "Vietnam",
    "Indonesia", "Malaysia", "Philippines", "Myanmar", "Cambodia",
    "Sri Lanka", "Bangladesh", "Nepal", "Pakistan", "Afghanistan",
    "Israel", "Iran", "Iraq", "Jordan", "Lebanon", "Egypt",
    "South Africa", "Nigeria", "Kenya", "Ghana", "Tanzania", "Ethiopia",
    "Morocco", "Tunisia", "Algeria", "Senegal", "Uganda", "Rwanda",
    "Mozambique", "Zimbabwe", "Botswana", "Mauritius", "Madagascar",
    "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Mexico",
    "Ecuador", "Uruguay", "Venezuela", "Paraguay", "Bolivia",
    "Costa Rica", "Panama", "Dominican Republic", "Jamaica", "Trinidad and Tobago",
    "New Zealand", "Fiji", "Papua New Guinea",
    "Maldives", "Bhutan", "Mongolia", "Kazakhstan", "Uzbekistan",
    "Georgia", "Armenia", "Azerbaijan",
    "Serbia", "Croatia", "Slovenia", "Bulgaria", "Slovakia",
    "Estonia", "Latvia", "Lithuania", "Iceland", "Malta", "Cyprus",
  ].map((c) => co(c) as [string, string, string, "country"]),

  // ═══════════════════════════════════════
  // INDIA — All 28 States + 8 UTs
  // ═══════════════════════════════════════
  ...[
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // UTs
    "Delhi", "Chandigarh", "Puducherry", "Jammu & Kashmir", "Ladakh",
    "Andaman & Nicobar Islands", "Lakshadweep", "Dadra & Nagar Haveli and Daman & Diu",
  ].map((st) => s(st, "India") as [string, string, string, "state"]),

  // Key Indian Cities
  c("Mumbai", "Maharashtra", "India"),
  c("Delhi", "Delhi", "India"),
  c("Bengaluru", "Karnataka", "India"),
  c("Hyderabad", "Telangana", "India"),
  c("Chennai", "Tamil Nadu", "India"),
  c("Kolkata", "West Bengal", "India"),
  c("Pune", "Maharashtra", "India"),
  c("Ahmedabad", "Gujarat", "India"),
  c("Jaipur", "Rajasthan", "India"),
  c("Lucknow", "Uttar Pradesh", "India"),
  c("Surat", "Gujarat", "India"),
  c("Chandigarh", "Chandigarh", "India"),
  c("Indore", "Madhya Pradesh", "India"),
  c("Bhopal", "Madhya Pradesh", "India"),
  c("Nagpur", "Maharashtra", "India"),
  c("Vadodara", "Gujarat", "India"),
  c("Coimbatore", "Tamil Nadu", "India"),
  c("Kochi", "Kerala", "India"),
  c("Thiruvananthapuram", "Kerala", "India"),
  c("Visakhapatnam", "Andhra Pradesh", "India"),
  c("Patna", "Bihar", "India"),
  c("Guwahati", "Assam", "India"),
  c("Noida", "Uttar Pradesh", "India"),
  c("Gurugram", "Haryana", "India"),
  c("Nashik", "Maharashtra", "India"),
  c("Rajkot", "Gujarat", "India"),
  c("Ranchi", "Jharkhand", "India"),
  c("Bhubaneswar", "Odisha", "India"),
  c("Dehradun", "Uttarakhand", "India"),
  c("Mangaluru", "Karnataka", "India"),
  c("Mysuru", "Karnataka", "India"),
  c("Amritsar", "Punjab", "India"),
  c("Ludhiana", "Punjab", "India"),
  c("Agra", "Uttar Pradesh", "India"),
  c("Varanasi", "Uttar Pradesh", "India"),
  c("Kanpur", "Uttar Pradesh", "India"),
  c("Jodhpur", "Rajasthan", "India"),
  c("Udaipur", "Rajasthan", "India"),
  c("Raipur", "Chhattisgarh", "India"),
  c("Madurai", "Tamil Nadu", "India"),
  c("Aurangabad", "Maharashtra", "India"),
  c("Panaji", "Goa", "India"),
  c("Shimla", "Himachal Pradesh", "India"),
  c("Gangtok", "Sikkim", "India"),
  c("Imphal", "Manipur", "India"),
  c("Shillong", "Meghalaya", "India"),
  c("Aizawl", "Mizoram", "India"),
  c("Itanagar", "Arunachal Pradesh", "India"),
  c("Kohima", "Nagaland", "India"),
  c("Agartala", "Tripura", "India"),
  c("GIFT City", "Gujarat", "India"),
  c("Thane", "Maharashtra", "India"),
  c("Navi Mumbai", "Maharashtra", "India"),
  c("Faridabad", "Haryana", "India"),
  c("Ghaziabad", "Uttar Pradesh", "India"),
  c("Vijayawada", "Andhra Pradesh", "India"),
  c("Tiruchirappalli", "Tamil Nadu", "India"),
  c("Salem", "Tamil Nadu", "India"),
  c("Hubli-Dharwad", "Karnataka", "India"),
  c("Belgaum", "Karnataka", "India"),
  c("Jalandhar", "Punjab", "India"),
  c("Gwalior", "Madhya Pradesh", "India"),
  c("Jamshedpur", "Jharkhand", "India"),
  c("Dhanbad", "Jharkhand", "India"),
  c("Bareilly", "Uttar Pradesh", "India"),
  c("Meerut", "Uttar Pradesh", "India"),
  c("Aligarh", "Uttar Pradesh", "India"),
  c("Jammu", "Jammu & Kashmir", "India"),
  c("Srinagar", "Jammu & Kashmir", "India"),
  c("Leh", "Ladakh", "India"),

  // ═══════════════════════════════════════
  // UNITED STATES — All 50 States + DC
  // ═══════════════════════════════════════
  ...[
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
    "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
    "Wisconsin", "Wyoming", "District of Columbia",
  ].map((st) => s(st, "United States") as [string, string, string, "state"]),

  // Key US Cities
  c("New York", "New York", "United States"),
  c("San Francisco", "California", "United States"),
  c("Los Angeles", "California", "United States"),
  c("Chicago", "Illinois", "United States"),
  c("Houston", "Texas", "United States"),
  c("Dallas", "Texas", "United States"),
  c("Boston", "Massachusetts", "United States"),
  c("Seattle", "Washington", "United States"),
  c("Miami", "Florida", "United States"),
  c("Atlanta", "Georgia", "United States"),
  c("Denver", "Colorado", "United States"),
  c("Washington", "D.C.", "United States"),
  c("Philadelphia", "Pennsylvania", "United States"),
  c("Phoenix", "Arizona", "United States"),
  c("San Diego", "California", "United States"),
  c("Austin", "Texas", "United States"),
  c("Charlotte", "North Carolina", "United States"),
  c("Minneapolis", "Minnesota", "United States"),
  c("Detroit", "Michigan", "United States"),
  c("Portland", "Oregon", "United States"),

  // ═══════════════════════════════════════
  // UNITED KINGDOM — Nations + key regions
  // ═══════════════════════════════════════
  ...[
    "England", "Scotland", "Wales", "Northern Ireland",
  ].map((st) => s(st, "United Kingdom") as [string, string, string, "state"]),

  c("London", "England", "United Kingdom"),
  c("Manchester", "England", "United Kingdom"),
  c("Birmingham", "England", "United Kingdom"),
  c("Edinburgh", "Scotland", "United Kingdom"),
  c("Glasgow", "Scotland", "United Kingdom"),
  c("Bristol", "England", "United Kingdom"),
  c("Leeds", "England", "United Kingdom"),
  c("Liverpool", "England", "United Kingdom"),
  c("Cardiff", "Wales", "United Kingdom"),
  c("Belfast", "Northern Ireland", "United Kingdom"),

  // ═══════════════════════════════════════
  // CANADA — All Provinces & Territories
  // ═══════════════════════════════════════
  ...[
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
  ].map((st) => s(st, "Canada") as [string, string, string, "state"]),

  c("Toronto", "Ontario", "Canada"),
  c("Vancouver", "British Columbia", "Canada"),
  c("Montreal", "Quebec", "Canada"),
  c("Calgary", "Alberta", "Canada"),
  c("Ottawa", "Ontario", "Canada"),

  // ═══════════════════════════════════════
  // AUSTRALIA — All States & Territories
  // ═══════════════════════════════════════
  ...[
    "New South Wales", "Victoria", "Queensland", "Western Australia",
    "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory",
  ].map((st) => s(st, "Australia") as [string, string, string, "state"]),

  c("Sydney", "New South Wales", "Australia"),
  c("Melbourne", "Victoria", "Australia"),
  c("Brisbane", "Queensland", "Australia"),
  c("Perth", "Western Australia", "Australia"),

  // ═══════════════════════════════════════
  // UAE — Emirates
  // ═══════════════════════════════════════
  ...[
    "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
  ].map((st) => s(st, "UAE") as [string, string, string, "state"]),

  c("Dubai", "Dubai", "UAE"),
  c("Abu Dhabi", "Abu Dhabi", "UAE"),
  c("Sharjah", "Sharjah", "UAE"),
  c("DIFC", "Dubai", "UAE"),

  // ═══════════════════════════════════════
  // City-states & key global cities
  // ═══════════════════════════════════════
  c("Singapore", "", "Singapore"),
  c("Hong Kong", "", "Hong Kong"),

  // Europe
  c("Frankfurt", "Hesse", "Germany"),
  c("Berlin", "Berlin", "Germany"),
  c("Munich", "Bavaria", "Germany"),
  c("Paris", "Île-de-France", "France"),
  c("Amsterdam", "North Holland", "Netherlands"),
  c("Zurich", "Zurich", "Switzerland"),
  c("Geneva", "Geneva", "Switzerland"),
  c("Luxembourg", "", "Luxembourg"),
  c("Dublin", "Leinster", "Ireland"),
  c("Milan", "Lombardy", "Italy"),
  c("Madrid", "Madrid", "Spain"),
  c("Barcelona", "Catalonia", "Spain"),
  c("Stockholm", "Stockholm", "Sweden"),
  c("Copenhagen", "Capital Region", "Denmark"),
  c("Oslo", "Oslo", "Norway"),
  c("Helsinki", "Uusimaa", "Finland"),
  c("Vienna", "Vienna", "Austria"),
  c("Brussels", "Brussels", "Belgium"),
  c("Warsaw", "Masovia", "Poland"),
  c("Prague", "Prague", "Czech Republic"),
  c("Lisbon", "Lisbon", "Portugal"),
  c("Athens", "Attica", "Greece"),
  c("Bucharest", "Bucharest", "Romania"),
  c("Budapest", "Budapest", "Hungary"),
  c("Istanbul", "Istanbul", "Turkey"),
  c("Moscow", "Moscow", "Russia"),

  // Asia
  c("Tokyo", "Tokyo", "Japan"),
  c("Shanghai", "Shanghai", "China"),
  c("Beijing", "Beijing", "China"),
  c("Shenzhen", "Guangdong", "China"),
  c("Seoul", "Seoul", "South Korea"),
  c("Bangkok", "Bangkok", "Thailand"),
  c("Jakarta", "Jakarta", "Indonesia"),
  c("Kuala Lumpur", "Federal Territory", "Malaysia"),
  c("Manila", "Metro Manila", "Philippines"),
  c("Taipei", "Taipei", "Taiwan"),
  c("Ho Chi Minh City", "HCMC", "Vietnam"),
  c("Colombo", "Western", "Sri Lanka"),
  c("Dhaka", "Dhaka", "Bangladesh"),
  c("Kathmandu", "Bagmati", "Nepal"),
  c("Karachi", "Sindh", "Pakistan"),
  c("Lahore", "Punjab", "Pakistan"),
  c("Islamabad", "Capital Territory", "Pakistan"),

  // Middle East & Africa
  c("Riyadh", "Riyadh", "Saudi Arabia"),
  c("Jeddah", "Makkah", "Saudi Arabia"),
  c("Doha", "Doha", "Qatar"),
  c("Manama", "Capital", "Bahrain"),
  c("Kuwait City", "Al Asimah", "Kuwait"),
  c("Muscat", "Muscat", "Oman"),
  c("Tel Aviv", "Tel Aviv", "Israel"),
  c("Johannesburg", "Gauteng", "South Africa"),
  c("Cape Town", "Western Cape", "South Africa"),
  c("Lagos", "Lagos", "Nigeria"),
  c("Nairobi", "Nairobi", "Kenya"),
  c("Cairo", "Cairo", "Egypt"),
  c("Casablanca", "Casablanca-Settat", "Morocco"),
  c("Accra", "Greater Accra", "Ghana"),
  c("Dar es Salaam", "Dar es Salaam", "Tanzania"),
  c("Addis Ababa", "Addis Ababa", "Ethiopia"),
  c("Port Louis", "", "Mauritius"),

  // South America
  c("São Paulo", "São Paulo", "Brazil"),
  c("Rio de Janeiro", "Rio de Janeiro", "Brazil"),
  c("Buenos Aires", "Buenos Aires", "Argentina"),
  c("Santiago", "Santiago", "Chile"),
  c("Bogotá", "Bogotá", "Colombia"),
  c("Lima", "Lima", "Peru"),
  c("Mexico City", "CDMX", "Mexico"),
  c("Monterrey", "Nuevo León", "Mexico"),

  // Oceania
  c("Auckland", "Auckland", "New Zealand"),
  c("Wellington", "Wellington", "New Zealand"),
];

export const LOCATIONS: LocationEntry[] = raw.map(([city, state, country, type]) => {
  let label: string;
  if (type === "country") label = country;
  else if (type === "state") label = `${state}, ${country}`;
  else label = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
  return { city, state, country, label, type };
});

/** Search locations by partial string match — prioritizes cities, then states, then countries */
export function searchLocations(query: string, limit = 20): LocationEntry[] {
  if (!query.trim()) {
    // Show popular cities first when no query
    return LOCATIONS.filter((l) => l.type === "city").slice(0, limit);
  }
  const q = query.toLowerCase();
  const matches = LOCATIONS.filter((l) => l.label.toLowerCase().includes(q));
  // Sort: exact start > cities > states > countries
  matches.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    const typeOrder = { city: 0, state: 1, country: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
  return matches.slice(0, limit);
}
