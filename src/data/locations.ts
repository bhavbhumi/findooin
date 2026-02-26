/**
 * Curated global city list for searchable location selector.
 * Format: "City, State/Province, Country"
 */

export interface LocationEntry {
  city: string;
  state: string;
  country: string;
  label: string; // "City, State, Country"
}

const raw: [string, string, string][] = [
  // ─── India ───
  ["Mumbai", "Maharashtra", "India"],
  ["Delhi", "Delhi", "India"],
  ["Bengaluru", "Karnataka", "India"],
  ["Hyderabad", "Telangana", "India"],
  ["Chennai", "Tamil Nadu", "India"],
  ["Kolkata", "West Bengal", "India"],
  ["Pune", "Maharashtra", "India"],
  ["Ahmedabad", "Gujarat", "India"],
  ["Jaipur", "Rajasthan", "India"],
  ["Lucknow", "Uttar Pradesh", "India"],
  ["Surat", "Gujarat", "India"],
  ["Chandigarh", "Chandigarh", "India"],
  ["Indore", "Madhya Pradesh", "India"],
  ["Bhopal", "Madhya Pradesh", "India"],
  ["Nagpur", "Maharashtra", "India"],
  ["Vadodara", "Gujarat", "India"],
  ["Coimbatore", "Tamil Nadu", "India"],
  ["Kochi", "Kerala", "India"],
  ["Thiruvananthapuram", "Kerala", "India"],
  ["Visakhapatnam", "Andhra Pradesh", "India"],
  ["Patna", "Bihar", "India"],
  ["Guwahati", "Assam", "India"],
  ["Noida", "Uttar Pradesh", "India"],
  ["Gurugram", "Haryana", "India"],
  ["Nashik", "Maharashtra", "India"],
  ["Rajkot", "Gujarat", "India"],
  ["Ranchi", "Jharkhand", "India"],
  ["Bhubaneswar", "Odisha", "India"],
  ["Dehradun", "Uttarakhand", "India"],
  ["Mangaluru", "Karnataka", "India"],
  ["Mysuru", "Karnataka", "India"],
  ["Amritsar", "Punjab", "India"],
  ["Ludhiana", "Punjab", "India"],
  ["Agra", "Uttar Pradesh", "India"],
  ["Varanasi", "Uttar Pradesh", "India"],
  ["Kanpur", "Uttar Pradesh", "India"],
  ["Jodhpur", "Rajasthan", "India"],
  ["Udaipur", "Rajasthan", "India"],
  ["Raipur", "Chhattisgarh", "India"],
  ["Madurai", "Tamil Nadu", "India"],
  ["Aurangabad", "Maharashtra", "India"],
  ["Goa", "Goa", "India"],
  ["Shimla", "Himachal Pradesh", "India"],
  ["Gangtok", "Sikkim", "India"],
  ["Imphal", "Manipur", "India"],
  ["Shillong", "Meghalaya", "India"],
  ["Aizawl", "Mizoram", "India"],
  ["Itanagar", "Arunachal Pradesh", "India"],
  ["Kohima", "Nagaland", "India"],
  ["Agartala", "Tripura", "India"],
  // GIFT City
  ["GIFT City", "Gujarat", "India"],

  // ─── United States ───
  ["New York", "New York", "United States"],
  ["San Francisco", "California", "United States"],
  ["Los Angeles", "California", "United States"],
  ["Chicago", "Illinois", "United States"],
  ["Houston", "Texas", "United States"],
  ["Dallas", "Texas", "United States"],
  ["Boston", "Massachusetts", "United States"],
  ["Seattle", "Washington", "United States"],
  ["Miami", "Florida", "United States"],
  ["Atlanta", "Georgia", "United States"],
  ["Denver", "Colorado", "United States"],
  ["Washington", "D.C.", "United States"],
  ["Philadelphia", "Pennsylvania", "United States"],
  ["Phoenix", "Arizona", "United States"],
  ["San Diego", "California", "United States"],
  ["Austin", "Texas", "United States"],
  ["Charlotte", "North Carolina", "United States"],
  ["Minneapolis", "Minnesota", "United States"],
  ["Detroit", "Michigan", "United States"],
  ["Portland", "Oregon", "United States"],

  // ─── United Kingdom ───
  ["London", "England", "United Kingdom"],
  ["Manchester", "England", "United Kingdom"],
  ["Birmingham", "England", "United Kingdom"],
  ["Edinburgh", "Scotland", "United Kingdom"],
  ["Glasgow", "Scotland", "United Kingdom"],
  ["Bristol", "England", "United Kingdom"],
  ["Leeds", "England", "United Kingdom"],
  ["Liverpool", "England", "United Kingdom"],
  ["Cardiff", "Wales", "United Kingdom"],
  ["Belfast", "Northern Ireland", "United Kingdom"],

  // ─── UAE ───
  ["Dubai", "Dubai", "UAE"],
  ["Abu Dhabi", "Abu Dhabi", "UAE"],
  ["Sharjah", "Sharjah", "UAE"],
  ["DIFC", "Dubai", "UAE"],

  // ─── Singapore ───
  ["Singapore", "", "Singapore"],

  // ─── Hong Kong ───
  ["Hong Kong", "", "Hong Kong"],

  // ─── Canada ───
  ["Toronto", "Ontario", "Canada"],
  ["Vancouver", "British Columbia", "Canada"],
  ["Montreal", "Quebec", "Canada"],
  ["Calgary", "Alberta", "Canada"],
  ["Ottawa", "Ontario", "Canada"],

  // ─── Australia ───
  ["Sydney", "NSW", "Australia"],
  ["Melbourne", "Victoria", "Australia"],
  ["Brisbane", "Queensland", "Australia"],
  ["Perth", "Western Australia", "Australia"],

  // ─── Europe ───
  ["Frankfurt", "Hesse", "Germany"],
  ["Berlin", "Berlin", "Germany"],
  ["Munich", "Bavaria", "Germany"],
  ["Paris", "Île-de-France", "France"],
  ["Amsterdam", "North Holland", "Netherlands"],
  ["Zurich", "Zurich", "Switzerland"],
  ["Geneva", "Geneva", "Switzerland"],
  ["Luxembourg", "", "Luxembourg"],
  ["Dublin", "Leinster", "Ireland"],
  ["Milan", "Lombardy", "Italy"],
  ["Madrid", "Madrid", "Spain"],
  ["Barcelona", "Catalonia", "Spain"],
  ["Stockholm", "Stockholm", "Sweden"],
  ["Copenhagen", "Capital Region", "Denmark"],
  ["Oslo", "Oslo", "Norway"],
  ["Helsinki", "Uusimaa", "Finland"],
  ["Vienna", "Vienna", "Austria"],
  ["Brussels", "Brussels", "Belgium"],
  ["Warsaw", "Masovia", "Poland"],
  ["Prague", "Prague", "Czech Republic"],
  ["Lisbon", "Lisbon", "Portugal"],
  ["Athens", "Attica", "Greece"],
  ["Bucharest", "Bucharest", "Romania"],
  ["Budapest", "Budapest", "Hungary"],

  // ─── Asia ───
  ["Tokyo", "Tokyo", "Japan"],
  ["Shanghai", "Shanghai", "China"],
  ["Beijing", "Beijing", "China"],
  ["Shenzhen", "Guangdong", "China"],
  ["Seoul", "Seoul", "South Korea"],
  ["Bangkok", "Bangkok", "Thailand"],
  ["Jakarta", "Jakarta", "Indonesia"],
  ["Kuala Lumpur", "Federal Territory", "Malaysia"],
  ["Manila", "Metro Manila", "Philippines"],
  ["Taipei", "Taipei", "Taiwan"],
  ["Ho Chi Minh City", "HCMC", "Vietnam"],
  ["Colombo", "Western", "Sri Lanka"],
  ["Dhaka", "Dhaka", "Bangladesh"],
  ["Kathmandu", "Bagmati", "Nepal"],
  ["Karachi", "Sindh", "Pakistan"],
  ["Lahore", "Punjab", "Pakistan"],

  // ─── Middle East & Africa ───
  ["Riyadh", "Riyadh", "Saudi Arabia"],
  ["Jeddah", "Makkah", "Saudi Arabia"],
  ["Doha", "Doha", "Qatar"],
  ["Manama", "Capital", "Bahrain"],
  ["Kuwait City", "Al Asimah", "Kuwait"],
  ["Muscat", "Muscat", "Oman"],
  ["Tel Aviv", "Tel Aviv", "Israel"],
  ["Johannesburg", "Gauteng", "South Africa"],
  ["Cape Town", "Western Cape", "South Africa"],
  ["Lagos", "Lagos", "Nigeria"],
  ["Nairobi", "Nairobi", "Kenya"],
  ["Cairo", "Cairo", "Egypt"],
  ["Casablanca", "Casablanca-Settat", "Morocco"],
  ["Accra", "Greater Accra", "Ghana"],
  ["Dar es Salaam", "Dar es Salaam", "Tanzania"],
  ["Addis Ababa", "Addis Ababa", "Ethiopia"],

  // ─── South America ───
  ["São Paulo", "São Paulo", "Brazil"],
  ["Rio de Janeiro", "Rio de Janeiro", "Brazil"],
  ["Buenos Aires", "Buenos Aires", "Argentina"],
  ["Santiago", "Santiago", "Chile"],
  ["Bogotá", "Bogotá", "Colombia"],
  ["Lima", "Lima", "Peru"],
  ["Mexico City", "CDMX", "Mexico"],
  ["Monterrey", "Nuevo León", "Mexico"],

  // ─── Oceania ───
  ["Auckland", "Auckland", "New Zealand"],
  ["Wellington", "Wellington", "New Zealand"],
];

export const LOCATIONS: LocationEntry[] = raw.map(([city, state, country]) => ({
  city,
  state,
  country,
  label: state ? `${city}, ${state}, ${country}` : `${city}, ${country}`,
}));

/** Search locations by partial string match */
export function searchLocations(query: string, limit = 20): LocationEntry[] {
  if (!query.trim()) return LOCATIONS.slice(0, limit);
  const q = query.toLowerCase();
  return LOCATIONS.filter((l) => l.label.toLowerCase().includes(q)).slice(0, limit);
}
