// Browser-side upload helper.
// Uploads to Storage using the signed-in admin's session, then asks the server for a
// long-lived signed URL to store in the database.
import { supabase } from "@/integrations/supabase/client";
import { adminSignMediaUpload } from "./blog.functions";

export async function uploadMedia(file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  const { signedUrl } = await adminSignMediaUpload({ data: { path } });
  return signedUrl;
}
