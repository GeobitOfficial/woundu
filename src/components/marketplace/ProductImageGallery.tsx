"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/utils/productDisplay";

type ProductImageGalleryProps = Readonly<{
  images: ReadonlyArray<ProductImage>;
  title: string;
  className?: string;
}>;

export function ProductImageGallery({
  className,
  images,
  title,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? null;
  const selectedUrl = getProductImageUrl(selectedImage?.storagePath);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-brand-light/30 text-slate-400",
          className,
        )}
      >
        <ImageIcon aria-hidden className="h-12 w-12 opacity-60" />
        <p className="text-sm font-medium text-slate-500">Sin fotos del producto</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {selectedUrl ? (
          <img
            alt={selectedImage?.altText ?? title}
            className="aspect-square w-full object-contain p-4"
            src={selectedUrl}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-slate-400">
            <ImageIcon aria-hidden className="h-12 w-12" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <ul
          aria-label="Miniaturas del producto"
          className="grid grid-cols-4 gap-2 sm:grid-cols-5"
        >
          {images.map((image, index) => {
            const thumbUrl = getProductImageUrl(image.storagePath);
            const isSelected = index === selectedIndex;

            return (
              <li key={image.id}>
                <button
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`Ver imagen ${index + 1} de ${images.length}`}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-white transition",
                    isSelected
                      ? "border-brand ring-2 ring-brand/30"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                  onClick={() => setSelectedIndex(index)}
                  type="button"
                >
                  {thumbUrl ? (
                    <img
                      alt=""
                      className="aspect-square w-full object-cover"
                      src={thumbUrl}
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-slate-100">
                      <ImageIcon aria-hidden className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
