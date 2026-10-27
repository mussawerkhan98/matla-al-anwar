import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminListImages, adminUpdateImage } from "@/lib/images.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/images")({
  component: ImagesPage,
});

function ImagesPage() {
  const listFn = useServerFn(adminListImages);
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["admin", "images"],
    queryFn: () => listFn(),
  });

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">Site photos</h1>
        <p className="text-muted-foreground mt-1">
          Swap the hero and marketing photos used across the site.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {images.map((img) => (
            <ImageSlot
              key={img.key}
              slotKey={img.key}
              label={img.label}
              imageUrl={img.image_url}
              alt={img.alt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageSlot({
  slotKey,
  label,
  imageUrl,
  alt,
}: {
  slotKey: string;
  label: string;
  imageUrl: string | null;
  alt: string | null;
}) {
  const qc = useQueryClient();
  const updateFn = useServerFn(adminUpdateImage);
  const [url, setUrl] = useState(imageUrl);
  const [altText, setAltText] = useState(alt ?? "");

  useEffect(() => {
    setUrl(imageUrl);
  }, [imageUrl]);
  useEffect(() => {
    setAltText(alt ?? "");
  }, [alt]);

  const save = useMutation({
    mutationFn: () => updateFn({ data: { key: slotKey, image_url: url, alt: altText || null } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "images"] });
      toast.success("Image saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <h2 className="font-semibold text-navy">{label}</h2>
      <ImageUploader value={url} onChange={setUrl} folder="site" label="Photo" />
      <div className="space-y-2">
        <Label htmlFor={`alt-${slotKey}`}>Alt text</Label>
        <Input
          id={`alt-${slotKey}`}
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the photo"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
