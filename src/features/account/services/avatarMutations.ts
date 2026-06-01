import { getCurrentUser, supabase } from "@/services/supabase/client";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type AvatarMutationResult = Readonly<{
  avatarUrl: string | null;
  error: string | null;
}>;

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export async function uploadProfileAvatar(
  file: File,
): Promise<AvatarMutationResult> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return { avatarUrl: null, error: "Debes iniciar sesion." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      avatarUrl: null,
      error: "Usa una imagen JPG, PNG o WebP.",
    };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return {
      avatarUrl: null,
      error: "La imagen no puede superar 2 MB.",
    };
  }

  const userId = userData.user.id;
  const objectPath = `${userId}/avatar.${extensionForMime(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    return {
      avatarUrl: null,
      error: "No pudimos subir la foto. Intentalo de nuevo.",
    };
  }

  const { data: publicData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(objectPath);

  const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (profileError) {
    return {
      avatarUrl: null,
      error: "Subimos la imagen pero no pudimos actualizar tu perfil.",
    };
  }

  return { avatarUrl, error: null };
}

export async function removeProfileAvatar(): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion." };
  }

  const userId = userData.user.id;

  await supabase.storage.from(AVATAR_BUCKET).remove([
    `${userId}/avatar.jpg`,
    `${userId}/avatar.png`,
    `${userId}/avatar.webp`,
  ]);

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);

  if (error) {
    return { error: "No pudimos quitar la foto de perfil." };
  }

  return { error: null };
}
