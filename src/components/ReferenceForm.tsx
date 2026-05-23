"use client";

import { useState } from "react";
import type { ReferenceWithDetails } from "@/lib/types";

interface Props {
  editingRef: ReferenceWithDetails | null;
  onClose: () => void;
}

export default function ReferenceForm({ editingRef, onClose }: Props) {
  const [code, setCode] = useState(editingRef?.code || "");
  const [nom, setNom] = useState(editingRef?.nom || "");
  const [largeur, setLargeur] = useState(editingRef?.largeur_cm?.toString() || "");
  const [longueur, setLongueur] = useState(editingRef?.longueur_cm?.toString() || "");
  const [pieces, setPieces] = useState(editingRef?.pieces_par_boite?.toString() || "");
  const [prix, setPrix] = useState(editingRef?.prix_unitaire?.toString() || "");
  const editBoxes = editingRef && editingRef.pieces_par_boite > 0
    ? Math.floor(editingRef.quantite / editingRef.pieces_par_boite).toString()
    : editingRef?.quantite?.toString() || "";
  const [quantite, setQuantite] = useState(editBoxes);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const m2PerBox =
    largeur && longueur && pieces
      ? (parseFloat(largeur) / 100) * (parseFloat(longueur) / 100) * parseInt(pieces)
      : 0;

  const totalBoxes = parseInt(quantite) || 0;
  const totalPieces = totalBoxes * (parseInt(pieces) || 1);
  const m2PerPiece = parseInt(pieces) > 0 ? m2PerBox / parseInt(pieces) : 0;
  const totalM2 = totalPieces * m2PerPiece;
  const totalValue = totalM2 * (parseFloat(prix) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!code || !largeur || !longueur || !pieces) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setSaving(false);
      return;
    }

    if (!prix || parseFloat(prix) <= 0) {
      setError("Le prix unitaire est obligatoire.");
      setSaving(false);
      return;
    }

    if (!quantite || parseInt(quantite) < 0) {
      setError("Le nombre de caises est obligatoire.");
      setSaving(false);
      return;
    }

    const body = {
      id: editingRef?.id,
      code,
      nom,
      largeur_cm: parseFloat(largeur),
      longueur_cm: parseFloat(longueur),
      pieces_par_boite: parseInt(pieces),
      prix_unitaire: parseFloat(prix),
      quantite: totalPieces,
      type: "carrelage",
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
      <div className="glass-card w-full max-w-2xl p-8 slide-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingRef ? "Modifier la Référence" : "Nouvelle Référence"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Code Référence *</label>
              <input className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: CRM-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Calibre</label>
              <input className="input-field" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: A, B, C (optionnel)" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Largeur (cm) *</label>
              <input className="input-field" type="number" step="0.1" value={largeur} onChange={(e) => setLargeur(e.target.value)} placeholder="60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Longueur (cm) *</label>
              <input className="input-field" type="number" step="0.1" value={longueur} onChange={(e) => setLongueur(e.target.value)} placeholder="60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Pièces/Caisse *</label>
              <input className="input-field" type="number" value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="4" />
            </div>
          </div>

          {m2PerBox > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-medium">
                m² par caisse : <span className="text-lg font-bold">{m2PerBox.toFixed(4)}</span> m²
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prix unitaire (DH/m²) *</label>
              <input className="input-field" type="number" step="0.01" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="120.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de Caises *</label>
              <input className="input-field" type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="10" />
            </div>
          </div>

          {totalBoxes > 0 && m2PerBox > 0 && parseFloat(prix) > 0 && (
            <div className="p-4 bg-ceramore-gold/10 border border-ceramore-gold/20 rounded-xl space-y-1">
              <p className="text-amber-300 text-sm">
                Caises : <span className="font-bold">{totalBoxes}</span> | 
                Pièces : <span className="font-bold">{totalPieces}</span> | 
                Total m² : <span className="font-bold">{totalM2.toFixed(2)}</span> | 
                Valeur : <span className="font-bold">{totalValue.toFixed(2)} DH</span>
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
