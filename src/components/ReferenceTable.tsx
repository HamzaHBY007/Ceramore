"use client";

import type { ReferenceWithDetails } from "@/lib/types";

interface Props {
  references: ReferenceWithDetails[];
  onEdit: (ref: ReferenceWithDetails) => void;
  onDelete: (id: number) => void;
  onStockAdjust: (ref: ReferenceWithDetails, action: "add" | "subtract") => void;
  loading: boolean;
}

export default function ReferenceTable({ references, onEdit, onDelete, onStockAdjust, loading }: Props) {
  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (references.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">Aucune référence trouvée</h3>
        <p className="text-slate-500">Ajoutez votre première référence pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-ceramore-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Références ({references.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Référence</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Type</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Dimensions</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Pcs/Caisse</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">m²/Caisse</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Prix Unit.</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Quantité</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Total m²</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Valeur</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {references.map((ref) => (
              <tr key={ref.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-white">{ref.code}</p>
                    {ref.nom && <p className="text-sm text-slate-400">{ref.nom}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${ref.type === "produit" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                    {ref.type === "produit" ? "Produit" : "Carrelage"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {ref.type === "produit" ? "—" : `${ref.largeur_cm}×${ref.longueur_cm} cm`}
                </td>
                <td className="px-6 py-4 text-slate-300">{ref.pieces_par_boite || "—"}</td>
                <td className="px-6 py-4 text-slate-300">
                  {ref.type === "produit" ? "—" : ref.m2_par_boite.toFixed(4)}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {ref.prix_unitaire.toFixed(2)} DH{ref.type === "produit" ? "" : "/m²"}
                </td>
                <td className="px-6 py-4 text-white font-semibold">{ref.quantite}</td>
                <td className="px-6 py-4 text-slate-300">
                  {ref.type === "produit" ? "—" : ref.total_m2.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-ceramore-gold font-semibold">{ref.valeur_stock.toFixed(2)} DH</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{new Date(ref.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onStockAdjust(ref, "add")}
                      className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Ajouter au stock"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onStockAdjust(ref, "subtract")}
                      className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                      title="Retirer du stock"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(ref)}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(ref.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
