import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Play, Star, Calendar, Tv, Loader2, Clock } from "lucide-react";
import { svDetail } from "@/lib/sankavollerei";
import { cleanTitle } from "@/lib/title";

export const Route = createFileRoute("/anime/$animeId")({
  component: AnimeDetail,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="font-bold text-destructive">Gagal memuat detail.</p>
        <p className="text-xs text-muted-foreground mt-2">{(error as Error)?.message}</p>
        <Link to="/home" className="mt-4 inline-block text-primary underline">Kembali ke Home</Link>
      </div>
    </div>
  ),
});

function epNum(t: unknown): number {
  const s = String(t ?? "");
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function AnimeDetail() {
  const { animeId } = Route.useParams();
  const router = useRouter();
  const nav = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["anime-detail", animeId],
    queryFn: () => svDetail(animeId),
    staleTime: 5 * 60 * 1000,
  });

  // Sort episodes ascending: 1 first, latest last
  const sortedEpisodes = useMemo(() => {
    if (!data?.episodeList) return [];
    return [...data.episodeList].sort((a, b) => epNum(a.title) - epNum(b.title));
  }, [data]);

  const firstEp = sortedEpisodes[0];

  const synopsis = data?.synopsis || "";
  const longSynopsis = synopsis.length > 320;
  const visibleSynopsis = expanded || !longSynopsis ? synopsis : synopsis.slice(0, 320) + "…";

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

      <main className="max-w-5xl mx-auto px-4 mt-6">
        {isLoading && (
          <div className="py-32 grid place-items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        {isError && (
          <p className="text-center text-destructive font-bold py-20">
            {(error as Error)?.message || "Gagal memuat data anime."}
          </p>
        )}
        {data && (
          <>
            <div className="flex flex-col sm:flex-row gap-5">
              {data.poster ? (
                <img
                  src={data.poster}
                  alt={cleanTitle(data.title)}
                  className="w-40 sm:w-52 aspect-[3/4] rounded-xl object-cover border border-border self-center sm:self-start"
                />
              ) : (
                <div className="w-40 sm:w-52 aspect-[3/4] rounded-xl bg-secondary border border-border self-center sm:self-start grid place-items-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black">{cleanTitle(data.title)}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {data.score && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-3 py-1 font-bold">
                      <Star className="h-3 w-3 fill-current" /> {data.score}
                    </span>
                  )}
                  {data.type && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-bold">
                      <Tv className="h-3 w-3" /> {data.type}
                    </span>
                  )}
                  {data.released && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                      <Calendar className="h-3 w-3" /> {data.released}
                    </span>
                  )}
                  {data.status && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
                      {data.status}
                    </span>
                  )}
                </div>
                {data.genres && data.genres.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.genres.map((g) => (
                      <Link
                        key={g.genreId}
                        to="/genre/$genreId"
                        params={{ genreId: g.genreId }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-secondary border border-border hover:border-primary hover:text-primary"
                      >
                        {g.title}
                      </Link>
                    ))}
                  </div>
                )}
                {firstEp && (
                  <button
                    onClick={() => nav({ to: "/watch/$episodeId", params: { episodeId: firstEp.episodeId } })}
                    className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold tracking-wider glow-primary hover:opacity-90"
                  >
                    <Play className="h-5 w-5 fill-current" /> TONTON SEKARANG
                  </button>
                )}
              </div>
            </div>

            {synopsis && (
              <section className="mt-7 rounded-2xl border border-border bg-card/70 p-5">
                <h2 className="text-base font-black tracking-wider mb-2 uppercase">Sinopsis</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{visibleSynopsis}</p>
                {longSynopsis && (
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 text-xs font-bold text-primary hover:underline"
                  >
                    {expanded ? "Tutup" : "Baca selengkapnya"}
                  </button>
                )}
              </section>
            )}

            {sortedEpisodes.length > 0 && (
              <section className="mt-6 rounded-2xl border border-border bg-card/70 p-5">
                <h2 className="text-base font-black tracking-wider mb-3 uppercase flex items-center gap-3">
                  <span className="h-5 w-1.5 rounded-full bg-primary" />
                  Daftar Episode ({sortedEpisodes.length})
                </h2>
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sortedEpisodes.map((e) => {
                    const n = epNum(e.title);
                    return (
                      <li key={e.episodeId}>
                        <Link
                          to="/watch/$episodeId"
                          params={{ episodeId: e.episodeId }}
                          className="group block text-left relative w-full"
                        >
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                            {data.poster ? (
                              <img
                                src={data.poster}
                                alt={cleanTitle(data.title)}
                                loading="lazy"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No Image</div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
                            <span className="absolute left-2 top-2 px-2 py-0.5 rounded-md bg-primary/95 text-[10px] font-black text-primary-foreground">
                              EP {n || e.title}
                            </span>
                            <div className="absolute inset-x-0 bottom-0 p-2.5">
                              <p className="text-xs sm:text-sm font-bold line-clamp-2 group-hover:text-primary transition leading-snug text-white drop-shadow">
                                Episode {n || e.title}
                              </p>
                              <p className="text-[10px] text-white/70 mt-0.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {data.duration || "24 menit"}
                              </p>
                            </div>
                            <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                              <span className="h-12 w-12 rounded-full bg-primary/90 grid place-items-center glow-primary">
                                <Play className="h-6 w-6 text-primary-foreground fill-current" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
