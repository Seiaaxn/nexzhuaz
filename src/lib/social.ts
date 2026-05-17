// Followers / following helpers backed by Firebase Realtime DB.
import { ref, set, remove, onValue, get, push, serverTimestamp, query, limitToLast, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

// Profiles: users/{uid} = { displayName, email, photoURL, publicKey, updatedAt }
// Following: follows/{uid}/{targetUid} = true
// Followers: followers/{uid}/{followerUid} = true

export type PublicProfile = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  publicKey?: JsonWebKey | null;
};

export async function upsertProfile(p: PublicProfile) {
  // Use update so we don't wipe an existing publicKey when we only refresh
  // basic identity fields.
  const patch: Record<string, unknown> = {
    displayName: p.displayName ?? null,
    email: p.email ?? null,
    photoURL: p.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };
  if (p.publicKey !== undefined) patch.publicKey = p.publicKey;
  await update(ref(db, `users/${p.uid}`), patch);
}

export async function getPublicKey(uid: string): Promise<JsonWebKey | null> {
  const s = await get(ref(db, `users/${uid}/publicKey`));
  return s.exists() ? (s.val() as JsonWebKey) : null;
}

export async function follow(myUid: string, targetUid: string) {
  if (myUid === targetUid) return;
  await Promise.all([
    set(ref(db, `follows/${myUid}/${targetUid}`), true),
    set(ref(db, `followers/${targetUid}/${myUid}`), true),
  ]);
}

export async function unfollow(myUid: string, targetUid: string) {
  await Promise.all([
    remove(ref(db, `follows/${myUid}/${targetUid}`)),
    remove(ref(db, `followers/${targetUid}/${myUid}`)),
  ]);
}

export async function isMutual(a: string, b: string) {
  const [s1, s2] = await Promise.all([
    get(ref(db, `follows/${a}/${b}`)),
    get(ref(db, `follows/${b}/${a}`)),
  ]);
  return s1.exists() && s2.exists();
}

export function useFollowing(uid?: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    if (!uid) { setList([]); return; }
    const unsub = onValue(ref(db, `follows/${uid}`), (snap) => {
      const ids: string[] = [];
      snap.forEach((c) => { ids.push(c.key!); });
      setList(ids);
    });
    return () => unsub();
  }, [uid]);
  return list;
}

export function useFollowers(uid?: string) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    if (!uid) { setList([]); return; }
    const unsub = onValue(ref(db, `followers/${uid}`), (snap) => {
      const ids: string[] = [];
      snap.forEach((c) => { ids.push(c.key!); });
      setList(ids);
    });
    return () => unsub();
  }, [uid]);
  return list;
}

export function useProfile(uid?: string) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  useEffect(() => {
    if (!uid) { setProfile(null); return; }
    const unsub = onValue(ref(db, `users/${uid}`), (snap) => {
      const v = snap.val();
      setProfile(v ? { uid, ...v } : { uid });
    });
    return () => unsub();
  }, [uid]);
  return profile;
}

// Chat: chats/{chatId}/messages/{messageId} where chatId = sorted [a,b].join("_")
export const chatId = (a: string, b: string) => [a, b].sort().join("_");

export type ChatMessage = {
  id: string;
  uid: string;
  name: string;
  /** Plaintext (legacy/unencrypted messages only). */
  text?: string;
  /** Encrypted payload: base64 IV + base64 ciphertext. */
  iv?: string;
  ct?: string;
  ts: number;
};

export function useChatMessages(cid?: string) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  useEffect(() => {
    if (!cid) { setMsgs([]); return; }
    const q = query(ref(db, `chats/${cid}/messages`), limitToLast(100));
    const unsub = onValue(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((c) => { list.push({ id: c.key!, ...(c.val() as Omit<ChatMessage, "id">) }); });
      list.sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
      setMsgs(list);
    });
    return () => unsub();
  }, [cid]);
  return msgs;
}

export async function sendChatMessage(cid: string, m: Omit<ChatMessage, "id" | "ts">) {
  await push(ref(db, `chats/${cid}/messages`), { ...m, ts: serverTimestamp() });
}
