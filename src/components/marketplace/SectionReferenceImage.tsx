import type { HomeSectionReferenceImage } from "@/constants/homeSectionImages";
import { cn } from "@/lib/utils";

type SectionReferenceImageProps = Readonly<{
  image: HomeSectionReferenceImage;
  className?: string;
  imageClassName?: string;
  overlayClassName?: string;
  priority?: boolean;
}>;

export function SectionReferenceImage({
  className,
  image,
  imageClassName,
  overlayClassName,
  priority = false,
}: SectionReferenceImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={image.alt}
        className={cn("block h-full min-h-[8rem] w-full object-cover", imageClassName)}
        decoding="async"
        height={520}
        loading={priority ? "eager" : "lazy"}
        src={image.src}
        width={800}
      />
      {overlayClassName ? (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0", overlayClassName)}
        />
      ) : null}
    </div>
  );
}
