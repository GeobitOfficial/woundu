import type {
  Category,
  Product,
  ProductCondition,
  ProductImage,
  ProductStatus,
  UserRole,
} from "@/types";

export type ProductSeller = Readonly<{
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  role: UserRole;
  reputationScore: number;
  reviewsCount: number;
  whatsapp: string | null;
}>;

export type ProductCardItem = Product &
  Readonly<{
    category: Category | null;
    primaryImage: ProductImage | null;
    images: ReadonlyArray<ProductImage>;
    seller: ProductSeller | null;
  }>;

export type MarketplaceProductFilters = Readonly<{
  categorySlug?: string;
  search?: string;
  /** Nombre de país canónico (igual que en publicación / constante regional). */
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Mínimo de estrellas (1–5): solo productos con al menos una reseña y promedio >= valor. */
  minStars?: number;
  onSaleOnly?: boolean;
}>;

export type LandingPageSnapshot = Readonly<{
  activeProductCount: number;
  activeCategoryCount: number;
  sellersWithActiveListings: number;
  productsWithReviewsCount: number;
  onOfferProductCount: number;
  showcasedProduct: ProductCardItem | null;
}>;

export type LandingHomeFeatureIcon = "search" | "shield" | "zap";

export type LandingHomeFeatureBlock = Readonly<{
  title: string;
  description: string;
  icon: LandingHomeFeatureIcon;
}>;

export type LandingHomeCopy = Readonly<{
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStats: ReadonlyArray<{ label: string; value: string }>;
  showcaseBullets: ReadonlyArray<string>;
  features: ReadonlyArray<LandingHomeFeatureBlock>;
  trust: Readonly<{
    headline: string;
    subheadline: string;
    asideTitle: string;
    asideSubtitle: string;
    bullets: ReadonlyArray<string>;
  }>;
}>;

export type ProductListRow = Readonly<{
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  city: string | null;
  country: string | null;
  is_featured: boolean;
  views_count: number;
  favorites_count: number;
  rating_average: number;
  reviews_count: number;
  compare_at_price: number | null;
  is_on_offer: boolean;
  stock: number;
  shipping_type: "free" | "paid";
  published_at: string | null;  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories: CategoryRow | CategoryRow[] | null;
  product_images: ProductImageRow[] | null;
  profiles: SellerRow | SellerRow[] | null;
}>;

export type CategoryRow = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}>;

export type ProductImageRow = Readonly<{
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}>;

export type SellerRow = Readonly<{
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  reputation_score: number;
  reviews_count: number;
  whatsapp: string | null;
}>;
