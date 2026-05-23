"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReferenceWithDetails, DashboardStats, StockSnapshot, FilterOptions } from "@/lib/types";
import StatsCards from "@/components/StatsCards";
import ReferenceForm from "@/components/ReferenceForm";
import ProductForm from "@/components/ProductForm";
import ReferenceTable from "@/components/ReferenceTable";
import StockCharts from "@/components/StockCharts";
import SearchFilters from "@/components/SearchFilters";
import ExportButtons from "@/components/ExportButtons";

export default function Dashboard() {
  const [references, setReferences] = useState<ReferenceWithDetails[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_references: 0, total_caises: 0, total_m2: 0, total_valeur: 0,
  });
  const [snapshots, setSnapshots] = useState<StockSnapshot[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ codes: [], noms: [], dimensions: [] });
  const [showForm, setShowForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingRef, setEditingRef] = useState<ReferenceWithDetails | null>(null);
  const [filters, setFilters] = useState({ search: "", code: "", nom: "", dimension: "", dateFrom: "", dateTo: "", type: "" });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.code) params.set("code", filters.code);
    if (filters.nom) params.set("nom", filters.nom);
    if (filters.dimension) params.set("dimension", filters.dimension);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.type) params.set("type", filters.type);

    const [refsRes, snapsRes] = await Promise.all([
      fetch(`/api/references?${params}`),
      fetch("/api/stock-history/snapshots?days=90"),
    ]);

    const refsData = await refsRes.json();
    const snapsData = await snapsRes.json();

    setReferences(refsData.references);
    setStats(refsData.stats);
    setFilterOptions(refsData.filterOptions);
    setSnapshots(snapsData);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (ref: ReferenceWithDetails) => {
    setEditingRef(ref);
    if (ref.type === "produit") {
      setShowProductForm(true);
    } else {
      setShowForm(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette référence et toutes ses données ?")) return;
    await fetch("/api/references", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setShowProductForm(false);
    setEditingRef(null);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-ceramore-gold to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-ceramore-gold/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-ceramore-gold to-primary-400 bg-clip-text text-transparent">
                Ceramore
              </h1>
              <p className="text-xs text-slate-400">Gestion d&apos;Inventaire</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExportButtons />
            <button
              onClick={() => { setEditingRef(null); setShowProductForm(true); }}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un Produit
            </button>
            <button
              onClick={() => { setEditingRef(null); setShowForm(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle Référence
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <StatsCards stats={stats} loading={loading} />

        {/* Charts */}
        <StockCharts snapshots={snapshots} />

        {/* Filters */}
        <SearchFilters filters={filters} onFiltersChange={setFilters} filterOptions={filterOptions} />

        {/* Reference Table */}
        <ReferenceTable
          references={references}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </main>

      {/* Add/Edit Reference Form Modal */}
      {showForm && (
        <ReferenceForm
          editingRef={editingRef}
          onClose={handleFormClose}
        />
      )}

      {/* Add/Edit Product Form Modal */}
      {showProductForm && (
        <ProductForm
          editingRef={editingRef}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
