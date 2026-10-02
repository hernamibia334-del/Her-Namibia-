import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mic, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KEY_SECTORS, PODCAST_CATEGORY } from "@/lib/sectors";
import { packEpisodeMeta, unpackEpisodeMeta } from "@/lib/podcast";
import { matchesSearch } from "@/lib/search";

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5;

type Episode = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  news_date: string;
  sector: string | null;
  category: string | null;
  image_urls: string[];
  external_link: string | null;
  status: string;
};

export function PodcastsPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Episode | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "podcast"],
    queryFn: async (): Promise<Episode[]> => {
      const { data, error } = await supabase
        .from("news")
        .select("id,title,summary,content,news_date,sector,category,image_urls,external_link,status")
        .eq("category", PODCAST_CATEGORY)
        .order("news_date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
      }));
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "podcast"] });
    void qc.invalidateQueries({ queryKey: ["podcast"] });
    void qc.invalidateQueries({ queryKey: ["news"] });
  };

  const save = useMutation({
    mutationFn: async (payload: Omit<Episode, "id" | "category"> & { id?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const row = {
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        news_date: payload.news_date,
        sector: payload.sector || "Business",
        category: PODCAST_CATEGORY,
        image_urls: payload.image_urls,
        external_link: payload.external_link,
        status: payload.status,
      };
      if (payload.id) {
        const { error } = await supabase.from("news").update(row).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert({ ...row, created_by: userData.user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Episode saved.");
      setEditing(null);
      setCreating(false);
      setImages([]);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Episode deleted.");
      setDeleteId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadImage = async (file: File) => {
    setUploading(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("work-images").upload(path, file);
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data, error: signErr } = await supabase.storage.from("work-images").createSignedUrl(path, SIGNED_URL_TTL);
    setUploading(false);
    if (signErr || !data) {
      toast.error(signErr?.message ?? "Could not prepare image link.");
      return;
    }
    setImages((prev) => [...prev, data.signedUrl]);
    toast.success("Image uploaded.");
  };

  const openForm = (item: Episode | null) => {
    setEditing(item);
    setCreating(item === null);
    setImages(item?.image_urls ?? []);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    const content = String(f.get("content") ?? "").trim();
    if (!title || !content) {
      toast.error("Title and description are required.");
      return;
    }
    save.mutate({
      ...(editing ? { id: editing.id } : {}),
      title,
      summary: packEpisodeMeta(String(f.get("guest") ?? ""), String(f.get("duration") ?? "")),
      content,
      news_date: String(f.get("news_date") ?? new Date().toISOString().slice(0, 10)),
      sector: String(f.get("sector") ?? "Business"),
      image_urls: images,
      external_link: String(f.get("external_link") ?? "").trim() || null,
      status: String(f.get("status") ?? "draft"),
    });
  };

  const formOpen = creating || editing !== null;
  const guestDefault = unpackEpisodeMeta(editing?.summary);

  const publishedCount = useMemo(() => data.filter((item) => item.status === "published").length, [data]);
  const filtered = useMemo(
    () =>
      data.filter((item) => {
        const { guest, duration } = unpackEpisodeMeta(item.summary);
        return matchesSearch(search, [item.title, item.content, guest, duration, item.sector, item.status]);
      }),
    [data, search],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Podcast</h2>
          <p className="text-xs text-muted-foreground">
            Publish episodes here. Published episodes appear on the podcast page and the homepage.
          </p>
        </div>
        {!formOpen && (
          <Button onClick={() => openForm(null)}>
            <Plus className="size-4" /> New episode
          </Button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border-2 border-primary bg-card p-6 shadow-card">
          <div>
            <Label htmlFor="ep_title">Episode title *</Label>
            <Input id="ep_title" name="title" defaultValue={editing?.title ?? ""} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ep_guest">Guest</Label>
              <Input id="ep_guest" name="guest" defaultValue={guestDefault.guest} placeholder="Guest name" />
            </div>
            <div>
              <Label htmlFor="ep_duration">Duration</Label>
              <Input id="ep_duration" name="duration" defaultValue={guestDefault.duration} placeholder="45 min" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="ep_sector">Category</Label>
              <select
                id="ep_sector"
                name="sector"
                defaultValue={editing?.sector && KEY_SECTORS.includes(editing.sector as (typeof KEY_SECTORS)[number]) ? editing.sector : "Business"}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {KEY_SECTORS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="ep_date">Date</Label>
              <Input id="ep_date" name="news_date" type="date" defaultValue={editing?.news_date ?? new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <Label htmlFor="ep_status">Status</Label>
              <select
                id="ep_status"
                name="status"
                defaultValue={editing?.status ?? "draft"}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (public)</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="ep_content">Description *</Label>
            <Textarea id="ep_content" name="content" rows={5} defaultValue={editing?.content ?? ""} required />
          </div>
          <div>
            <Label htmlFor="ep_link">Listen or watch link</Label>
            <Input id="ep_link" name="external_link" type="url" placeholder="https://..." defaultValue={editing?.external_link ?? ""} />
          </div>
          <div>
            <Label htmlFor="ep_image">Cover image</Label>
            <Input
              id="ep_image"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file);
              }}
            />
            {images[0] && <img src={images[0]} alt="" className="mt-3 h-32 w-48 rounded-lg object-cover" />}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={save.isPending || uploading}>
              {save.isPending ? "Saving..." : "Save episode"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setCreating(false);
                setImages([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!formOpen && (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search episodes by title, guest, or topic..."
              className="h-9 pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {data.length} episodes · {publishedCount} published
          </p>
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          ) : data.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-primary bg-card p-10 text-center">
              <Mic className="mx-auto mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No episodes yet. Add the first one above.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No episodes match your search.</p>
          ) : (
            filtered.map((item) => {
              const { guest, duration } = unpackEpisodeMeta(item.summary);
              return (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-primary">{item.title}</h3>
                      <Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status}</Badge>
                      {item.sector && <Badge variant="outline">{item.sector}</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[guest && `with ${guest}`, duration, item.news_date].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => openForm(item)} aria-label="Edit episode">
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setDeleteId(item.id)} aria-label="Delete episode">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this episode?</AlertDialogTitle>
            <AlertDialogDescription>This removes it from the website. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && remove.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
