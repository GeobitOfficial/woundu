import type {
  LandingHomeCopy,
  LandingHomeFeatureBlock,
  LandingPageSnapshot,
} from "./types";

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/**
 * Textos de la home derivados solo de métricas reales (sin inventar cifras ni productos).
 */
export function buildLandingHomeCopy(
  snapshot: LandingPageSnapshot,
): LandingHomeCopy {
  const {
    activeProductCount,
    activeCategoryCount,
    sellersWithActiveListings,
    productsWithReviewsCount,
    onOfferProductCount,
  } = snapshot;

  const heroBadge =
    activeProductCount === 0
      ? "Sin publicaciones aún"
      : `${activeProductCount} ${plural(activeProductCount, "publicación activa", "publicaciones activas")}`;

  const heroTitle =
    activeProductCount === 0
      ? "Tu marketplace en Latinoamérica"
      : "Encuentra lo que buscas al mejor precio";

  const heroSubtitle =
    activeProductCount === 0
      ? "Publica, compra y descubre productos en un solo lugar. Empieza hoy en Woundu."
      : `Más de ${activeProductCount} ${plural(activeProductCount, "producto", "productos")} activos en ${activeCategoryCount} ${plural(activeCategoryCount, "categoría", "categorías")}. Compra con confianza y filtra por país.`;

  const heroStats = [
    {
      label: "Productos activos",
      value: String(activeProductCount),
    },
    {
      label: "Categorías activas",
      value: String(activeCategoryCount),
    },
    {
      label: "Vendedores con publicaciones",
      value: String(sellersWithActiveListings),
    },
  ] as const;

  const productLine = `${activeProductCount} ${plural(activeProductCount, "producto activo", "productos activos")} en el marketplace.`;

  const reviewLine =
    productsWithReviewsCount === 0
      ? "Ninguna publicación tiene reseñas con calificación todavía."
      : `${productsWithReviewsCount} ${plural(productsWithReviewsCount, "publicación tiene", "publicaciones tienen")} reseñas con calificación.`;

  const offerLine =
    onOfferProductCount === 0
      ? "Ninguna publicación está marcada como oferta."
      : `${onOfferProductCount} ${plural(onOfferProductCount, "publicación está", "publicaciones están")} en oferta con precio promocional.`;

  const showcaseBullets = [productLine, reviewLine, offerLine];

  const features: LandingHomeFeatureBlock[] = [
    {
      title: `${activeProductCount} productos activos`,
      description:
        "Número real de publicaciones vigentes que puedes explorar en el marketplace.",
      icon: "search",
    },
    {
      title: `${activeCategoryCount} categorías`,
      description:
        "Áreas del catálogo activas hoy; cada una agrupa publicaciones reales.",
      icon: "shield",
    },
    {
      title: `${onOfferProductCount} en oferta`,
      description:
        "Publicaciones con precio de referencia mayor al precio actual (oferta).",
      icon: "zap",
    },
  ];

  const trust = {
    headline:
      activeProductCount === 0
        ? "Un marketplace listo para crecer contigo."
        : `${activeProductCount} ${plural(activeProductCount, "publicación activa", "publicaciones activas")} respaldadas por perfiles de vendedores.`,
    subheadline:
      sellersWithActiveListings === 0
        ? "Cuando haya vendedores publicando, verás aquí el volumen real de la comunidad."
        : `${sellersWithActiveListings} ${plural(sellersWithActiveListings, "vendedor tiene", "vendedores tienen")} al menos una publicación activa.`,
    asideTitle: "Resumen del catálogo",
    asideSubtitle: "Cifras tomadas en tiempo real de la base de datos.",
    bullets: [
      `${activeProductCount} ${plural(activeProductCount, "producto activo", "productos activos")}.`,
      `${productsWithReviewsCount} ${plural(productsWithReviewsCount, "publicación con reseñas", "publicaciones con reseñas")}.`,
      `${onOfferProductCount} ${plural(onOfferProductCount, "oferta activa", "ofertas activas")}.`,
    ],
  };

  return {
    heroBadge,
    heroTitle,
    heroSubtitle,
    heroStats: [...heroStats],
    showcaseBullets,
    features,
    trust,
  };
}
