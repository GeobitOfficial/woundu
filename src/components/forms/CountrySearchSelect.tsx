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

import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";
import { cn } from "@/lib/utils";

type CountrySearchSelectProps = Readonly<{
  error?: string;
  name?: string;
  onCountryChange: (country: string) => void;
  selectedCountry: string;
}>;

function normalizeCountrySearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CountrySearchSelect({
  error,
  name = "country",
  onCountryChange,
  selectedCountry,
}: CountrySearchSelectProps) {
  const listboxId = useId();
  const searchId = `${listboxId}-search`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredCountries = useMemo(() => {
    const needle = normalizeCountrySearch(query);
    if (!needle) {
      return LATIN_AMERICA_COUNTRIES;
    }

    return LATIN_AMERICA_COUNTRIES.filter((country) =>
      normalizeCountrySearch(country).includes(needle),
    );
  }, [query]);

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

  function selectCountry(country: string) {
    onCountryChange(country);
    setIsOpen(false);
    setQuery("");
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (filteredCountries.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % filteredCountries.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) =>
          (current - 1 + filteredCountries.length) % filteredCountries.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const country = filteredCountries[activeIndex];
      if (country) {
        selectCountry(country);
      }
    }
  }

  const label = selectedCountry || "Selecciona tu país";

  return (
    <div className="space-y-2" ref={containerRef}>
      <span className="text-sm font-semibold text-slate-800">País</span>
      <input name={name} type="hidden" value={selectedCountry} />

      <div className="relative">
        <button
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-2xl border bg-white px-4 text-left text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15",
            error ? "border-red-300" : "border-slate-200",
          )}
          onClick={() => {
            setIsOpen((current) => !current);
            if (isOpen) {
              setQuery("");
            }
          }}
          type="button"
        >
          <span className={cn(!selectedCountry && "text-slate-400")}>{label}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0 text-slate-500 transition",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen ? (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  aria-controls={listboxId}
                  aria-label="Buscar país"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15"
                  id={searchId}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar país..."
                  ref={searchInputRef}
                  type="search"
                  value={query}
                />
              </div>
            </div>

            <ul
              aria-label="Países disponibles"
              className="max-h-56 overflow-y-auto py-1"
              id={listboxId}
              onKeyDown={handleListKeyDown}
              role="listbox"
              tabIndex={-1}
            >
              {filteredCountries.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-slate-500">
                  No hay países que coincidan con tu búsqueda.
                </li>
              ) : (
                filteredCountries.map((country, index) => (
                  <li key={country} role="presentation">
                    <button
                      aria-selected={selectedCountry === country}
                      className={cn(
                        "flex w-full items-center px-3 py-2 text-left text-sm transition",
                        activeIndex === index
                          ? "bg-brand text-white"
                          : selectedCountry === country
                            ? "bg-brand-light font-semibold text-brand-dark"
                            : "text-slate-800 hover:bg-slate-50",
                      )}
                      onClick={() => selectCountry(country)}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      type="button"
                    >
                      {country}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs leading-5 text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
