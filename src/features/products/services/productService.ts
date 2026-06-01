import { normalizePriceRange } from "@/lib/marketplaceFilters";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Category, ProductImage } from "@/types";
import { cache } from "react";

import { buildHomeProductSections } from "../buildHomeProductSections";
import type { HomeProductSectionData } from "../buildHomeProductSections";
import { buildLandingCategoryShowcases } from "../buildLandingCategoryShowcases";
import type { LandingCategoryShowcase } from "../buildLandingCategoryShowcases";
import type {
  CategoryRow,
  LandingPageSnapshot,
  MarketplaceProductFilters,
  ProductCardItem,
  ProductImageRow,
  ProductListRow,
  ProductSeller,
} from "../types";

const PRODUCT_CARD_SELECT = `
  id,
  seller_id,
  category_id,
  title,
  slug,
  price,
  currency,
  condition,
  status,
  city,
  country,
  is_featured,
  views_count,
  favorites_count,
  rating_average,
  reviews_count,
  compare_at_price,
  is_on_offer,
  published_at,
  created_at,
  updated_at,
  deleted_at,
  categories (
    id,
    name,
    slug,
    icon,
    sort_order,
    is_active
  ),
  product_images (
    id,
    product_id,
    storage_path,
    alt_text,
    sort_order,
    is_primary
  ),
  profiles (
    id,
    full_name,
    username,
    avatar_url,
    reputation_score,
    reviews_count
  )
`;

const LANDING_CATALOG_LIMIT = 72;
const LANDING_CAROUSEL_LIMIT = 20;
const LANDING_POOL_LIMIT = 96;
const SELLER_QUERY_LIMIT = 500;
const DEFAULT_MARKETPLACE_LIMIT = 80;
const MARKETPLACE_LIMIT_WITH_COUNTRY = 120;

export async function getMarketplaceCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, icon, sort_order, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as CategoryRow[]).map(mapCategory);
}

/**
 * Conteo de productos activos por `category_id` (para landing y métricas ligeras).
 */
export async function getActiveProductCountByCategoryId(): Promise<
  ReadonlyMap<string, number>
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from("products")
    .select("category_id")
    .eq("status", "active")
    .is("deleted_at", null);

  if (error || !data) {
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data as ReadonlyArray<{ category_id: string | null }>) {
    const id = row.category_id;
    if (!id) {
      continue;
    }
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
}

/**
 * Conteo de productos activos por país (nombre canónico en español).
 */
export async function getActiveProductCountByCountry(): Promise<
  ReadonlyMap<string, number>
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Map();

  const { data, error } = await supabase
    .from("products")
    .select("country")
    .eq("status", "active")
    .is("deleted_at", null)
    .not("country", "is", null);

  if (error || !data) {
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data as ReadonlyArray<{ country: string | null }>) {
    const country = row.country?.trim();
    if (!country) {
      continue;
    }
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return counts;
}

type LandingPageMetrics = Omit<LandingPageSnapshot, "showcasedProduct">;

export const getLandingPageSnapshot = cache(async (): Promise<LandingPageSnapshot> => {
  const [metrics, pool] = await Promise.all([
    getLandingPageMetrics(),
    fetchLandingProductPool(),
  ]);
  const showcasedProduct =
    pool.find((product) => product.isFeatured) ?? pool[0] ?? null;

  return {
    ...metrics,
    showcasedProduct,
  };
});

const getLandingPageMetrics = cache(async (): Promise<LandingPageMetrics> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      activeProductCount: 0,
      activeCategoryCount: 0,
      onOfferProductCount: 0,
      productsWithReviewsCount: 0,
      sellersWithActiveListings: 0,
    };
  }

  const [
    activeProducts,
    activeCategories,
    offerProducts,
    reviewedProducts,
    sellerRows,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null)
      .eq("is_on_offer", true),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null)
      .gt("reviews_count", 0),
    supabase
      .from("products")
      .select("seller_id")
      .eq("status", "active")
      .is("deleted_at", null)
      .limit(SELLER_QUERY_LIMIT),
  ]);

  const sellerSet = new Set(
    (sellerRows.data as ReadonlyArray<{ seller_id: string }> | null)?.map(
      (row) => row.seller_id,
    ) ?? [],
  );

  return {
    activeProductCount: activeProducts.error ? 0 : activeProducts.count ?? 0,
    activeCategoryCount: activeCategories.error ? 0 : activeCategories.count ?? 0,
    onOfferProductCount: offerProducts.error ? 0 : offerProducts.count ?? 0,
    productsWithReviewsCount: reviewedProducts.error
      ? 0
      : reviewedProducts.count ?? 0,
    sellersWithActiveListings: sellerRows.error ? 0 : sellerSet.size,
  };
});

