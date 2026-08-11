"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [processingIndices, setProcessingIndices] = useState<Record<number, boolean>>({});
  const [originalFiles, setOriginalFiles] = useState<Record<string, File>>({});
  const [comparingIndex, setComparingIndex] = useState<number | null>(null);

  async function handleRemoveBackground(index: number) {
    const file = selectedFiles[index];
    if (!file) return;

    setProcessingIndices((prev) => ({ ...prev, [index]: true }));
    setError(null);

    try {
      const imgly = await import("@imgly/background-removal");
      const removeBackground = (
        imgly.removeBackground ||
        imgly.default?.removeBackground ||
        imgly.default ||
        imgly
      ) as any;

      const blob = await removeBackground(file);

      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const newFile = new File([blob], `${nameWithoutExt}-sin-fondo.png`, {
        type: "image/png",
      });

      const newKey = `${newFile.name}-${newFile.lastModified}`;
      setOriginalFiles((prev) => ({
        ...prev,
        [newKey]: file,
      }));

      const nextFiles = [...selectedFiles];
      nextFiles[index] = newFile;
      onFilesChange(nextFiles);
    } catch (err: any) {
      console.error("Error al quitar fondo con IA:", err);
      setError("No se pudo quitar el fondo de la imagen.");
    } finally {
      setProcessingIndices((prev) => ({ ...prev, [index]: false }));
    }
  }

  function handleUndoBackgroundRemoval(index: number, currentKey: string) {
    const original = originalFiles[currentKey];
    if (!original) return;

    const nextFiles = [...selectedFiles];
    nextFiles[index] = original;
    onFilesChange(nextFiles);

    setOriginalFiles((prev) => {
      const next = { ...prev };
      delete next[currentKey];
      return next;
    });
  }

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

        {previews.map((preview, index) => {
          const hasOriginal = Boolean(originalFiles[preview.key]);
          const originalFile = originalFiles[preview.key];

          return (
            <div
              className={cn(
                "relative",
                hasOriginal && "cursor-pointer"
              )}
              key={preview.key}
              onClick={() => {
                if (hasOriginal) {
                  setComparingIndex(index);
                }
              }}
            >
              {/* Inner card holding image and buttons */}
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-brand/30 bg-brand-light/20 aspect-square group hover:border-indigo-300 transition-all">
                <img
                  alt={preview.name}
                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                  src={preview.url}
                />
                {hasOriginal ? (
                  <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                    Sin fondo
                  </span>
                ) : (
                  <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Nueva
                  </span>
                )}
                <button
                  aria-label="Quitar imagen seleccionada"
                  className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white transition hover:bg-black/70 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedFile(index);
                  }}
                  type="button"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>

                {/* AI Background removal overlay */}
                <div className="absolute inset-x-2 bottom-2 flex justify-center z-10">
                  {processingIndices[index] ? (
                    <div
                      className="flex items-center gap-1.5 rounded-lg bg-black/75 px-2.5 py-1.5 text-[10px] font-bold text-white shadow backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Quitando fondo...
                    </div>
                  ) : hasOriginal ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoBackgroundRemoval(index, preview.key);
                      }}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 text-[10px] font-extrabold text-white shadow transition"
                    >
                      Deshacer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleRemoveBackground(index);
                      }}
                      className="rounded-lg bg-brand hover:bg-brand-hover px-2.5 py-1 text-[10px] font-extrabold text-white shadow transition"
                    >
                      Quitar fondo
                    </button>
                  )}
                </div>
              </div>

              {/* Popover comparativo al ladito */}
              {comparingIndex === index && originalFile && (() => {
                const originalUrl = URL.createObjectURL(originalFile);
                return (
                  <>
                    {/* Backdrop to close when clicking outside */}
                    <div
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setComparingIndex(null);
                      }}
                    />

                    {/* Popover Card */}
                    <div
                      className="absolute left-1/2 sm:left-[102%] top-1/2 sm:top-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 z-40 w-[280px] sm:w-[320px] bg-slate-900 border border-slate-700 rounded-3xl p-4 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close button inside popover */}
                      <button
                        type="button"
                        className="absolute right-3 top-3 rounded-full bg-white/10 p-1 text-white hover:bg-white/20 transition z-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparingIndex(null);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      <p className="text-xs font-black mb-3">Comparación de fondo</p>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Antes */}
                        <div className="space-y-1.5">
                          <p className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">Antes</p>
                          <div className="overflow-hidden rounded-xl bg-slate-950/60 aspect-square flex items-center justify-center p-1.5 border border-slate-800">
                            <img
                              alt="Original"
                              className="max-h-full max-w-full object-contain rounded"
                              src={originalUrl}
                            />
                          </div>
                        </div>

                        {/* Después */}
                        <div className="space-y-1.5">
                          <p className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">Después</p>
                          <div className="overflow-hidden rounded-xl aspect-square flex items-center justify-center p-1.5 border border-slate-800 relative bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0px] bg-slate-900">
                            <img
                              alt="Sin fondo"
                              className="max-h-full max-w-full object-contain rounded"
                              src={preview.url}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          );
        })}
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
