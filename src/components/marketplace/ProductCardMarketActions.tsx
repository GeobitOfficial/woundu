"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Loader2, MessageCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui";
import { setProductFavorite } from "@/features/favorites/services/favoriteMutations";
import { createPendingOrderForProduct } from "@/features/orders/services/orderMutations";
import { buildWhatsAppPurchaseLink } from "@/lib/whatsapp/buildWhatsAppPurchaseLink";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/services/supabase/client";

import type { SellerPayoutProfile } from "@/features/orders/types";
import type { ProductShippingType } from "@/types/marketplace";
import { SellerPayoutMethodsDisplay } from "@/components/account/SellerPayoutMethodsDisplay";
import { sellerHasPayoutMethods } from "@/features/account/services/payoutMapper";

type ProductCardMarketActionsProps = Readonly<{
  compact?: boolean;
  productId: string;
  productPageUrl: string;
  productSlug: string;
  sellerId: string;
  sellerPayout?: SellerPayoutProfile | null;
  sellerWhatsapp?: string | null;
  shippingType?: ProductShippingType;
  title: string;
  priceLabel: string;
  stock: number;
  initialFavorited: boolean;
  viewerId: string | null;
  loginNextHref?: string;
  buyerShippingComplete?: boolean;
  isBuyer?: boolean;
  sellerIsAdmin?: boolean;
}>;

