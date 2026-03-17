/**
 * useKnowledgeBase — Hooks for KB article CRUD and public queries.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  category_slug: string;
  subcategory: string;
  tags: string[];
  read_time_minutes: number;
  published: boolean;
  view_count: number;
  helpful_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useKBArticles(category?: string) {
  return useQuery({
    queryKey: ["kb-articles", category],
    queryFn: async (): Promise<KBArticle[]> => {
      let query = supabase
        .from("kb_articles")
        .select("*")
        .order("sort_order", { ascending: true });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as KBArticle[];
    },
    staleTime: 30_000,
  });
}

export function useKBArticleBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["kb-article", slug],
    enabled: !!slug,
    queryFn: async (): Promise<KBArticle | null> => {
      const { data, error } = await supabase
        .from("kb_articles")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) return null;
      return data as KBArticle;
    },
    staleTime: 30_000,
  });
}

export function useAdminKBArticles() {
  return useQuery({
    queryKey: ["admin-kb-articles"],
    queryFn: async (): Promise<KBArticle[]> => {
      const { data, error } = await supabase
        .from("kb_articles")
        .select("*")
        .order("category")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as KBArticle[];
    },
    staleTime: 10_000,
  });
}

export function useCreateKBArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: Partial<KBArticle>) => {
      const { error } = await supabase.from("kb_articles").insert(article as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Article created");
      qc.invalidateQueries({ queryKey: ["admin-kb-articles"] });
      qc.invalidateQueries({ queryKey: ["kb-articles"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useUpdateKBArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KBArticle> & { id: string }) => {
      const { error } = await supabase
        .from("kb_articles")
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Article updated");
      qc.invalidateQueries({ queryKey: ["admin-kb-articles"] });
      qc.invalidateQueries({ queryKey: ["kb-articles"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useDeleteKBArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kb_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Article deleted");
      qc.invalidateQueries({ queryKey: ["admin-kb-articles"] });
      qc.invalidateQueries({ queryKey: ["kb-articles"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}
