import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type AccountFavoritesPaginationProps = Readonly<{
  page: number;
  totalPages: number;
}>;

export function AccountFavoritesPagination({
  page,
  totalPages,
}: AccountFavoritesPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Paginacion de favoritos"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"
    >
      {prevPage ? (
        <Link
          className={paginationLinkClass}
          href={`/cuenta/favoritos?page=${prevPage}`}
          rel="prev"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
          Anterior
        </Link>
      ) : (
        <span className={cn(paginationLinkClass, "cursor-not-allowed opacity-40")}>
          <ChevronLeft aria-hidden className="h-4 w-4" />
          Anterior
        </span>
      )}

      <p className="text-sm font-semibold text-slate-600">
        Pagina {page} de {totalPages}
      </p>

      {nextPage ? (
        <Link
          className={paginationLinkClass}
          href={`/cuenta/favoritos?page=${nextPage}`}
          rel="next"
        >
          Siguiente
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(paginationLinkClass, "cursor-not-allowed opacity-40")}>
          Siguiente
          <ChevronRight aria-hidden className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

const paginationLinkClass =
  "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark ring-1 ring-slate-200/80 transition hover:bg-brand-light/40";
