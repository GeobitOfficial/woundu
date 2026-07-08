export type HomeSectionReferenceImage = Readonly<{
  src: string;
  alt: string;
}>;

export const HOME_SECTION_REFERENCE_IMAGES = {
  "top-ventas": {
    src: "/images/home/sections/top-ventas.svg",
    alt: "Productos más vendidos del marketplace",
  },
  ofertas: {
    src: "/images/home/sections/ofertas.svg",
    alt: "Ofertas y descuentos activos",
  },
  hogar: {
    src: "/images/home/sections/hogar.svg",
    alt: "Artículos y decoración para el hogar",
  },
  tecnologia: {
    src: "/images/home/sections/tecnologia.svg",
    alt: "Tecnología, gadgets y electrónica",
  },
  moda: {
    src: "/images/home/sections/moda.svg",
    alt: "Moda, calzado y accesorios",
  },
  recomendados: {
    src: "/images/home/sections/recomendados.svg",
    alt: "Productos recomendados del catálogo",
  },
  categorias: {
    src: "/images/home/sections/categorias.svg",
    alt: "Explora productos por categoría",
  },
} as const satisfies Record<string, HomeSectionReferenceImage>;

export type HomeSectionImageId = keyof typeof HOME_SECTION_REFERENCE_IMAGES;

export function getHomeSectionReferenceImage(
  sectionId: string,
): HomeSectionReferenceImage {
  const image =
    HOME_SECTION_REFERENCE_IMAGES[
      sectionId as HomeSectionImageId
    ];

  if (image) {
    return image;
  }

  return HOME_SECTION_REFERENCE_IMAGES.recomendados;
}
