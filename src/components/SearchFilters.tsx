"use client";

interface Filters {
  search: string;
  calibre: string;
  dateFrom: string;
  dateTo: string;
  lowStock: boolean;
}

interface Props {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: Props) {
  const update = (key: keyof Filters, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: "", calibre: "", dateFrom: "", dateTo: "", lowStock: false });
  };

  const hasFilters = filters.search || filters.calibre || filters.dateFrom || filters.dateTo || filters.lowStock;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Calibre</label>
          <input
            className="input-field"
            placeholder="Filtrer par calibre..."
            value={filters.calibre}
            onChange={(e) => update("calibre", e.target.value)}
          />
        </div>
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
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-900/40 border border-slate-600/50 w-full hover:border-ceramore-gold/30 transition-all">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-600 text-ceramore-gold focus:ring-ceramore-gold/50 bg-slate-900"
              checked={filters.lowStock}
              onChange={(e) => update("lowStock", e.target.checked)}
            />
            <span className="text-sm text-slate-300">Stock bas uniquement</span>
          </label>
        </div>
      </div>
    </div>
  );
}
