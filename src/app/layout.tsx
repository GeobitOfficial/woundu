import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout";
import { BRAND_FAVICON_SRC } from "@/constants/branding";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://woundu.com"),
  icons: {
    icon: [{ url: BRAND_FAVICON_SRC, type: "image/jpeg" }],
    apple: [{ url: BRAND_FAVICON_SRC, type: "image/jpeg" }],
  },
  title: {
    default: "Woundu | Marketplace moderno",
    template: "%s | Woundu",
  },
  description:
    "Compra, vende y descubre productos en Woundu, un marketplace moderno, rapido y confiable construido para crecer.",
  keywords: [
    "Woundu",
    "marketplace",
    "comprar productos",
    "vender productos",
    "publicar productos",
    "tienda online",
  ],
  openGraph: {
    title: "Woundu | Marketplace moderno",
    description:
      "Compra, vende y descubre productos en Woundu con una experiencia rapida, segura y mobile first.",
    siteName: "Woundu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Woundu | Marketplace moderno",
    description:
      "Compra, vende y descubre productos en Woundu con una experiencia rapida, segura y mobile first.",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
