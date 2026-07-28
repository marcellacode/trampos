"use client";

import { useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchHero({ onSearch, className }: SearchHeroProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = query.trim();
    if (!text) return;
    onSearch(text);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("overflow-hidden rounded border border-border bg-card shadow-sm", className)}
    >
      <div className="flex flex-col sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar vagas</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cargo, empresa ou palavra-chave"
            className="job-search-input rounded-none border-0 pl-11 focus:ring-0"
            aria-label="Buscar vagas"
          />
        </label>
        <Button
          type="submit"
          disabled={!query.trim()}
          className="h-12 rounded-none border-t border-border px-8 font-semibold sm:border-t-0 sm:border-l"
        >
          Buscar
        </Button>
      </div>
    </form>
  );
}
