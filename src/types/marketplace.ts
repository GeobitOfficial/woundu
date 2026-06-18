export type UserRole = "buyer" | "seller" | "admin" | "super_admin";

export type ProductStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rejected"
  | "paused"
  | "sold"
  | "archived";

export type ProductCondition = "new" | "like_new" | "used" | "refurbished";

export type ProductShippingType = "free" | "paid";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type Profile = Readonly<{
  id: string;
  fullName: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  reputationScore: number;
  reviewsCount: number;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}>;

export type Category = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}>;

export type Product = Readonly<{
  id: string;
  sellerId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  city: string | null;
  country: string | null;
  isFeatured: boolean;
  viewsCount: number;
  favoritesCount: number;
  /** Promedio de estrellas de reseñas del producto (0 si no hay reseñas). */
  ratingAverage: number;
  /** Cantidad de reseñas asociadas al producto. */
  reviewCount: number;
  /** Precio de referencia (tachado) para mostrar oferta; debe ser mayor que `price`. */
  compareAtPrice: number | null;
  /** `true` cuando hay oferta activa (`compareAtPrice` > `price`). */
  isOnOffer: boolean;
  /** Unidades disponibles para compra inmediata. */
  stock: number;
  /** Envío gratis o pagado (negociado con el comprador). */
  shippingType: ProductShippingType;
  /** Campos de moderación (panel admin). */
  moderationNote?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}>;
export type ProductImage = Readonly<{
  id: string;
  productId: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}>;

export type Favorite = Readonly<{
  userId: string;
  productId: string;
  createdAt: string;
}>;

export type Review = Readonly<{
  id: string;
  productId: string;
  reviewerId: string;
  sellerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type Order = Readonly<{
  id: string;
  buyerId: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  currency: string;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
}>;

export type OrderItem = Readonly<{
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}>;
