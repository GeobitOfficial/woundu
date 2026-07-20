"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";

import { cn } from "@/lib/utils";
import { SearchAutocompleteInput } from "./SearchAutocompleteInput";

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

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    if (event) {
      event.preventDefault();
    }
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
      className={cn("relative flex w-full items-center gap-2", className)}
      onSubmit={handleSubmit}
      role="search"
    >
      <SearchAutocompleteInput
        onChange={setQuery}
        onSubmit={handleSubmit}
        placeholder="Buscar productos, marcas y más..."
        size={size}
        value={query}
      />
      <button
        aria-label="Buscar"
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-brand px-5 font-semibold text-white transition hover:bg-brand-hover",
          size === "large" ? "h-12 rounded-2xl text-base" : "h-10 rounded-md text-sm",
        )}
        type="submit"
      >
        <Search aria-hidden="true" className="h-5 w-5" />
      </button>
    </form>
  );
}
