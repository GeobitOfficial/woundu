import { getCurrentUser, supabase } from "@/services/supabase/client";

export async function setProductFavorite(
  productId: string,
  shouldFavorite: boolean,
): Promise<{ error: string | null }> {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para usar favoritos." };
  }

  if (shouldFavorite) {
    const { error } = await supabase.from("favorites").insert({
      user_id: userData.user.id,
      product_id: productId,
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        return { error: null };
      }
      return { error: "No pudimos guardar el favorito." };
    }
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userData.user.id)
      .eq("product_id", productId);

    if (error) {
      return { error: "No pudimos quitar el favorito." };
    }
  }

  return { error: null };
}
