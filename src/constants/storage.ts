export const PRODUCT_IMAGES_BUCKET = "product-images";

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export const MAX_PRODUCT_IMAGES = 6;

export const ALLOWED_PRODUCT_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
