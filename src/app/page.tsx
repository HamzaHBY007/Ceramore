"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReferenceWithCalibres, DashboardStats, StockSnapshot } from "@/lib/types";
import StatsCards from "@/components/StatsCards";
import ReferenceForm from "@/components/ReferenceForm";
import ReferenceTable from "@/components/ReferenceTable";
import StockCharts from "@/components/StockCharts";
import SearchFilters from "@/components/SearchFilters";
import LowStockAlerts from "@/components/LowStockAlerts";
import ExportButtons from "@/components/ExportButtons";
import StockModal from "@/components/StockModal";

export default function Dashboard() {
  const [references, setReferences] = useState<ReferenceWithCalibres[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_references: 0, total_boites: 0, total_m2: 0, total_valeur: 0, low_stock_count: 0,
  });
  const [snapshots, setSnapshots] = useState<StockSnapshot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRef, setEditingRef] = useState<ReferenceWithCalibres | null>(null);
  const [stockModal, setStockModal] = useState<{ ref: ReferenceWithCalibres; type: "entree" | "sortie" } | null>(null);
  const [filters, setFilters] = useState({ search: "", calibre: "", dateFrom: "", dateTo: "", lowStock: false });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.calibre) params.set("calibre", filters.calibre);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.lowStock) params.set("lowStock", "true");

    const [refsRes, snapsRes] = await Promise.all([
      fetch(`/api/references?${params}`),
      fetch("/api/stock-history/snapshots?days=90"),
    ]);

    const refsData = await refsRes.json();
    const snapsData = await snapsRes.json();

    setReferences(refsData.references);
    setStats(refsData.stats);
    setSnapshots(snapsData);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (ref: ReferenceWithCalibres) => {
    setEditingRef(ref);
    setShowForm(true);
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
        {/* Low Stock Alerts */}
        <LowStockAlerts references={references} />

        {/* Stats */}
        <StatsCards stats={stats} loading={loading} />

        {/* Charts */}
        <StockCharts snapshots={snapshots} />

        {/* Filters */}
        <SearchFilters filters={filters} onFiltersChange={setFilters} />

        {/* Reference Table */}
        <ReferenceTable
          references={references}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStock={(ref, type) => setStockModal({ ref, type })}
          loading={loading}
        />
      </main>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <ReferenceForm
          editingRef={editingRef}
          onClose={handleFormClose}
        />
      )}

      {/* Stock Movement Modal */}
      {stockModal && (
        <StockModal
          reference={stockModal.ref}
          type={stockModal.type}
          onClose={() => { setStockModal(null); fetchData(); }}
        />
      )}
    </div>
  );
}
