import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Tag } from "lucide-react";

import { ProductCardMarketActions } from "@/components/marketplace/ProductCardMarketActions";
import { ProductImageGallery } from "@/components/marketplace/ProductImageGallery";
import { MarketplaceProductGrid } from "@/components/marketplace/MarketplaceProductGrid";
import { ProductRatingStars } from "@/components/marketplace/ProductRatingStars";
import { ProductReviewsSection } from "@/components/marketplace/ProductReviewsSection";
import { ProductSellerCard } from "@/components/marketplace/ProductSellerCard";
import { Badge } from "@/components/ui";
import { getSellerPayoutProfileForUser } from "@/features/account/services/payoutReadService";
import {
  getMarketplaceProductBySlug,
  getMarketplaceProducts,
} from "@/features/products/services/productService";
import { getProductReviewsForProduct } from "@/features/reviews/services/reviewReadService";
import { getBuyerPurchaseContext } from "@/services/supabase/account/buyerPurchaseContext";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import { listFavoriteProductIdsForUser } from "@/services/supabase/favorites/favoriteService";
import { createSupabaseServerClient } from "@/services/supabase/server";
import {
  formatProductPrice,
  getConditionLabel,
  getProductDiscountPercent,
  getProductMarketplaceHref,
  getProductStockLabel,
  isProductInStock,
} from "@/utils/productDisplay";

type ProductDetailPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getMarketplaceProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const description = product.description.slice(0, 160);

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getMarketplaceProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const user = await getAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const [favorited, sellerPayout, reviews, buyerPurchaseContext, relatedProducts] = await Promise.all([
    user && supabase
      ? listFavoriteProductIdsForUser(supabase, user.id).then((ids) =>
          ids.includes(product.id),
        )
      : Promise.resolve(false),
    user ? getSellerPayoutProfileForUser(product.sellerId) : Promise.resolve(null),
    getProductReviewsForProduct(product.id),
    user && supabase
      ? getBuyerPurchaseContext(supabase, user.id)
      : Promise.resolve({ isBuyer: false, shippingComplete: false }),
    product.category?.slug
      ? getMarketplaceProducts({ categorySlug: product.category.slug })
      : Promise.resolve([]),
  ]);

  // fetch seller role to determine if product belongs to an admin (payments allowed)
  const { data: sellerProfileRow } = await (supabase
    ? supabase.from("profiles").select("id, role").eq("id", product.sellerId).maybeSingle()
    : Promise.resolve({ data: null }));

  const sellerRole = (sellerProfileRow as any)?.role;
  const sellerIsAdmin = sellerRole === "admin" || sellerRole === "super_admin";

  const location = [product.city, product.country].filter(Boolean).join(", ");
  const priceLabel = formatProductPrice(product.price, product.currency);
  const discount = getProductDiscountPercent(product);
  const productHref = getProductMarketplaceHref(product);
  const categoryHref = product.category
    ? `/marketplace?categoria=${encodeURIComponent(product.category.slug)}`
    : "/marketplace";
  const relatedVisible = relatedProducts
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <div className="mx-auto max-w-[82rem] px-4 py-6 sm:px-6 lg:py-8">
        <nav aria-label="Ruta de navegacion" className="flex flex-wrap gap-2 text-sm">
          <Link className="font-semibold text-brand hover:underline" href="/marketplace">
            Marketplace
          </Link>
          {product.category ? (
            <>
              <span className="text-slate-400">/</span>
              <Link
                className="font-semibold text-brand hover:underline"
                href={categoryHref}
              >
                {product.category.name}
              </Link>
            </>
          ) : null}
          <span className="text-slate-400">/</span>
          <span className="line-clamp-1 text-slate-600">{product.title}</span>
        </nav>

        <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Slot 1: Imágenes del producto (Izquierda) */}
            <div className="lg:col-span-5">
              <ProductImageGallery images={product.images} title={product.title} />
            </div>

            {/* Slot 2: Descripción y Características del producto (Centro) */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                {product.category ? (
                  <Link href={categoryHref}>
                    <Badge className="w-fit transition hover:bg-brand-light" variant="brand">
                      {product.category.name}
                    </Badge>
                  </Link>
                ) : null}

                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl leading-snug">
                  {product.title}
                </h1>

                <div className="mt-4">
                  <ProductRatingStars
                    ratingAverage={product.ratingAverage}
                    reviewCount={product.reviewCount}
                  />
                </div>
              </div>

              {/* Rango de Precios en el Centro */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                {product.isOnOffer && product.compareAtPrice != null ? (
                  <p className="text-sm text-slate-400 line-through">
                    {formatProductPrice(product.compareAtPrice, product.currency)}
                  </p>
                ) : null}
                <p className="text-3xl font-black text-slate-950">{priceLabel}</p>
                {discount != null ? (
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-brand">
                    <Tag aria-hidden className="h-4 w-4" />
                    {discount}% de descuento
                  </span>
                ) : null}
              </div>

              {/* Características Clave */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Especificaciones
                </h3>
                <dl className="grid gap-4 text-xs text-slate-700 sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-slate-500 uppercase">Condición</dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      {getConditionLabel(product.condition)}
                    </dd>
                  </div>
                  {location ? (
                    <div>
                      <dt className="font-bold text-slate-500 uppercase">Ubicación</dt>
                      <dd className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
                        {location}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-bold text-slate-500 uppercase">Moneda</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{product.currency}</dd>
                  </div>
                  {product.isOnOffer ? (
                    <div>
                      <dt className="font-bold text-slate-500 uppercase">Promoción</dt>
                      <dd className="mt-1 font-semibold text-brand">Oferta activa</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {/* Descripción Detallada */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Descripción corta
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {product.description}
                </p>
              </div>

              {/* Especificaciones Detalladas (Tabla Clave-Valor) */}
              {product.specifications && product.specifications.length > 0 ? (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Especificaciones detalladas
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-150">
                      <tbody className="divide-y divide-slate-100">
                        {product.specifications.map((spec, i) => (
                          <tr key={i} className="odd:bg-white even:bg-slate-50/50">
                            <td className="w-1/3 py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                              {spec.key}
                            </td>
                            <td className="w-2/3 py-2.5 px-4 text-xs font-semibold text-slate-800">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Slot 3: Compra y Checkout (Derecha - Sticky) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Comprar nuevo
                </span>
                <p className="text-2xl font-black text-slate-950">{priceLabel}</p>
                {product.isOnOffer && product.compareAtPrice != null && (
                  <p className="text-xs text-slate-400 line-through">
                    Reg: {formatProductPrice(product.compareAtPrice, product.currency)}
                  </p>
                )}
              </div>

              {/* Envío y Disponibilidad */}
              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500">Entrega: </span>
                  {product.shippingType === "free" ? (
                    <span className="text-emerald-700 font-extrabold">Envío GRATIS</span>
                  ) : (
                    <span className="text-slate-700 font-semibold">Envío a acordar</span>
                  )}
                </div>

                {location && (
                  <div className="flex items-start gap-1 text-[11px] text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Llega a: <strong className="text-slate-800">{location}</strong></span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-500">Disponibilidad: </span>
                  <strong
                    className={
                      isProductInStock(product.stock)
                        ? product.stock <= 5
                          ? "text-amber-700"
                          : "text-emerald-700"
                        : "text-red-700"
                    }
                  >
                    {getProductStockLabel(product.stock)}
                  </strong>
                </div>
              </div>

              {/* Acciones de Compra y Contacto */}
              <div className="border-t border-slate-100 pt-4">
                <ProductCardMarketActions
                  buyerShippingComplete={buyerPurchaseContext.shippingComplete}
                  initialFavorited={favorited}
                  isBuyer={buyerPurchaseContext.isBuyer}
                  loginNextHref={productHref}
                  priceLabel={priceLabel}
                  productId={product.id}
                  productPageUrl={productHref}
                  productSlug={product.slug}
                  sellerId={product.sellerId}
                  sellerPayout={sellerPayout}
                  sellerWhatsapp={product.seller?.whatsapp ?? null}
                  sellerIsAdmin={sellerIsAdmin}
                  shippingType={product.shippingType}
                  stock={product.stock}
                  title={product.title}
                  viewerId={user?.id ?? null}
                />
              </div>

              <p className="text-[10px] leading-relaxed text-slate-400 text-center border-t border-slate-100 pt-3">
                El pago es directo al vendedor. Woundu no procesa pagos en línea directamente.
              </p>
            </div>

          </div>
        </article>

        {/* Descripción Detallada (Larga) */}
        {product.longDescription ? (
          <div className="mt-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-4">Descripción</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {product.longDescription}
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {product.seller ? <ProductSellerCard seller={product.seller} /> : null}
          <ProductReviewsSection
            ratingAverage={product.ratingAverage}
            reviewCount={product.reviewCount}
            reviews={reviews}
          />
        </div>

        {relatedVisible.length > 0 ? (
          <section className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Más de esta categoría</h2>
                <p className="text-sm text-slate-600">
                  Productos similares para seguir explorando.
                </p>
              </div>
              {product.category ? (
                <Link className="text-sm font-semibold text-brand hover:underline" href={categoryHref}>
                  Ver categoría
                </Link>
              ) : null}
            </div>

            <MarketplaceProductGrid
              buyerPurchaseContext={buyerPurchaseContext}
              favoriteProductIds={favorited ? [product.id] : []}
              hrefState={{ categorySlug: product.category?.slug }}
              page={1}
              products={relatedVisible}
              totalPages={1}
              totalProducts={relatedVisible.length}
              viewerId={user?.id ?? null}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
