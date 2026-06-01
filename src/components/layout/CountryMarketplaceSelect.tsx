"use client";

import { ChevronDown, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  LATIN_AMERICA_COUNTRIES,
  latinAmericaCountryFromSlug,
  latinAmericaCountryToSlug,
  type LatinAmericaCountry,
} from "@/constants/latinAmericaCountries";
import { cn } from "@/lib/utils";

const TRIGGER_CLASSES =
  "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-4 focus-visible:ring-slate-950/5";

type CountryMarketplaceSelectProps = Readonly<{
  layout: "desktop" | "mobile";
}>;

export function CountryMarketplaceSelect({
  layout,
}: CountryMarketplaceSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const searchId = `${listboxId}-search`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const raw = searchParams.get("pais")?.trim() ?? "";
  const resolved = raw ? latinAmericaCountryFromSlug(raw) : null;
  const selectedSlug = resolved ? latinAmericaCountryToSlug(resolved) : "";
  const selectedLabel = resolved ?? "Todos los países";

  const filteredCountries = useMemo(() => {
    const needle = normalizeCountrySearch(query);
    if (!needle) {
      return LATIN_AMERICA_COUNTRIES;
    }

    return LATIN_AMERICA_COUNTRIES.filter((country) =>
      normalizeCountrySearch(country).includes(needle),
    );
  }, [query]);

  const options = useMemo(
    () => [
      { slug: "", label: "Todos los países" as const },
      ...filteredCountries.map((country) => ({
        slug: latinAmericaCountryToSlug(country),
        label: country,
      })),
    ],
    [filteredCountries],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function navigateToCountry(slug: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!slug) {
      nextParams.delete("pais");
    } else {
      nextParams.set("pais", slug);
    }

    const queryString = nextParams.toString();
    router.push(queryString ? `/marketplace?${queryString}` : "/marketplace");
    setIsOpen(false);
    setQuery("");
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % options.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + options.length) % options.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) {
        navigateToCountry(option.slug);
      }
    }
  }

  return (
    <div
      className={cn(
        layout === "desktop" ? "hidden shrink-0 md:block" : "block w-full md:hidden",
      )}
      ref={containerRef}
    >
      <div
        className={cn(
          layout === "mobile" ? "flex w-full flex-col gap-1.5" : "block",
        )}
      >
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wide text-slate-500",
            layout === "desktop" && "sr-only",
            layout === "mobile" && "text-slate-600",
          )}
        >
          Productos por país
        </span>

        <div className="relative">
          <button
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={`País seleccionado: ${selectedLabel}. Abrir selector de países`}
            className={cn(
              TRIGGER_CLASSES,
              layout === "desktop" && "max-w-[11rem] lg:max-w-[13rem]",
            )}
            onClick={() => {
              setIsOpen((current) => !current);
              if (isOpen) {
                setQuery("");
              }
            }}
            type="button"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 shrink-0 text-slate-500 transition",
                isOpen && "rotate-180",
              )}
            />
          </button>

          {isOpen ? (
            <div
              className={cn(
                "absolute z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10",
                layout === "desktop"
                  ? "right-0 w-[min(100vw-2rem,18rem)]"
                  : "left-0 right-0 w-full",
              )}
            >
              <div className="border-b border-slate-100 p-2">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    aria-controls={listboxId}
                    aria-label="Buscar país"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
                    id={searchId}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown" && options.length > 0) {
                        event.preventDefault();
                        setActiveIndex(0);
                      }
                    }}
                    placeholder="Buscar país..."
                    ref={searchInputRef}
                    type="search"
                    value={query}
                  />
                </div>
              </div>

              <ul
                aria-label="Países disponibles"
                className="max-h-64 overflow-y-auto py-1 [-ms-overflow-style:auto] [scrollbar-width:thin]"
                id={listboxId}
                onKeyDown={handleListKeyDown}
                role="listbox"
                tabIndex={-1}
              >
                {options.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-slate-500">
                    No hay países que coincidan con tu búsqueda.
                  </li>
                ) : (
                  options.map((option, index) => (
                    <CountryOption
                      index={index}
                      isActive={activeIndex === index}
                      isSelected={option.slug === selectedSlug}
                      key={option.slug || "all-countries"}
                      label={option.label}
                      onHighlight={() => setActiveIndex(index)}
                      onSelect={() => navigateToCountry(option.slug)}
                    />
                  ))
                )}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CountryOption({
  index,
  isActive,
  isSelected,
  label,
  onHighlight,
  onSelect,
}: Readonly<{
  index: number;
  isActive: boolean;
  isSelected: boolean;
  label: string | LatinAmericaCountry;
  onHighlight: () => void;
  onSelect: () => void;
}>) {
  return (
    <li role="presentation">
      <button
        aria-selected={isSelected}
        className={cn(
          "flex w-full items-center px-3 py-2 text-left text-sm transition",
          isActive
            ? "bg-brand text-white"
            : isSelected
              ? "bg-brand-light font-semibold text-brand-dark"
              : "text-slate-800 hover:bg-slate-50",
        )}
        id={`country-option-${index}`}
        onMouseEnter={onHighlight}
        onClick={onSelect}
        role="option"
        type="button"
      >
        {label}
      </button>
    </li>
  );
}

function normalizeCountrySearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type CountryMarketplaceSelectFallbackProps = Readonly<{
  layout: "desktop" | "mobile";
}>;

export function CountryMarketplaceSelectFallback({
  layout,
}: CountryMarketplaceSelectFallbackProps) {
  return (
    <div
      className={cn(
        layout === "desktop" ? "hidden shrink-0 md:block" : "block w-full md:hidden",
        layout === "mobile" && "w-full",
      )}
    >
      <label className={cn(layout === "mobile" && "flex w-full flex-col gap-1.5")}>
        <span className="sr-only">Productos por país</span>
        <div
          aria-hidden="true"
          className={cn(
            TRIGGER_CLASSES,
            "cursor-not-allowed opacity-60",
            layout === "desktop" && "max-w-[11rem] lg:max-w-[13rem]",
          )}
        >
          <span className="truncate">País</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
        </div>
      </label>
    </div>
  );
}
