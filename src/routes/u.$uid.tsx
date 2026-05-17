import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { useProfile, useFollowing, useFollowers, follow, unfollow, isMutual, upsertProfile } from "@/lib/social";
import { ensureKeypair } from "@/lib/crypto";
import { RoleBadge } from "@/components/Badges";

export const Route = createFileRoute("/u/$uid")({
  component: ProfilePage,
});

function ProfilePage() {
  const { uid } = Route.useParams();
  const router = useRouter();
  const nav = useNavigate();
  const { user } = useAuth();
  const profile = useProfile(uid);
  const following = useFollowing(uid);
  const followers = useFollowers(uid);
  const myFollowing = useFollowing(user?.uid);
  const [busy, setBusy] = useState(false);

  // Self profile sync + ensure E2E keypair is published.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const publicKey = await ensureKeypair(user.uid).catch(() => null);
      await upsertProfile({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        publicKey: publicKey ?? undefined,
      }).catch(() => {});
    })();
  }, [user]);

  const isMe = user?.uid === uid;
  const iFollow = !!user && myFollowing.includes(uid);

  const onToggleFollow = async () => {
    if (!user) { toast.error("Login dulu."); return; }
    if (isMe) return;
    setBusy(true);
    try {
      if (iFollow) {
        await unfollow(user.uid, uid);
        toast.success("Tidak mengikuti lagi.");
      } else {
        await follow(user.uid, uid);
        toast.success("Mengikuti.");
      }
    } finally {
      setBusy(false);
    }
  };

  const onChat = async () => {
    if (!user) { toast.error("Login dulu."); return; }
    if (isMe) return;
    const mutual = await isMutual(user.uid, uid);
    if (!mutual) {
      toast.error("Kalian harus saling follow dulu untuk chat.");
      return;
    }
    nav({ to: "/chat/$peerId", params: { peerId: uid } });
  };

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.history.back()} aria-label="Kembali" className="h-10 w-10 grid place-items-center rounded-lg hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="text-lg font-black tracking-wider">NEX<span className="text-primary">Z</span>HU</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 mt-6">
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-center">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="" className="mx-auto h-24 w-24 rounded-full border-2 border-primary" />
          ) : (
            <div className="mx-auto h-24 w-24 rounded-full bg-secondary grid place-items-center text-primary font-black text-3xl">
              {(profile.displayName || "U")[0]}
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-xl font-black">{profile.displayName || "Pengguna"}</h1>
            <RoleBadge email={profile.email} size="md" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{profile.email}</p>

          <div className="mt-5 flex items-center justify-center gap-8 text-sm">
            <div><b className="text-lg">{followers.length}</b><div className="text-xs text-muted-foreground uppercase">Pengikut</div></div>
            <div><b className="text-lg">{following.length}</b><div className="text-xs text-muted-foreground uppercase">Mengikuti</div></div>
          </div>

          {!isMe && (
            <div className="mt-5 flex justify-center gap-2">
              <button
                disabled={busy || !user}
                onClick={onToggleFollow}
                className={`inline-flex items-center gap-2 h-10 px-5 rounded-xl font-bold disabled:opacity-50 ${
                  iFollow
                    ? "bg-secondary border border-border"
                    : "bg-primary text-primary-foreground glow-primary"
                }`}
              >
                {iFollow ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {iFollow ? "Mengikuti" : "Ikuti"}
              </button>
              <button
                onClick={onChat}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-secondary border border-border font-bold"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
