"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getAvatarUrl, getInitials } from "@/lib/avatars/getAvatarUrl";

type HeaderProfileButtonProps = Readonly<{
  avatarUrl: string | null;
  displayName: string;
  tone?: "header" | "panel";
}>;

export function HeaderProfileButton({
  avatarUrl,
  displayName,
  tone = "header",
}: HeaderProfileButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === "/cuenta" || pathname.startsWith("/cuenta/");
  const resolvedAvatarUrl = getAvatarUrl(avatarUrl);
  const initials = getInitials(displayName);

  if (tone === "panel") {
    return (
      <Link
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-100"
        href="/cuenta"
      >
        <ProfileAvatar
          displayName={displayName}
          resolvedAvatarUrl={resolvedAvatarUrl}
          size="md"
          initials={initials}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">Ver mi cuenta</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label={`Mi cuenta: ${displayName}`}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        isActive
          ? "border-white ring-2 ring-white/40"
          : "border-white/70 hover:border-white",
      )}
      href="/cuenta"
    >
      <ProfileAvatar
        displayName={displayName}
        resolvedAvatarUrl={resolvedAvatarUrl}
        size="sm"
        initials={initials}
      />
    </Link>
  );
}

function ProfileAvatar({
  displayName,
  initials,
  resolvedAvatarUrl,
  size,
}: Readonly<{
  displayName: string;
  initials: string;
  resolvedAvatarUrl: string | null;
  size: "sm" | "md";
}>) {
  const sizeClass = size === "sm" ? "h-full w-full" : "h-11 w-11";

  if (resolvedAvatarUrl) {
    return (
      <img
        alt={`Foto de perfil de ${displayName}`}
        className={cn(sizeClass, "object-cover")}
        src={resolvedAvatarUrl}
      />
    );
  }

  return (
    <span
      className={cn(
        sizeClass,
        "flex items-center justify-center bg-brand-dark/40 text-xs font-black text-white",
        size === "md" && "rounded-full text-sm",
      )}
    >
      {initials}
    </span>
  );
}