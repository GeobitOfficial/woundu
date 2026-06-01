"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui";
import { setProductFavorite } from "@/features/favorites/services/favoriteMutations";
import { createPendingOrderForProduct } from "@/features/orders/services/orderMutations";
import { cn } from "@/lib/utils";

type ProductCardMarketActionsProps = Readonly<{
  productId: string;
  sellerId: string;
  title: string;
  priceLabel: string;
  initialFavorited: boolean;
  viewerId: string | null;
}>;

export function ProductCardMarketActions({
  initialFavorited,
  priceLabel,
  productId,
  sellerId,
  title,
  viewerId,
}: ProductCardMarketActionsProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  const isOwnListing = viewerId != null && viewerId === sellerId;
  const loginHref = `/login?next=${encodeURIComponent("/marketplace")}`;

  async function handleFavoriteClick() {
    setMessage(null);
    if (!viewerId) {
      return;
    }
    setFavoriteBusy(true);
    const next = !favorited;
    const { error } = await setProductFavorite(productId, next);
    setFavoriteBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    setFavorited(next);
    router.refresh();
  }

  async function handleBuyClick() {
    setMessage(null);
    if (!viewerId) {
      return;
    }
    setPurchaseBusy(true);
    const { data, error } = await createPendingOrderForProduct(productId);
    setPurchaseBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    if (data) {
      router.push("/cuenta");
      router.refresh();
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
      {message ? (
        <p className="rounded-xl bg-brand-light px-3 py-2 text-xs text-brand-dark">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {!viewerId ? (
          <Link className={cn(buttonVariants({ size: "sm", variant: "primary" }))} href={loginHref}>
            Inicia sesion para comprar
          </Link>
        ) : isOwnListing ? (
          <span className="text-xs font-medium text-slate-500">
            Es tu publicacion
          </span>
        ) : (
          <Button
            disabled={purchaseBusy}
            onClick={handleBuyClick}
            size="sm"
            type="button"
            variant="primary"
          >
            {purchaseBusy ? (
              <>
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>Comprar · {priceLabel}</>
            )}
          </Button>
        )}

        {viewerId ? (
          <button
            aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={favorited}
            className={cn(
              buttonVariants({ size: "sm", variant: "secondary" }),
              favorited && "border-rose-200 bg-rose-50 text-rose-700",
            )}
            disabled={favoriteBusy}
            onClick={handleFavoriteClick}
            type="button"
          >
            {favoriteBusy ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                aria-hidden
                className={cn("h-4 w-4", favorited && "fill-current")}
              />
            )}
            <span className="hidden sm:inline">
              {favorited ? "Quitar" : "Favorito"}
            </span>
          </button>
        ) : null}
      </div>
      <p className="text-xs text-slate-400" title={title}>
        Compra MVP: crea un pedido pendiente sin pago en linea todavia.
      </p>
    </div>
  );
}
