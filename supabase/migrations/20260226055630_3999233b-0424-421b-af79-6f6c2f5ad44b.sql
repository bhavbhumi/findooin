
-- Rajesh Kumar - Individual Investor (Retail)
UPDATE profiles SET
  headline = 'Retail Investor | Mutual Funds & Equity Enthusiast',
  location = 'Pune, Maharashtra, India',
  organization = NULL,
  designation = 'Self-employed',
  experience_years = 8,
  specializations = ARRAY['Mutual Funds', 'Index Investing', 'SIP Strategy'],
  languages = ARRAY['English', 'Hindi', 'Marathi'],
  certifications = ARRAY['NISM VA - Mutual Fund Distributor'],
  website = NULL,
  regulatory_ids = '{}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/in/rajeshkumar"}'::jsonb
WHERE id = '5c2b939e-fc71-4c2e-9b42-711bd200c0dc';

-- Priya Sharma - Individual Intermediary (RIA) + Investor (HNI)
UPDATE profiles SET
  headline = 'SEBI Registered Investment Adviser | Portfolio Strategist',
  location = 'Mumbai, Maharashtra, India',
  organization = 'Sharma Wealth Advisory',
  designation = 'Founder & RIA',
  experience_years = 14,
  specializations = ARRAY['Portfolio Management', 'Asset Allocation', 'Retirement Planning', 'HNI Advisory'],
  languages = ARRAY['English', 'Hindi', 'Gujarati'],
  certifications = ARRAY['CFA Level III', 'SEBI RIA', 'NISM Series XA'],
  website = 'www.sharmawealthadvisory.in',
  regulatory_ids = '{"sebi_ria": "INA000012345"}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/in/priyasharma", "twitter": "https://twitter.com/priya_ria"}'::jsonb
WHERE id = 'c7570894-a440-4f1c-97ff-4a015714cdec';

-- Arjun Mehta / Bluechip Capital AMC - Entity Issuer (AMC)
UPDATE profiles SET
  headline = 'Leading AMC | 50,000 Cr+ AUM | Equity, Debt & Hybrid Funds',
  location = 'Mumbai, Maharashtra, India',
  organization = 'Bluechip Capital AMC',
  designation = 'Chief Investment Officer',
  experience_years = 20,
  specializations = ARRAY['Asset Management', 'Equity Funds', 'Hybrid Funds', 'NFO Launches'],
  languages = ARRAY['English', 'Hindi'],
  certifications = ARRAY['CFA Charterholder', 'SEBI AMC Registration'],
  website = 'www.bluechipcapitalamc.in',
  regulatory_ids = '{"sebi_amc": "MF/0XX/XX/XX", "amfi": "AMC-XXX"}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/company/bluechipcapitalamc"}'::jsonb
WHERE id = '979bd2a8-124c-4546-a4ea-666a635f98ee';

-- Sneha Patel - Individual Intermediary (CA/CS)
UPDATE profiles SET
  headline = 'Chartered Accountant | Tax-Efficient Investment Strategies',
  location = 'Ahmedabad, Gujarat, India',
  organization = 'Patel & Associates',
  designation = 'Senior Partner',
  experience_years = 11,
  specializations = ARRAY['Tax Planning', 'Capital Gains', 'NRI Taxation', 'DTAA Advisory'],
  languages = ARRAY['English', 'Hindi', 'Gujarati'],
  certifications = ARRAY['CA (ICAI)', 'CS (ICSI)', 'NISM Series VA'],
  website = 'www.patelandassociates.in',
  regulatory_ids = '{"icai": "123456"}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/in/snehapatel"}'::jsonb
WHERE id = '0041b4f3-64ff-4b6e-b668-d77aac3688a1';

-- Vikram Singh / Singh Infrastructure Ltd - Entity Issuer (Listed Company)
UPDATE profiles SET
  headline = 'BSE & NSE Listed | Infrastructure & Highway Projects | 12,800 Cr Order Book',
  location = 'New Delhi, India',
  organization = 'Singh Infrastructure Ltd',
  designation = 'Managing Director',
  experience_years = 25,
  specializations = ARRAY['Infrastructure', 'Highway Construction', 'EPC Contracts', 'Government Projects'],
  languages = ARRAY['English', 'Hindi'],
  certifications = ARRAY['BSE Listed', 'NSE Listed'],
  website = 'www.singhinfra.co.in',
  regulatory_ids = '{"bse": "5XXXXX", "nse": "SINGHINFRA", "cin": "L45200DL1995PLC000XXX"}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/company/singhinfra"}'::jsonb
WHERE id = '389bd69e-3ce7-4027-b2af-1b8205fd23e7';

-- Anita Desai / Desai Financial Services - Entity Issuer (NBFC) + Intermediary + Investor
UPDATE profiles SET
  headline = 'Full-Service NBFC & MF Distribution | 5,000 Cr AUM | 15 Cities',
  location = 'Bengaluru, Karnataka, India',
  organization = 'Desai Financial Services',
  designation = 'CEO & Managing Director',
  experience_years = 18,
  specializations = ARRAY['NBFC Operations', 'Mutual Fund Distribution', 'Wealth Management', 'Tier-2 Expansion'],
  languages = ARRAY['English', 'Hindi', 'Kannada', 'Tamil'],
  certifications = ARRAY['AMFI Registered MF Distributor', 'RBI NBFC License'],
  website = 'www.desaifinancial.in',
  regulatory_ids = '{"amfi": "ARN-XXXXX", "rbi_nbfc": "N-XX.XXXXX"}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/company/desaifinancial", "twitter": "https://twitter.com/desaifinserv"}'::jsonb
WHERE id = '02c35abf-a053-43ca-aa98-3fb4bca55182';

-- Karan Joshi - Individual Investor (NRI)
UPDATE profiles SET
  headline = 'NRI Investor | Indian Equity & Real Estate | Singapore-based',
  location = 'Singapore',
  organization = NULL,
  designation = 'Technology Director',
  experience_years = 12,
  specializations = ARRAY['NRI Investing', 'Cross-border Tax', 'Indian Real Estate', 'Direct Equity'],
  languages = ARRAY['English', 'Hindi'],
  certifications = ARRAY[]::text[],
  website = NULL,
  regulatory_ids = '{}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/in/karanjoshi"}'::jsonb
WHERE id = 'acfa870c-47cd-4aba-a159-4882c4ace359';

-- Meera Reddy - Individual Intermediary (Research Analyst) + Investor
UPDATE profiles SET
  headline = 'SEBI Research Analyst | Pharma & IT Sector Coverage',
  location = 'Hyderabad, Telangana, India',
  organization = 'Reddy Research',
  designation = 'Founder & Lead Analyst',
  experience_years = 10,
  specializations = ARRAY['Equity Research', 'Pharma Sector', 'IT Services', 'Fundamental Analysis'],
  languages = ARRAY['English', 'Hindi', 'Telugu'],
  certifications = ARRAY['SEBI Research Analyst', 'NISM Series XV', 'CFA Level II'],
  website = 'www.reddyresearch.in',
  regulatory_ids = '{"sebi_ra": "INH000XXXXXX"}'::jsonb,
  social_links = '{"linkedin": "https://linkedin.com/in/meerareddy", "twitter": "https://twitter.com/meera_research"}'::jsonb
WHERE id = 'a9a62521-77fb-40a5-b3b8-963d0f4c0206';
