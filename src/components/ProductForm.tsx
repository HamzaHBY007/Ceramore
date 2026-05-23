"use client";

import { useState } from "react";
import type { ReferenceWithDetails } from "@/lib/types";

interface Props {
  editingRef: ReferenceWithDetails | null;
  onClose: () => void;
}

export default function ProductForm({ editingRef, onClose }: Props) {
  const [code, setCode] = useState(editingRef?.code || "");
  const [nom, setNom] = useState(editingRef?.nom || "");
  const [prix, setPrix] = useState(editingRef?.prix_unitaire_m2?.toString() || "");
  const [pieces, setPieces] = useState(editingRef?.pieces_par_boite?.toString() || "");
  const [caises, setCaises] = useState(editingRef?.quantite_caises?.toString() || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const totalCaises = parseInt(caises) || 0;
  const totalValue = totalCaises * (parseFloat(prix) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!code) {
      setError("Le code produit est obligatoire.");
      setSaving(false);
      return;
    }

    if (!prix || parseFloat(prix) <= 0) {
      setError("Le prix unitaire est obligatoire.");
      setSaving(false);
      return;
    }

    if (!caises || parseInt(caises) < 0) {
      setError("Le nombre de caises est obligatoire.");
      setSaving(false);
      return;
    }

    const body = {
      id: editingRef?.id,
      code,
      nom,
      largeur_cm: 0,
      longueur_cm: 0,
      pieces_par_boite: parseInt(pieces) || 0,
      prix_unitaire_m2: parseFloat(prix),
      quantite_caises: parseInt(caises),
      type: "produit",
    };

    const res = await fetch("/api/references", {
      method: editingRef ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'enregistrement");
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-lg p-8 slide-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingRef ? "Modifier le Produit" : "Ajouter un Produit"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Code Produit *</label>
            <input className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: PRD-001" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom du Produit</label>
            <input className="input-field" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Colle carrelage (optionnel)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Pièces par Caisse</label>
            <input className="input-field" type="number" value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="Ex: 12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prix Unitaire (DH) *</label>
              <input className="input-field" type="number" step="0.01" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="50.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de Caises *</label>
              <input className="input-field" type="number" min="0" value={caises} onChange={(e) => setCaises(e.target.value)} placeholder="10" />
            </div>
          </div>

          {totalCaises > 0 && parseFloat(prix) > 0 && (
            <div className="p-4 bg-ceramore-gold/10 border border-ceramore-gold/20 rounded-xl">
              <p className="text-amber-300 text-sm">
                Total caises : <span className="font-bold">{totalCaises}</span> | 
                Prix total : <span className="font-bold">{totalValue.toFixed(2)} DH</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Enregistrement..." : editingRef ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
