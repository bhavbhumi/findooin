/**
 * useListings — Directory module hooks (products, services, reviews, enquiries).
 *
 * Provides 8 exports for browsing/creating listings, submitting reviews,
 * and sending enquiries. Owner profiles are batch-fetched. Review stats
 * (count, average_rating) are auto-updated by a DB trigger.
 *
 * RLS: Only issuer/intermediary/admin can create listings.
 * Self-reviews are prevented at the DB level.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export type ListingType = "product" | "service";
export type ListingStatus = "draft" | "active" | "paused" | "archived";

export const PRODUCT_CATEGORIES = [
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "insurance", label: "Insurance" },
  { value: "pms", label: "PMS" },
  { value: "aif", label: "AIF" },
  { value: "bonds", label: "Bonds" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
  { value: "nps", label: "NPS" },
  { value: "ipo_nfo", label: "IPO / NFO" },
  { value: "other_product", label: "Other" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "advisory", label: "Advisory" },
  { value: "compliance", label: "Compliance" },
  { value: "auditing", label: "Auditing" },
  { value: "tax_planning", label: "Tax Planning" },
  { value: "wealth_management", label: "Wealth Management" },
  { value: "portfolio_management", label: "Portfolio Management" },
  { value: "financial_planning", label: "Financial Planning" },
  { value: "legal", label: "Legal" },
  { value: "other_service", label: "Other" },
] as const;

export interface Listing {
  id: string;
  user_id: string;
  listing_type: ListingType;
  product_category: string | null;
  service_category: string | null;
  title: string;
  description: string;
  highlights: string[];
  pricing_info: any;
  media_urls: string[];
  tags: string[];
  location: string | null;
  certifications: string[];
  min_investment: number | null;
  returns_info: string | null;
  risk_level: string | null;
  tenure: string | null;
  status: ListingStatus;
  view_count: number;
  enquiry_count: number;
  review_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  // Joined
  owner?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
    organization: string | null;
  };
}

export interface ListingReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  reviewer?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useListings(filters?: {
  type?: ListingType;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "active" as any)
        .order("created_at", { ascending: false });

      if (filters?.type) {
        query = query.eq("listing_type", filters.type as any);
      }
      if (filters?.category) {
        query = query.or(`product_category.eq.${filters.category},service_category.eq.${filters.category}`);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch owner profiles
      const userIds = [...new Set((data || []).map((l: any) => l.user_id))];
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: pData } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, verification_status, organization")
          .in("id", userIds);
        profiles = pData || [];
      }
      const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

      return (data || []).map((l: any) => ({
        ...l,
        owner: profileMap[l.user_id] || null,
      })) as Listing[];
    },
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Listing[];
    },
  });
}

export function useListingReviews(listingId: string | null) {
  return useQuery({
    queryKey: ["listing-reviews", listingId],
    enabled: !!listingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listing_reviews")
        .select("*")
        .eq("listing_id", listingId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const reviewerIds = [...new Set((data || []).map((r: any) => r.reviewer_id))];
      let profiles: any[] = [];
      if (reviewerIds.length > 0) {
        const { data: pData } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url")
          .in("id", reviewerIds);
        profiles = pData || [];
      }
      const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

      return (data || []).map((r: any) => ({
        ...r,
        reviewer: profileMap[r.reviewer_id] || null,
      })) as ListingReview[];
    },
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listing: Partial<Listing>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("listings")
        .insert({ ...listing, user_id: session.user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing created successfully!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to create listing"),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Listing> & { id: string }) => {
      const { data, error } = await supabase
        .from("listings")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing updated");
    },
    onError: (e: any) => toast.error(e.message || "Failed to update listing"),
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { listing_id: string; rating: number; review_text: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("listing_reviews")
        .insert({ ...review, reviewer_id: session.user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["listing-reviews", vars.listing_id] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Review submitted!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit review"),
  });
}

export function useSubmitEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enquiry: { listing_id: string; message: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("listing_enquiries")
        .insert({ ...enquiry, enquirer_id: session.user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Enquiry sent!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to send enquiry"),
  });
}
