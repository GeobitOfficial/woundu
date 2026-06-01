"use client";

import { Camera, Loader2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from "@/features/account/services/avatarMutations";
import { getAvatarUrl, getInitials } from "@/lib/avatars/getAvatarUrl";
import { cn } from "@/lib/utils";

type ProfileAvatarEditorProps = Readonly<{
  fullName: string;
  initialAvatarUrl: string | null;
  size?: "md" | "lg";
}>;

export function ProfileAvatarEditor({
  fullName,
  initialAvatarUrl,
  size = "lg",
}: ProfileAvatarEditorProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedUrl = getAvatarUrl(avatarUrl);
  const initials = getInitials(fullName);
  const dimension = size === "lg" ? "h-28 w-28 sm:h-32 sm:w-32" : "h-20 w-20";

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    const { avatarUrl: nextUrl, error: uploadError } =
      await uploadProfileAvatar(file);

    setIsUploading(false);

    if (uploadError) {
      setError(uploadError);
      return;
    }

    setAvatarUrl(nextUrl);
    router.refresh();
  }

  async function handleRemove() {
    setError(null);
    setIsRemoving(true);

    const { error: removeError } = await removeProfileAvatar();

    setIsRemoving(false);

    if (removeError) {
      setError(removeError);
      return;
    }

    setAvatarUrl(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden rounded-full border-4 border-white bg-brand-light shadow-xl shadow-brand/20 ring-2 ring-brand/15",
            dimension,
          )}
        >
          {resolvedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`Foto de perfil de ${fullName}`}
              className="h-full w-full object-cover"
              src={resolvedUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-dark text-2xl font-black text-white">
              {initials || <UserRound aria-hidden className="h-10 w-10" />}
            </div>
          )}

          {(isUploading || isRemoving) && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45">
              <Loader2
                aria-hidden
                className="h-7 w-7 animate-spin text-white"
              />
            </div>
          )}
        </div>

        <button
          aria-label="Cambiar foto de perfil"
          className="absolute bottom-0 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-lg transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          disabled={isUploading || isRemoving}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Camera aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <input
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        id={inputId}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <label
          className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
          htmlFor={inputId}
        >
          Subir foto
        </label>
        {resolvedUrl ? (
          <button
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            disabled={isUploading || isRemoving}
            onClick={handleRemove}
            type="button"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            Quitar
          </button>
        ) : null}
      </div>

      <p className="max-w-xs text-center text-xs leading-5 text-slate-500 sm:text-left">
        JPG, PNG o WebP · max. 2 MB
      </p>

      {error ? (
        <p className="max-w-xs text-center text-xs text-red-600 sm:text-left">
          {error}
        </p>
      ) : null}
    </div>
  );
}
