import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Tag } from "lucide-react";

import { ProductCardMarketActions } from "@/components/marketplace/ProductCardMarketActions";
import { ProductImageGallery } from "@/components/marketplace/ProductImageGallery";
import { ProductRatingStars } from "@/components/marketplace/ProductRatingStars";
import { ProductReviewsSection } from "@/components/marketplace/ProductReviewsSection";
import { ProductSellerCard } from "@/components/marketplace/ProductSellerCard";
import { Badge } from "@/components/ui";
import { getSellerPayoutProfileForUser } from "@/features/account/services/payoutReadService";
import { getMarketplaceProductBySlug } from "@/features/products/services/productService";
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
  const [favorited, sellerPayout, reviews, buyerPurchaseContext] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-[#eaeded]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
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

        <article className="mt-6 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="border-b border-slate-100 bg-white p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <ProductImageGallery images={product.images} title={product.title} />
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {product.category ? (
                <Link href={categoryHref}>
                  <Badge className="w-fit transition hover:bg-brand-light" variant="brand">
                    {product.category.name}
                  </Badge>
                </Link>
              ) : null}

              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-4">
                <ProductRatingStars
                  ratingAverage={product.ratingAverage}
                  reviewCount={product.reviewCount}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
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

              <dl className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Condicion
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {getConditionLabel(product.condition)}
                  </dd>
                </div>
                {location ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ubicacion
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-1 font-semibold">
                      <MapPin aria-hidden className="h-4 w-4 text-brand" />
                      {location}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Disponibilidad
                  </dt>
                  <dd
                    className={`mt-1 font-semibold ${
                      isProductInStock(product.stock)
                        ? product.stock <= 5
                          ? "text-amber-700"
                          : "text-emerald-700"
                        : "text-red-700"
                    }`}
                  >
                    {getProductStockLabel(product.stock)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Moneda
                  </dt>
                  <dd className="mt-1 font-semibold">{product.currency}</dd>
                </div>
                {product.isOnOffer ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Promocion
                    </dt>
                    <dd className="mt-1 font-semibold text-brand">Oferta activa</dd>
                  </div>
                ) : null}
              </dl>

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

              <p className="mt-4 text-xs leading-5 text-slate-500">
                El pago es directo al vendedor (transferencia u otro medio acordado).
                Woundu no procesa pagos en linea.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4 sm:p-6 lg:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Descripcion
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
              {product.description}
            </p>
          </div>
        </article>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {product.seller ? <ProductSellerCard seller={product.seller} /> : null}
          <ProductReviewsSection
            ratingAverage={product.ratingAverage}
            reviewCount={product.reviewCount}
            reviews={reviews}
          />
        </div>
      </div>
    </main>
  );
}
