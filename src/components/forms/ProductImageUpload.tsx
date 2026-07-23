"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

import {
  ALLOWED_PRODUCT_IMAGE_MIME_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
} from "@/constants/storage";
import type { ProductImageRecord } from "@/features/products/services/productImageMutations";
import { deleteProductImage } from "@/features/products/services/productImageMutations";
import { getProductImageUrl } from "@/utils/productDisplay";

type ProductImageUploadProps = Readonly<{
  existingImages?: ReadonlyArray<ProductImageRecord>;
  onFilesChange: (files: File[]) => void;
  selectedFiles: ReadonlyArray<File>;
}>;

export function ProductImageUpload({
  existingImages = [],
  onFilesChange,
  selectedFiles,
}: ProductImageUploadProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const totalCount = existingImages.length + selectedFiles.length;
  const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - totalCount);

  const previews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        key: `${file.name}-${file.lastModified}`,
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    [selectedFiles],
  );

  function handleSelectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const incoming = [...(event.target.files ?? [])];
    event.target.value = "";

    if (incoming.length === 0) {
      return;
    }

    const nextFiles: File[] = [...selectedFiles];

    for (const file of incoming) {
      if (nextFiles.length + existingImages.length >= MAX_PRODUCT_IMAGES) {
        setError(`Puedes subir hasta ${MAX_PRODUCT_IMAGES} imágenes.`);
        break;
      }

      if (!ALLOWED_PRODUCT_IMAGE_MIME_TYPES.has(file.type)) {
        setError("Usa imágenes JPG, PNG o WebP.");
        continue;
      }

      if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
        setError("Cada imagen no puede superar 5 MB.");
        continue;
      }

      nextFiles.push(file);
    }

    setError(null);
    onFilesChange(nextFiles);
  }

  function removeSelectedFile(index: number) {
    onFilesChange(selectedFiles.filter((_, fileIndex) => fileIndex !== index));
  }

  async function handleRemoveExisting(imageId: string) {
    setRemovingId(imageId);
    setError(null);
    const result = await deleteProductImage(imageId);
    setRemovingId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Imágenes <span className="text-red-500 font-bold">*</span>
          </p>
          <p className="text-xs text-slate-500">
            Sube al menos 1 foto (máximo {MAX_PRODUCT_IMAGES}). La primera será la principal.
          </p>
        </div>
        {remainingSlots > 0 ? (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand/30 bg-brand-light/40 px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-light">
            <ImagePlus aria-hidden className="h-4 w-4" />
            Agregar fotos
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              multiple
              onChange={handleSelectFiles}
              type="file"
            />
          </label>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {existingImages.map((image) => {
          const url = getProductImageUrl(image.storagePath);

          return (
            <div
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              key={image.id}
            >
              {url ? (
                <img
                  alt={image.altText ?? "Imagen del producto"}
                  className="aspect-square w-full object-cover"
                  src={url}
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-xs text-slate-400">
                  Sin vista previa
                </div>
              )}
              {image.isPrimary ? (
                <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Principal
                </span>
              ) : null}
              <button
                aria-label="Eliminar imagen"
                className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70"
                disabled={removingId === image.id}
                onClick={() => void handleRemoveExisting(image.id)}
                type="button"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {previews.map((preview, index) => (
          <div
            className="relative overflow-hidden rounded-2xl border border-dashed border-brand/30 bg-brand-light/20"
            key={preview.key}
          >
            <img
              alt={preview.name}
              className="aspect-square w-full object-cover"
              src={preview.url}
            />
            <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Nueva
            </span>
            <button
              aria-label="Quitar imagen seleccionada"
              className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70"
              onClick={() => removeSelectedFile(index)}
              type="button"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          {totalCount}/{MAX_PRODUCT_IMAGES} imágenes
        </p>
      )}
    </div>
  );
}