const fetchLandingProductPool = cache(async (): Promise<ProductCardItem[]> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LANDING_POOL_LIMIT);

  if (error || !data) {
    return [];
  }

  return (data as unknown as ProductListRow[]).map(mapProduct);
});

const fetchLandingOfferProducts = cache(async (): Promise<ProductCardItem[]> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("status", "active")
    .is("deleted_at", null)
    .eq("is_on_offer", true)
    .order("published_at", { ascending: false })
    .limit(LANDING_CAROUSEL_LIMIT);

  if (error || !data) {
    return [];
  }

  return (data as unknown as ProductListRow[]).map(mapProduct);
});

function deriveLandingProductSections(
  pool: ReadonlyArray<ProductCardItem>,
  offerProducts: ReadonlyArray<ProductCardItem>,
): Readonly<{
  catalogProducts: ProductCardItem[];
  latestProducts: ProductCardItem[];
  offerProducts: ProductCardItem[];
  topRatedProducts: ProductCardItem[];
  showcasedProduct: ProductCardItem | null;
}> {
  const catalogProducts = pool.slice(0, LANDING_CATALOG_LIMIT);
  const latestProducts = [...pool]
    .sort(
      (first, second) =>
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    )
    .slice(0, LANDING_CAROUSEL_LIMIT);
  const topRatedProducts = [...pool]
    .filter((product) => product.reviewCount > 0)
    .sort((first, second) => {
      if (second.reviewCount !== first.reviewCount) {
        return second.reviewCount - first.reviewCount;
      }

      return second.ratingAverage - first.ratingAverage;
    })
    .slice(0, LANDING_CAROUSEL_LIMIT);
  const showcasedProduct =
    pool.find((product) => product.isFeatured) ?? pool[0] ?? null;

  return {
    catalogProducts,
    latestProducts,
    offerProducts: offerProducts.slice(0, LANDING_CAROUSEL_LIMIT),
    topRatedProducts,
    showcasedProduct,
  };
}

async function getLandingPageDataInternal(): Promise<
  Readonly<{
    metrics: LandingPageMetrics;
    showcasedProduct: ProductCardItem | null;
    categories: Category[];
    catalogProducts: ProductCardItem[];
    latestProducts: ProductCardItem[];
    offerProducts: ProductCardItem[];
    topRatedProducts: ProductCardItem[];
    categoryShowcases: LandingCategoryShowcase[];
    productSections: HomeProductSectionData[];
  }>
> {
  const [metrics, categories, pool, offerProducts] = await Promise.all([
    getLandingPageMetrics(),
    getMarketplaceCategories(),
    fetchLandingProductPool(),
    fetchLandingOfferProducts(),
  ]);

  const sections = deriveLandingProductSections(pool, offerProducts);
  const categoryShowcases = buildLandingCategoryShowcases(
    categories,
    sections.catalogProducts,
  );
  const productSections = buildHomeProductSections(categories, {
    catalogProducts: sections.catalogProducts,
    latestProducts: sections.latestProducts,
    offerProducts: sections.offerProducts,
    topRatedProducts: sections.topRatedProducts,
    pool,
  });

  return {
    metrics,
    showcasedProduct: sections.showcasedProduct,
    categories,
    catalogProducts: sections.catalogProducts,
    latestProducts: sections.latestProducts,
    offerProducts: sections.offerProducts,
    topRatedProducts: sections.topRatedProducts,
    categoryShowcases,
    productSections,
  };
}

export async function getLandingPageProducts(): Promise<
  Readonly<{
    catalogProducts: ProductCardItem[];
    latestProducts: ProductCardItem[];
    offerProducts: ProductCardItem[];
    topRatedProducts: ProductCardItem[];
  }>
> {
  const [pool, offerProducts] = await Promise.all([
    fetchLandingProductPool(),
    fetchLandingOfferProducts(),
  ]);

  const sections = deriveLandingProductSections(pool, offerProducts);

  return {
    catalogProducts: sections.catalogProducts,
    latestProducts: sections.latestProducts,
    offerProducts: sections.offerProducts,
    topRatedProducts: sections.topRatedProducts,
  };
}

