"use client";

import type { FilterOptions } from "@/lib/types";

interface Filters {
  search: string;
  code: string;
  nom: string;
  dimension: string;
  dateFrom: string;
  dateTo: string;
  type: string;
}

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  filterOptions: FilterOptions;
}

export default function SearchFilters({ filters, onFiltersChange, filterOptions }: Props) {
  const update = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: "", code: "", nom: "", dimension: "", dateFrom: "", dateTo: "", type: "" });
  };

  const hasFilters = filters.search || filters.code || filters.nom || filters.dimension || filters.dateFrom || filters.dateTo || filters.type;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Recherche &amp; Filtres
        </h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer les filtres
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Recherche (code ou nom)</label>
          <input
            className="input-field"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Référence</label>
          <select className="input-field" value={filters.code} onChange={(e) => update("code", e.target.value)}>
            <option value="">Toutes les références</option>
            {filterOptions.codes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Calibre / Nom</label>
          <select className="input-field" value={filters.nom} onChange={(e) => update("nom", e.target.value)}>
            <option value="">Tous</option>
            {filterOptions.noms.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Dimensions</label>
          <select className="input-field" value={filters.dimension} onChange={(e) => update("dimension", e.target.value)}>
            <option value="">Toutes les dimensions</option>
            {filterOptions.dimensions.map((d) => (
              <option key={d} value={d}>{d} cm</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Date début</label>
          <input
            className="input-field"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Date fin</label>
          <input
            className="input-field"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
          <select className="input-field" value={filters.type} onChange={(e) => update("type", e.target.value)}>
            <option value="">Tous les types</option>
            <option value="carrelage">Carrelage</option>
            <option value="produit">Produit</option>
          </select>
        </div>
      </div>
    </div>
  );
}
