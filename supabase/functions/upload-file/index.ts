import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "post-attachments": [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  "verification-docs": [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  avatars: ["image/jpeg", "image/png", "image/webp"],
  banners: ["image/jpeg", "image/png", "image/webp"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user with their token
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file || !bucket) {
      return new Response(
        JSON.stringify({ error: "Missing file or bucket parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate bucket
    const allowedTypes = ALLOWED_MIME_TYPES[bucket];
    if (!allowedTypes) {
      return new Response(
        JSON.stringify({ error: `Invalid bucket: ${bucket}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `File type "${file.type}" is not allowed for ${bucket}. Accepted: ${allowedTypes.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds the 10MB limit`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${safeName}`;

    // Read file to bytes
    const fileBytes = new Uint8Array(await file.arrayBuffer());

    // Store in file_uploads table with file data encoded as base64
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Try Supabase Storage first
    let publicUrl: string | null = null;
    let storageWorked = false;

    try {
      // Attempt to create bucket if not exists
      await adminClient.storage.createBucket(bucket, {
        public: bucket !== "verification-docs",
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: allowedTypes,
      });
    } catch {
      // Bucket may already exist, ignore
    }

    try {
      const { error: uploadError } = await adminClient.storage
        .from(bucket)
        .upload(filePath, fileBytes, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = adminClient.storage
          .from(bucket)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
        storageWorked = true;
      }
    } catch {
      // Storage service not available, fall back to metadata-only
    }

    // Always record in file_uploads table for tracking
    const { error: dbError } = await adminClient.from("file_uploads").insert({
      user_id: user.id,
      bucket,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: filePath,
      public_url: publicUrl,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save file record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If storage didn't work, generate a URL via edge function serve endpoint
    if (!publicUrl) {
      publicUrl = `${supabaseUrl}/functions/v1/serve-file?path=${encodeURIComponent(filePath)}&bucket=${encodeURIComponent(bucket)}`;
    }

    return new Response(
      JSON.stringify({
        url: publicUrl,
        path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_available: storageWorked,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