type LandingPageData = Readonly<{
  snapshot: LandingPageSnapshot;
  categories: Category[];
  countByCategoryId: ReadonlyMap<string, number>;
  latestProducts: ProductCardItem[];
  offerProducts: ProductCardItem[];
  topRatedProducts: ProductCardItem[];
  catalogProducts: ProductCardItem[];
  categoryShowcases: LandingCategoryShowcase[];
  productSections: HomeProductSectionData[];
}>;

export const getLandingPageData = cache(async (): Promise<LandingPageData> => {
  const [data, countByCategoryId] = await Promise.all([
    getLandingPageDataInternal(),
    getActiveProductCountByCategoryId(),
  ]);

  return {
    snapshot: {
      ...data.metrics,
      showcasedProduct: data.showcasedProduct,
    },
    categories: data.categories,
    countByCategoryId,
    latestProducts: data.latestProducts,
    offerProducts: data.offerProducts,
    topRatedProducts: data.topRatedProducts,
    catalogProducts: data.catalogProducts,
    categoryShowcases: data.categoryShowcases,
    productSections: data.productSections,
  };
});

export async function getMarketplaceProducts(
  filters: MarketplaceProductFilters = {},
): Promise<ProductCardItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const categoryId = filters.categorySlug
    ? await getCategoryIdBySlug(filters.categorySlug)
    : null;

  if (filters.categorySlug && !categoryId) {
    return [];
  }

  const country = filters.country?.trim();
  const hasHeavyFilters =
    Boolean(country) ||
    Boolean(filters.onSaleOnly) ||
    filters.minStars != null ||
    filters.minPrice != null ||
    filters.maxPrice != null;
  const limit = country
    ? MARKETPLACE_LIMIT_WITH_COUNTRY
    : hasHeavyFilters
      ? 300
      : DEFAULT_MARKETPLACE_LIMIT;

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (country) {
    query = query.eq("country", country);
  }

  const priceRange = normalizePriceRange(filters.minPrice, filters.maxPrice);
  if (priceRange.min != null) {
    query = query.gte("price", priceRange.min);
  }
  if (priceRange.max != null) {
    query = query.lte("price", priceRange.max);
  }

  if (filters.minStars != null && filters.minStars >= 1) {
    query = query
      .gte("rating_average", filters.minStars)
      .gt("reviews_count", 0);
  }

  if (filters.onSaleOnly) {
    query = query.eq("is_on_offer", true);
  }

  const search = normalizeSearch(filters.search);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return (data as unknown as ProductListRow[]).map(mapProduct);
}

async function getCategoryIdBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data || typeof data.id !== "string") {
    return null;
  }

  return data.id;
}

function mapProduct(row: ProductListRow): ProductCardItem {
  const category = getFirstRelation(row.categories);
  const seller = getFirstRelation(row.profiles);
  const sortedImages = [...(row.product_images ?? [])].sort((first, second) => {
    if (first.is_primary && !second.is_primary) {
      return -1;
    }

    if (!first.is_primary && second.is_primary) {
      return 1;
    }

    return first.sort_order - second.sort_order;
  });

  return {
    id: row.id,
    sellerId: row.seller_id,
    categoryId: row.category_id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    status: row.status,
    city: row.city,
    country: row.country,
    isFeatured: row.is_featured,
    viewsCount: row.views_count,
    favoritesCount: row.favorites_count,
    ratingAverage: Number(row.rating_average ?? 0),
    reviewCount: Number(row.reviews_count ?? 0),
    compareAtPrice:
      row.compare_at_price == null ? null : Number(row.compare_at_price),
    isOnOffer: Boolean(row.is_on_offer),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    category: category ? mapCategory(category) : null,
    primaryImage: sortedImages[0] ? mapProductImage(sortedImages[0]) : null,
    seller: seller
      ? ({
          id: seller.id,
          fullName: seller.full_name,
          username: seller.username,
          avatarUrl: seller.avatar_url,
          reputationScore: Number(seller.reputation_score),
          reviewsCount: seller.reviews_count,
        } satisfies ProductSeller)
      : null,
  };
}

function getFirstRelation<Relation>(relation: Relation | Relation[] | null) {
  return Array.isArray(relation) ? relation[0] : relation;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    icon: row.icon,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

function mapProductImage(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    createdAt: row.created_at ?? "",
  };
}

function normalizeSearch(search?: string) {
  return search?.trim().replace(/[%(),]/g, "").slice(0, 80) ?? "";
}
