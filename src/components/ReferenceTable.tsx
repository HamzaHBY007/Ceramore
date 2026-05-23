"use client";

import type { ReferenceWithCalibres } from "@/lib/types";

interface Props {
  references: ReferenceWithCalibres[];
  onEdit: (ref: ReferenceWithCalibres) => void;
  onDelete: (id: number) => void;
  onStock: (ref: ReferenceWithCalibres, type: "entree" | "sortie") => void;
  loading: boolean;
}

export default function ReferenceTable({ references, onEdit, onDelete, onStock, loading }: Props) {
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
        <p className="text-slate-500">Ajoutez votre première référence de carrelage pour commencer.</p>
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
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Dimensions</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Pcs/Boîte</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">m²/Boîte</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Prix/m²</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Calibres</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Total Boîtes</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Total m²</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Valeur</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {references.map((ref) => (
              <tr key={ref.id} className={`hover:bg-slate-800/30 transition-colors ${ref.is_low_stock ? "bg-red-500/5" : ""}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {ref.is_low_stock && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Stock bas" />
                    )}
                    <div>
                      <p className="font-semibold text-white">{ref.code}</p>
                      <p className="text-sm text-slate-400">{ref.nom}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">{ref.largeur_cm}×{ref.longueur_cm} cm</td>
                <td className="px-6 py-4 text-slate-300">{ref.pieces_par_boite}</td>
                <td className="px-6 py-4 text-slate-300">{ref.m2_par_boite.toFixed(4)}</td>
                <td className="px-6 py-4 text-slate-300">{ref.prix_unitaire_m2.toFixed(2)} DH</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {ref.calibres.map((cal) => (
                      <div key={cal.id} className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 bg-slate-700/50 rounded-md text-slate-300 text-xs font-medium">{cal.nom}</span>
                        <span className="text-slate-400">{cal.quantite_boites} boîtes</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${ref.is_low_stock ? "text-red-400" : "text-white"}`}>
                    {ref.total_boites}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{ref.total_m2.toFixed(2)}</td>
                <td className="px-6 py-4 text-ceramore-gold font-semibold">{ref.valeur_stock.toFixed(2)} DH</td>
                <td className="px-6 py-4 text-slate-400 text-sm">{new Date(ref.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onStock(ref, "entree")}
                      className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Entrée de stock"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onStock(ref, "sortie")}
                      className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                      title="Sortie de stock"
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
