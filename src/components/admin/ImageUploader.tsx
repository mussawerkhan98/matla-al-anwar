import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/upload";
import { toast } from "sonner";

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  label = "Cover image",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="" className="w-full h-56 object-cover" />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center text-muted-foreground"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Upload className="h-6 w-6 mb-2" />
              <span className="text-sm">Click to upload</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
