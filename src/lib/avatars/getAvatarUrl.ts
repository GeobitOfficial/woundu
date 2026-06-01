const AVATARS_BUCKET = "avatars";

export function getAvatarUrl(
  avatarUrl: string | null | undefined,
): string | null {
  if (!avatarUrl?.trim()) {
    return null;
  }

  const value = avatarUrl.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const encodedPath = value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabaseUrl}/storage/v1/object/public/${AVATARS_BUCKET}/${encodedPath}`;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
