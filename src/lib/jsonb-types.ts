/**
 * jsonb-types.ts — Typed interfaces for JSONB columns.
 *
 * Replaces the generic `Json` type from Supabase with strongly-typed
 * interfaces for all JSONB fields used in the profiles and registry tables.
 */

/* ── Profile JSONB fields ── */

/** profiles.social_links */
export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  telegram?: string;
  whatsapp?: string;
  [key: string]: string | undefined;
}

/** profiles.digital_card_fields */
export interface DigitalCardFields {
  show_email?: boolean;
  show_phone?: boolean;
  show_website?: boolean;
  show_social?: boolean;
  show_certifications?: boolean;
  show_organization?: boolean;
  show_qr?: boolean;
  custom_tagline?: string;
  card_theme?: string;
  card_layout?: "standard" | "compact" | "detailed";
  [key: string]: boolean | string | undefined;
}

/** profiles.regulatory_ids */
export interface RegulatoryIds {
  arn?: string;        // AMFI ARN
  ria?: string;        // SEBI RIA number
  euin?: string;       // Employee Unique Identification Number
  pan?: string;        // PAN number (masked)
  sebi?: string;       // SEBI registration
  irda?: string;       // IRDAI license
  pfrda?: string;      // PFRDA PoP registration
  [key: string]: string | undefined;
}

/** profiles.languages */
export interface LanguageEntry {
  code: string;
  name: string;
  proficiency?: "basic" | "conversational" | "fluent" | "native";
}

export type ProfileLanguages = LanguageEntry[];

/* ── Registry JSONB fields ── */

/** registry_entities.all_registrations — consolidated registrations from multiple sources */
export interface RegistrationEntry {
  source: string;
  category: string;
  registration_number?: string;
  status?: string;
  validity_start?: string;
  validity_end?: string;
  sub_type?: string;
}

export type AllRegistrations = RegistrationEntry[];

/** registry_entities.raw_data — unstructured source data */
export type RegistryRawData = Record<string, unknown>;

/* ── Helpers ── */

/**
 * Safely cast a Json value to a typed interface.
 * Returns undefined if the input is null/undefined.
 */
export function castJsonb<T>(value: unknown): T | undefined {
  if (value === null || value === undefined) return undefined;
  return value as T;
}
