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
import StockAdjustModal from "@/components/StockAdjustModal";
import Calculator from "@/components/Calculator";

export default function Dashboard() {
  const [references, setReferences] = useState<ReferenceWithDetails[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_references: 0, total_quantite: 0, total_m2: 0, total_valeur: 0,
  });
  const [snapshots, setSnapshots] = useState<StockSnapshot[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ codes: [], noms: [], dimensions: [] });
  const [showForm, setShowForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingRef, setEditingRef] = useState<ReferenceWithDetails | null>(null);
  const [filters, setFilters] = useState({ search: "", code: "", nom: "", dimension: "", dateFrom: "", dateTo: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [stockAdjustRef, setStockAdjustRef] = useState<ReferenceWithDetails | null>(null);
  const [stockAdjustAction, setStockAdjustAction] = useState<"add" | "subtract">("add");
  const [showCalc, setShowCalc] = useState(false);

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

  const handleStockAdjust = (ref: ReferenceWithDetails, action: "add" | "subtract") => {
    setStockAdjustRef(ref);
    setStockAdjustAction(action);
  };

  const handleStockAdjustClose = () => {
    setStockAdjustRef(null);
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
            <div className="ml-4 flex items-center gap-2 pl-4 border-l border-slate-700/50">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-300">Said</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExportButtons />
            <button
              onClick={() => setShowCalc(!showCalc)}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Calculatrice"
            >
              <svg className="w-4 h-4 text-ceramore-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
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
          onStockAdjust={handleStockAdjust}
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

      {/* Stock Adjust Modal */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}

      {stockAdjustRef && (
        <StockAdjustModal
          reference={stockAdjustRef}
          action={stockAdjustAction}
          onClose={() => setStockAdjustRef(null)}
          onConfirm={handleStockAdjustClose}
        />
      )}
    </div>
  );
}
