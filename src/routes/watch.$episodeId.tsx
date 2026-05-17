import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, ChevronDown, Server } from "lucide-react";
import { svEpisode, svServer } from "@/lib/sankavollerei";
import { toast } from "sonner";
import { CommentBox } from "@/components/CommentBox";

export const Route = createFileRoute("/watch/$episodeId")({
  component: WatchPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="font-bold text-destructive">Gagal memuat episode.</p>
        <p className="text-xs text-muted-foreground mt-2">{(error as Error)?.message}</p>
        <Link to="/home" className="mt-4 inline-block text-primary underline">Kembali ke Home</Link>
      </div>
    </div>
  ),
});

function WatchPage() {
  const { episodeId } = Route.useParams();
  const router = useRouter();
  const nav = useNavigate();
  const [activeServer, setActiveServer] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | undefined>();
  const [loadingServer, setLoadingServer] = useState(false);
  const [serverPickerOpen, setServerPickerOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["episode", episodeId],
    queryFn: () => svEpisode(episodeId),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.defaultStreamingUrl) setStreamUrl(data.defaultStreamingUrl);
    // Open first group by default once data arrives
    if (data?.servers?.length) {
      setOpenGroups((g) =>
        Object.keys(g).length ? g : { [data.servers[0].title]: true }
      );
    }
  }, [data?.defaultStreamingUrl, data?.servers]);

  const pickServer = async (id: string) => {
    setLoadingServer(true);
    setActiveServer(id);
    try {
      const url = await svServer(id);
      if (!url) throw new Error("Server tidak mengembalikan URL.");
      setStreamUrl(url);
      toast.success("Server diganti.");
    } catch (e) {
      toast.error(`Gagal memuat server: ${(e as Error).message}`);
    } finally {
      setLoadingServer(false);
    }
  };

  const toggleGroup = (title: string) =>
    setOpenGroups((g) => ({ ...g, [title]: !g[title] }));

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            aria-label="Kembali"
            className="h-10 w-10 grid place-items-center rounded-lg hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="text-lg font-black tracking-wider">
            NEX<span className="text-primary">Z</span>HU
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-4">
        {isLoading && (
          <div className="aspect-video grid place-items-center bg-card rounded-xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        {isError && (
          <p className="text-center text-destructive font-bold py-20">
            {(error as Error)?.message || "Gagal memuat data episode."}
          </p>
        )}
        {data && (
          <>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black relative">
              {streamUrl ? (
                <iframe
                  key={streamUrl}
                  src={streamUrl}
                  title={data.title}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
                  Pilih server di bawah untuk mulai menonton.
                </div>
              )}
              {loadingServer && (
                <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            <h1 className="mt-4 text-lg sm:text-xl font-black">{data.title}</h1>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <button
                disabled={!data.prev}
                onClick={() => data.prev && nav({ to: "/watch/$episodeId", params: { episodeId: data.prev } })}
                className="inline-flex items-center gap-1 h-10 px-4 rounded-lg bg-secondary border border-border text-sm font-bold disabled:opacity-40 hover:bg-primary hover:text-primary-foreground transition"
              >
                <ChevronLeft className="h-4 w-4" /> Sebelumnya
              </button>
              <button
                disabled={!data.next}
                onClick={() => data.next && nav({ to: "/watch/$episodeId", params: { episodeId: data.next } })}
                className="inline-flex items-center gap-1 h-10 px-4 rounded-lg bg-secondary border border-border text-sm font-bold disabled:opacity-40 hover:bg-primary hover:text-primary-foreground transition"
              >
                Selanjutnya <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setServerPickerOpen((v) => !v)}
                className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold glow-primary"
              >
                <Server className="h-4 w-4" />
                {serverPickerOpen ? "Tutup Server" : "Pilih Server"}
                <ChevronDown className={`h-4 w-4 transition ${serverPickerOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {serverPickerOpen && data.servers.length > 0 && (
              <section className="mt-4 rounded-2xl border border-border bg-card/70 p-5 animate-in fade-in slide-in-from-top-2">
                <h2 className="text-base font-black tracking-wider mb-3 uppercase flex items-center gap-3">
                  <span className="h-5 w-1.5 rounded-full bg-primary" />
                  Pilih Server
                </h2>
                <div className="space-y-3">
                  {data.servers.map((g) => {
                    const open = !!openGroups[g.title];
                    return (
                      <div key={g.title} className="rounded-xl border border-border overflow-hidden bg-secondary/40">
                        <button
                          onClick={() => toggleGroup(g.title)}
                          className="w-full flex items-center justify-between px-4 h-11 text-left"
                        >
                          <span className="text-xs font-black uppercase tracking-wider text-primary">{g.title}</span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
                        </button>
                        {open && (
                          <div className="px-4 pb-3 flex flex-wrap gap-2">
                            {g.servers.map((s) => (
                              <button
                                key={s.serverId}
                                onClick={() => pickServer(s.serverId)}
                                className={`px-3 h-9 rounded-lg text-xs font-bold border transition ${
                                  activeServer === s.serverId
                                    ? "bg-primary text-primary-foreground border-primary glow-primary"
                                    : "bg-background border-border hover:border-primary"
                                }`}
                              >
                                {s.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <CommentBox scope={`ep:${episodeId}`} title="Komentar Episode" />
          </>
        )}
      </main>
    </div>
  );
}
