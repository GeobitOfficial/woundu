"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";

import { cn } from "@/lib/utils";

type HomeSearchBarProps = Readonly<{
  className?: string;
  size?: "default" | "large";
}>;

export function HomeSearchBar({
  className,
  size = "default",
}: HomeSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const suffix = params.toString();
    router.push(suffix ? `/marketplace?${suffix}` : "/marketplace");
  }

  return (
    <form
      className={cn("flex w-full overflow-hidden rounded-md shadow-sm", className)}
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor="home-search">
        Buscar productos
      </label>
      <input
        className={cn(
          "min-w-0 flex-1 border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30",
          size === "large" ? "h-12 text-base" : "h-10 text-sm",
        )}
        id="home-search"
        name="q"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar productos, marcas y más..."
        type="search"
        value={query}
      />
      <button
        aria-label="Buscar"
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-brand px-5 font-semibold text-white transition hover:bg-brand-hover",
          size === "large" ? "h-12 text-base" : "h-10 text-sm",
        )}
        type="submit"
      >
        <Search aria-hidden="true" className="h-5 w-5" />
      </button>
    </form>
  );
}
