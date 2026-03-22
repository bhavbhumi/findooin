
-- Helper: title case with financial abbreviation awareness
CREATE OR REPLACE FUNCTION public.title_case_name(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  result TEXT;
  word TEXT;
  words TEXT[];
  i INT;
  lowercase_words TEXT[] := ARRAY['of', 'and', 'the', 'for', 'in', 'on', 'at', 'to', 'a', 'an', 'by'];
  uppercase_words TEXT[] := ARRAY['AG', 'PLC', 'LLP', 'LLC', 'NPS', 'CDSL', 'NSDL', 'HDFC', 'ICICI', 'SBI', 'IDBI', 'IDFC', 'IIFL', 'HSBC', 'DBS', 'BNP', 'SEBI', 'RBI', 'KYC', 'UPI', 'ASBA', 'ESG', 'RBS', 'JP', 'UCO', 'TJSB', 'FINO', 'ESAF', 'AU', 'RBL', 'YES', 'CITI', 'AIF', 'REIT', 'ETF'];
BEGIN
  IF input_text IS NULL THEN RETURN NULL; END IF;
  IF input_text != UPPER(input_text) THEN
    result := input_text;
    result := REGEXP_REPLACE(result, '\bLtd\.?\b', 'Limited', 'g');
    result := REGEXP_REPLACE(result, '\bPvt\.?\b', 'Private', 'g');
    RETURN result;
  END IF;
  words := STRING_TO_ARRAY(LOWER(input_text), ' ');
  FOR i IN 1..array_length(words, 1) LOOP
    word := words[i];
    IF UPPER(word) = ANY(uppercase_words) THEN
      words[i] := UPPER(word);
    ELSIF i > 1 AND word = ANY(lowercase_words) THEN
      words[i] := word;
    ELSE
      words[i] := UPPER(LEFT(word, 1)) || SUBSTRING(word FROM 2);
    END IF;
  END LOOP;
  result := ARRAY_TO_STRING(words, ' ');
  result := REGEXP_REPLACE(result, '\bLtd\.?\b', 'Limited', 'g');
  result := REGEXP_REPLACE(result, '\bPvt\.?\b', 'Private', 'g');
  result := REGEXP_REPLACE(result, '\bLIMITED\b', 'Limited', 'g');
  result := REGEXP_REPLACE(result, '\bPRIVATE\b', 'Private', 'g');
  result := REGEXP_REPLACE(result, '\bN\.a\.\b', 'N.A.', 'g');
  result := REGEXP_REPLACE(result, '\bJ\.p\.', 'J.P.', 'g');
  result := REGEXP_REPLACE(result, '\bIl&fs\b', 'IL&FS', 'g');
  RETURN result;
END;
$$;

-- Helper: generate deterministic source_id
CREATE OR REPLACE FUNCTION public.generate_registry_source_id(p_source TEXT, p_category TEXT, p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT UPPER(LEFT(p_source, 4)) || '-' || 
         UPPER(LEFT(REGEXP_REPLACE(p_category, '[^a-zA-Z]', '', 'g'), 4)) || '-' ||
         LEFT(MD5(LOWER(TRIM(p_name))), 8);
$$;
