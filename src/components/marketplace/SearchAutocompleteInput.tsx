"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatProductPrice } from "@/utils/productDisplay";
import {
  getSearchSuggestionsAction,
  type SearchSuggestionItem,
} from "@/features/products/actions/productSearchActions";

type SearchAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: "default" | "large";
  autoFocus?: boolean;
};

export function SearchAutocompleteInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar productos, marcas y más...",
  className,
  inputClassName,
  size = "default",
  autoFocus = false,
}: SearchAutocompleteInputProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search for suggestions
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await getSearchSuggestionsAction(trimmed);
        setSuggestions(results);
        setIsOpen(true);
      } catch (error) {
        console.error("Error al obtener sugerencias de búsqueda:", error);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSuggestion(slug: string) {
    setIsOpen(false);
    router.push(`/marketplace/${slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  const hasSuggestions = suggestions.length > 0;
  const showDropdown = isOpen && (isLoading || hasSuggestions || value.trim().length >= 2);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex w-full items-center">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 text-slate-400 h-4 w-4"
        />
        <input
          autoComplete="off"
          autoFocus={autoFocus}
          className={cn(
            "w-full bg-white pl-11 pr-10 text-slate-900 placeholder:text-slate-400 focus:outline-none transition [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            size === "large"
              ? "h-12 rounded-2xl border border-slate-200 text-base focus:border-brand focus:ring-4 focus:ring-brand/10"
              : "h-10 rounded-md border border-slate-300 text-sm focus:border-brand focus:ring-2 focus:ring-brand/30",
            inputClassName,
          )}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          type="text"
          value={value}
        />

        {value ? (
          <button
            aria-label="Limpiar búsqueda"
            className="absolute right-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            type="button"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Desplegable de Autocompletado */}
      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-brand" />
              <span>Buscando sugerencias...</span>
            </div>
          ) : hasSuggestions ? (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sugerencias de productos
              </div>
              <ul className="max-h-80 overflow-y-auto py-1">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
                      onClick={() => handleSelectSuggestion(item.slug)}
                      type="button"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                        {item.imageUrl ? (
                          <img
                            alt={item.title}
                            className="h-full w-full object-cover"
                            src={item.imageUrl}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Información */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.title}
                        </p>
                        {item.categoryName ? (
                          <p className="truncate text-xs text-slate-400">
                            {item.categoryName}
                          </p>
                        ) : null}
                      </div>

                      {/* Precio */}
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold text-brand">
                          {formatProductPrice(item.price, item.currency)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Opción para ver todos los resultados */}
              {onSubmit ? (
                <button
                  className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-brand hover:text-white"
                  onClick={() => {
                    setIsOpen(false);
                    onSubmit();
                  }}
                  type="button"
                >
                  <span>Ver todos los resultados para &quot;{value.trim()}&quot;</span>
                  <Search className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">
              No encontramos sugerencias para &quot;{value.trim()}&quot;
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
