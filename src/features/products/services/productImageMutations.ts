import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ALLOWED_PRODUCT_IMAGE_MIME_TYPES,
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGES_BUCKET,
} from "@/constants/storage";
import { getCurrentUser, supabase } from "@/services/supabase/client";

export type ProductImageRecord = Readonly<{
  id: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}>;

type ProductImageRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function validateImageFile(file: File): string | null {
  if (!ALLOWED_PRODUCT_IMAGE_MIME_TYPES.has(file.type)) {
    return "Usa imágenes JPG, PNG o WebP.";
  }

  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    return "Cada imagen no puede superar 5 MB.";
  }

  return null;
}

export async function getProductImagesForSeller(
  supabaseClient: SupabaseClient,
  productId: string,
  sellerId: string,
): Promise<ReadonlyArray<ProductImageRecord>> {
  const { data: product } = await supabaseClient
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (!product) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from("product_images")
    .select("id, storage_path, alt_text, sort_order, is_primary")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as ProductImageRow[]).map((row) => ({
    id: row.id,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
  }));
}

export async function uploadProductImages(
  productId: string,
  files: ReadonlyArray<File>,
  altText?: string | null,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesión." };
  }

  if (files.length === 0) {
    return { error: null };
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("seller_id", userData.user.id)
    .maybeSingle();

  if (!product) {
    return { error: "No tienes permiso para subir imágenes a este producto." };
  }

  const { count: existingCount } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const currentCount = existingCount ?? 0;
  if (currentCount + files.length > MAX_PRODUCT_IMAGES) {
    return {
      error: `Puedes subir hasta ${MAX_PRODUCT_IMAGES} imágenes por producto.`,
    };
  }

  const userId = userData.user.id;
  let sortOrder = currentCount;
  const hasPrimary = currentCount > 0;

  for (const file of files) {
    const validationError = validateImageFile(file);
    if (validationError) {
      return { error: validationError };
    }

    const objectPath = `${userId}/${productId}/${crypto.randomUUID()}.${extensionForMime(file.type)}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(objectPath, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      return { error: "No pudimos subir una de las imágenes." };
    }

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: objectPath,
      alt_text: altText?.trim() ? altText.trim() : null,
      sort_order: sortOrder,
      is_primary: !hasPrimary && sortOrder === currentCount,
    });

    if (insertError) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([objectPath]);
      return { error: "No pudimos registrar una de las imágenes." };
    }

    sortOrder += 1;
  }

  return { error: null };
}

export async function deleteProductImage(
  imageId: string,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesión." };
  }

  const { data: imageRow, error: imageError } = await supabase
    .from("product_images")
    .select("id, storage_path, product_id")
    .eq("id", imageId)
    .maybeSingle();

  if (imageError || !imageRow) {
    return { error: "No encontramos esa imagen." };
  }

  const { data: productRow } = await supabase
    .from("products")
    .select("seller_id")
    .eq("id", imageRow.product_id)
    .maybeSingle();

  if (!productRow || (productRow as { seller_id: string }).seller_id !== userData.user.id) {
    return { error: "No tienes permiso para eliminar esta imagen." };
  }

  const storagePath = String(imageRow.storage_path);

  const { error: deleteRowError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteRowError) {
    return { error: "No pudimos eliminar la imagen." };
  }

  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([storagePath]);

  return { error: null };
}