export function ProductCardMarketActions({
  compact = false,
  initialFavorited,
  isBuyer = false,
  buyerShippingComplete = true,
  loginNextHref = "/marketplace",
  priceLabel,
  productId,
  productPageUrl,
  productSlug,
  sellerId,
  sellerPayout = null,
  sellerWhatsapp = null,
  shippingType = "free",
  stock,
  title,
  viewerId,
  sellerIsAdmin = false,
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
  const loginHref = `/login?next=${encodeURIComponent(loginNextHref)}`;
  const inStock = stock > 0;
  const needsShippingSetup = Boolean(viewerId && isBuyer && !buyerShippingComplete);
  const whatsappHref = buildWhatsAppPurchaseLink(
    sellerWhatsapp,
    title,
    productPageUrl,
  );
  const showSellerPayoutPreview =
    !compact &&
    viewerId != null &&
    !isOwnListing &&
    sellerHasPayoutMethods(sellerPayout);
  const showPaidShippingNotice =
    !compact && shippingType === "paid" && !isOwnListing;
  const showWhatsappButton =
    !compact &&
    viewerId != null &&
    isBuyer &&
    !isOwnListing &&
    whatsappHref != null;

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
    if (needsShippingSetup) {
      setMessage(
        "Completa tus datos de envio en tu perfil antes de comprar.",
      );
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
      router.push(`/cuenta/pedidos/${data.orderId}`);
    }
  }

  async function handleWompiPayClick() {
    setMessage(null);
    if (!viewerId) return;
    setPurchaseBusy(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl) {
        setMessage("Configuración de Supabase no disponible");
        setPurchaseBusy(false);
        return;
      }

      // Obtener el JWT del usuario autenticado
      const supabase = getSupabaseClient();
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session?.access_token) {
        setMessage("Error de autenticación, intenta de nuevo");
        setPurchaseBusy(false);
        return;
      }

      const jwt = data.session.access_token;

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/wompi-checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        }
      );

      const result = await resp.json();
      setPurchaseBusy(false);
      if (!resp.ok) {
        setMessage(result.error || "No fue posible iniciar el pago");
        return;
      }

      // La Edge Function retorna los datos de checkout firmados.
      if (result.reference) {
        // Redirigir al Web Checkout de Wompi (más estable que embeber widget en dev local).
        const params = new URLSearchParams({
          "public-key": result.public_key,
          currency: result.currency,
          "amount-in-cents": String(result.amount_in_cents),
          reference: result.reference,
          "signature:integrity": result.signature,
        });

        // Wompi CloudFront blocks local/non-HTTPS redirect URLs (ex: http://localhost...)
        if (result.redirect_url) {
          const isHttpsRedirect =
            typeof result.redirect_url === "string" &&
            result.redirect_url.startsWith("https://");
          if (isHttpsRedirect) {
            params.set("redirect-url", result.redirect_url);
          }
        }
        if (result.customer_email) {
          params.set("customer-data:email", result.customer_email);
        }

        const checkoutUrl = `https://checkout.wompi.co/p/?${params.toString()}`;
        const popup = window.open(checkoutUrl, "_blank", "noopener,noreferrer");

        if (!popup) {
          setMessage("Permite ventanas emergentes para abrir el checkout sin salir del marketplace.");
          setPurchaseBusy(false);
          return;
        }
        return;
      }

      setMessage("Respuesta inesperada del servidor");
      console.log("Wompi checkout response:", result);
    } catch (err) {
      setPurchaseBusy(false);
      setMessage("Error iniciando pago");
      console.error(err);
    }
  }

  function renderBuyAction() {
    if (!viewerId) {
      return (
        <Link
          className={cn(
            buttonVariants({ size: "sm", variant: "primary" }),
            compact && "h-8 px-2.5 text-xs",
          )}
          href={loginHref}
        >
          {compact ? "Iniciar sesion" : "Inicia sesion para comprar"}
        </Link>
      );
    }

    if (isOwnListing) {
      return (
        <span className="text-xs font-medium text-slate-500">
          Es tu publicacion
        </span>
      );
    }

    if (!inStock) {
      return (
        <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
          Agotado
        </span>
      );
    }

    if (needsShippingSetup) {
      return (
        <Link
          className={cn(
            buttonVariants({ size: "sm", variant: "primary" }),
            compact && "h-8 px-2.5 text-xs",
          )}
          href="/cuenta/perfil"
        >
          {compact ? "Datos de envio" : "Configurar datos de envio"}
        </Link>
      );
    }

    if (sellerIsAdmin) {
      return (
        <Button
          className={compact ? "h-8 px-2.5 text-xs" : undefined}
          disabled={purchaseBusy}
          onClick={handleWompiPayClick}
          size="sm"
          type="button"
          variant="primary"
        >
          {purchaseBusy ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ...
            </>
          ) : compact ? (
            <>Comprar</>
          ) : (
            <>Comprar {priceLabel}</>
          )}
        </Button>
      );
    }

    return (
      <Button
        className={compact ? "h-8 px-2.5 text-xs" : undefined}
        disabled={purchaseBusy}
        onClick={handleBuyClick}
        size="sm"
        type="button"
        variant="primary"
      >
        {purchaseBusy ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ...
          </>
        ) : compact ? (
          <>Comprar</>
        ) : (
          <>Comprar · {priceLabel}</>
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "mt-auto space-y-2 border-t border-slate-100",
        compact ? "mt-2 pt-2" : "mt-4 pt-4",
      )}
    >
      {message ? (
        <p className="rounded-xl bg-brand-light px-3 py-2 text-xs text-brand-dark">
          {message}
        </p>
      ) : null}

      {showPaidShippingNotice ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          El precio mostrado es solo del producto y no incluye envio. El costo
          de envio depende de tu ubicacion y se coordina directamente con el
          vendedor.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        {renderBuyAction()}

        {viewerId ? (
          <button
            aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={favorited}
            className={cn(
              buttonVariants({ size: "sm", variant: "secondary" }),
              compact && "h-8 w-8 px-0",
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
            <span className={compact ? "sr-only" : "hidden sm:inline"}>
              {favorited ? "Quitar" : "Favorito"}
            </span>
          </button>
        ) : null}

        {showWhatsappButton ? (
          <a
            className={cn(
              buttonVariants({ size: "sm", variant: "secondary" }),
              "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
            )}
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            WhatsApp
          </a>
        ) : null}
      </div>

      {showSellerPayoutPreview ? (
        <div className="rounded-xl border border-brand/15 bg-brand-light/20 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
            Metodos de pago del vendedor
          </p>
          <div className="mt-2">
            <SellerPayoutMethodsDisplay compact payout={sellerPayout} />
          </div>
        </div>
      ) : null}

      {!compact ? (
        <p className="text-xs text-slate-500" title={title}>
          {needsShippingSetup
            ? "Necesitas pais, ciudad, direccion y telefono en tu perfil para comprar."
            : showSellerPayoutPreview
              ? "Usa uno de estos metodos para pagar al vendedor despues de confirmar la compra."
              : "Tras comprar veras los datos de pago del vendedor para transferir fuera de Woundu."}
        </p>
      ) : null}
    </div>
  );
}
