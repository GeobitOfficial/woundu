"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X, ZoomIn } from "lucide-react";

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
  const [isHovering, setIsHovering] = useState(false);
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>({
    left: "0px",
    top: "0px",
    width: "0px",
    height: "0px",
  });
  const [zoomBgPosition, setZoomBgPosition] = useState("0% 0%");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const selectedImage = images[selectedIndex] ?? null;
  const selectedUrl = getProductImageUrl(selectedImage?.storagePath);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    // Mouse coordinates relative to container
    const X_coord = e.clientX - rect.left;
    const Y_coord = e.clientY - rect.top;

    // Lens dimensions: 40% of parent dimensions
    const L_w = W * 0.4;
    const L_h = H * 0.4;

    // Keep lens inside container limits
    let lensLeft = X_coord - L_w / 2;
    let lensTop = Y_coord - L_h / 2;

    if (lensLeft < 0) lensLeft = 0;
    if (lensLeft > W - L_w) lensLeft = W - L_w;
    if (lensTop < 0) lensTop = 0;
    if (lensTop > H - L_h) lensTop = H - L_h;

    // Calculate background percent coordinates
    const posX = (lensLeft / (W - L_w)) * 100;
    const posY = (lensTop / (H - L_h)) * 100;

    setLensStyle({
      left: `${lensLeft}px`,
      top: `${lensTop}px`,
      width: `${L_w}px`,
      height: `${L_h}px`,
    });
    setZoomBgPosition(`${posX}% ${posY}%`);
  };

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
      <div className="relative">
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white cursor-zoom-in group/gallery"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={() => {
            setLightboxIndex(selectedIndex);
            setIsLightboxOpen(true);
          }}
        >
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

          {/* Semi-transparent lens overlay */}
          {isHovering && selectedUrl && (
            <div
              className="pointer-events-none absolute border border-brand/35 bg-brand/10 backdrop-blur-[1px] shadow-sm rounded-lg"
              style={lensStyle}
            />
          )}

          {selectedUrl && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm transition-opacity group-hover/gallery:opacity-0 pointer-events-none">
              <ZoomIn className="h-3.5 w-3.5" />
              <span>Haz clic para ampliar</span>
            </div>
          )}
        </div>

        {/* Zoomed floating panel (Desktop only) */}
        {isHovering && selectedUrl && (
          <div
            className="absolute left-[calc(100%+1.5rem)] top-0 z-40 hidden h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:block animate-in fade-in duration-200"
            style={{
              backgroundImage: `url(${selectedUrl})`,
              backgroundPosition: zoomBgPosition,
              backgroundSize: "250% 250%", // Zoom scale: 2.5x
              backgroundRepeat: "no-repeat",
            }}
          />
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
                    "overflow-hidden rounded-xl border bg-white transition w-full",
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

      {/* Lightbox Overlay modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all hover:scale-105"
            aria-label="Cerrar vista ampliada"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation index indicator */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-400">
            {lightboxIndex + 1} / {images.length}
          </div>

          <div
            className="relative flex w-full max-w-4xl items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking image area
          >
            {/* Prev button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute -left-4 sm:left-2 z-10 rounded-full bg-white/10 p-2 sm:p-3 text-white hover:bg-white/20 hover:scale-105 transition-all"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Main image in Lightbox */}
            <div className="relative max-h-[75vh] overflow-hidden select-none">
              <img
                src={getProductImageUrl(images[lightboxIndex]?.storagePath) ?? undefined}
                alt={images[lightboxIndex]?.altText ?? title}
                className="max-h-[75vh] max-w-full rounded-lg object-contain"
              />
            </div>

            {/* Next button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute -right-4 sm:right-2 z-10 rounded-full bg-white/10 p-2 sm:p-3 text-white hover:bg-white/20 hover:scale-105 transition-all"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Thumbnails row in Lightbox */}
          {images.length > 1 && (
            <div
              className="mt-8 flex gap-2 overflow-x-auto max-w-full pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((image, index) => {
                const isSelected = index === lightboxIndex;
                return (
                  <button
                    key={image.id}
                    onClick={() => setLightboxIndex(index)}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-lg border bg-black transition shrink-0",
                      isSelected ? "border-brand ring-2 ring-brand/50 scale-105" : "border-slate-800 hover:border-slate-600"
                    )}
                  >
                    <img
                      src={getProductImageUrl(image.storagePath) ?? undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
