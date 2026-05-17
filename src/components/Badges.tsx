import { Crown, Shield } from "lucide-react";
import { roleBadge } from "@/lib/roles";

export function RoleBadge({ email, size = "sm" }: { email?: string | null; size?: "sm" | "md" }) {
  const r = roleBadge(email);
  if (!r) return null;
  const isAdm = r === "admin";
  const cls =
    size === "md"
      ? "px-2 py-0.5 text-[11px]"
      : "px-1.5 py-0.5 text-[9px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-black uppercase tracking-wider ${cls} ${
        isAdm
          ? "bg-destructive/20 text-destructive border border-destructive/40"
          : "bg-primary/20 text-primary border border-primary/40"
      }`}
      title={isAdm ? "Administrator" : "Premium User"}
    >
      {isAdm ? <Shield className="h-3 w-3" /> : <Crown className="h-3 w-3" />}
      {isAdm ? "ADMIN" : "PREMIUM"}
    </span>
  );
}
