"use client";

import { useRef, useState, type FormEvent } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
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
    <section className={cn("overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-[#6a42e8] via-[#5a35e8] to-[#42239f] p-5 text-white shadow-[0_16px_34px_rgba(90,53,232,.2)] sm:p-7", className)}>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Vagas no Brasil</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Encontre seu próximo trabalho</h1>
          <p className="mt-1.5 text-sm text-white/75">Busque por cargo, tecnologia, empresa ou habilidade.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-white/80"><SlidersHorizontal className="h-4 w-4" />Filtros inteligentes ativos</div>
      </div>
      <form onSubmit={handleSubmit} className="overflow-hidden rounded-xl bg-white p-1.5 shadow-lg">
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
            className="job-search-input h-11 rounded-lg border-0 pl-11 text-[#1d1930] focus:ring-0"
            aria-label="Buscar vagas"
          />
        </label>
          <Button
            type="submit"
            disabled={!query.trim()}
          className="h-11 rounded-lg px-7 font-semibold"
          >
            Buscar
          </Button>
        </div>
      </form>
      <div className="mt-4 flex items-center gap-2 text-xs text-white/70"><MapPin className="h-3.5 w-3.5" />Mostrando oportunidades com localização no Brasil</div>
    </section>
  );
}
