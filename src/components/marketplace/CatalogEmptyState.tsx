import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

type CatalogEmptyStateProps = Readonly<{
  countryName?: string;
}>;

export function CatalogEmptyState({ countryName }: CatalogEmptyStateProps) {
  const title = countryName
    ? `No hay productos en ${countryName}`
    : "Aun no hay productos publicados";
  const description = countryName
    ? "Prueba con otro país desde la barra superior, quita filtros de categoría o amplía la búsqueda."
    : "Se el primero en compartir una publicacion atractiva y llegar a nuevos compradores dentro de Woundu.";

  return (
    <section className="rounded-[2rem] border border-dashed border-brand/30 bg-white/90 p-8 text-center shadow-inner shadow-brand/5 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <PackageSearch aria-hidden="true" className="h-7 w-7" />
      </div>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      <Link
        className={cn(buttonVariants({ className: "mt-6", variant: "secondary" }))}
        href="/"
      >
        Ir al inicio
      </Link>
    </section>
  );
}
