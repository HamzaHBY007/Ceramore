"use client";

import { useState } from "react";
import type { ReferenceWithCalibres } from "@/lib/types";

interface Props {
  editingRef: ReferenceWithCalibres | null;
  onClose: () => void;
}

interface CalibreInput {
  nom: string;
  quantite_boites: number;
}

export default function ReferenceForm({ editingRef, onClose }: Props) {
  const [code, setCode] = useState(editingRef?.code || "");
  const [nom, setNom] = useState(editingRef?.nom || "");
  const [largeur, setLargeur] = useState(editingRef?.largeur_cm?.toString() || "");
  const [longueur, setLongueur] = useState(editingRef?.longueur_cm?.toString() || "");
  const [pieces, setPieces] = useState(editingRef?.pieces_par_boite?.toString() || "");
  const [prix, setPrix] = useState(editingRef?.prix_unitaire_m2?.toString() || "");
  const [seuil, setSeuil] = useState(editingRef?.seuil_alerte?.toString() || "5");
  const [calibres, setCalibres] = useState<CalibreInput[]>(
    editingRef?.calibres?.map((c) => ({ nom: c.nom, quantite_boites: c.quantite_boites })) || [
      { nom: "Standard", quantite_boites: 0 },
    ]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const m2PerBox =
    largeur && longueur && pieces
      ? (parseFloat(largeur) / 100) * (parseFloat(longueur) / 100) * parseInt(pieces)
      : 0;

  const totalBoxes = calibres.reduce((s, c) => s + (c.quantite_boites || 0), 0);
  const totalM2 = totalBoxes * m2PerBox;
  const totalValue = totalM2 * (parseFloat(prix) || 0);

  const addCalibre = () => {
    setCalibres([...calibres, { nom: "", quantite_boites: 0 }]);
  };

  const removeCalibre = (index: number) => {
    if (calibres.length <= 1) return;
    setCalibres(calibres.filter((_, i) => i !== index));
  };

  const updateCalibre = (index: number, field: keyof CalibreInput, value: string | number) => {
    const updated = [...calibres];
    if (field === "quantite_boites") {
      updated[index] = { ...updated[index], quantite_boites: typeof value === "string" ? parseInt(value) || 0 : value };
    } else {
      updated[index] = { ...updated[index], nom: String(value) };
    }
    setCalibres(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!code || !nom || !largeur || !longueur || !pieces) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setSaving(false);
      return;
    }

    if (calibres.some((c) => !c.nom.trim())) {
      setError("Chaque calibre doit avoir un nom.");
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
      prix_unitaire_m2: parseFloat(prix) || 0,
      seuil_alerte: parseInt(seuil) || 5,
      calibres,
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom du Produit *</label>
              <input className="input-field" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Marbre Blanc 60x60" />
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Pièces/Boîte *</label>
              <input className="input-field" type="number" value={pieces} onChange={(e) => setPieces(e.target.value)} placeholder="4" />
            </div>
          </div>

          {/* Auto-calculated m² per box */}
          {m2PerBox > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-medium">
                📐 m² par boîte : <span className="text-lg font-bold">{m2PerBox.toFixed(4)}</span> m²
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Prix unitaire (DH/m²)</label>
              <input className="input-field" type="number" step="0.01" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="120.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Seuil d&apos;alerte (boîtes)</label>
              <input className="input-field" type="number" value={seuil} onChange={(e) => setSeuil(e.target.value)} placeholder="5" />
            </div>
          </div>

          {/* Calibres */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-300">Calibres (Grades de qualité)</label>
              <button type="button" onClick={addCalibre} className="text-sm text-ceramore-gold hover:text-amber-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un calibre
              </button>
            </div>
            <div className="space-y-2">
              {calibres.map((cal, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl">
                  <input
                    className="input-field flex-1"
                    value={cal.nom}
                    onChange={(e) => updateCalibre(index, "nom", e.target.value)}
                    placeholder="Nom du calibre (ex: A, B, C)"
                  />
                  <input
                    className="input-field w-32"
                    type="number"
                    value={cal.quantite_boites || ""}
                    onChange={(e) => updateCalibre(index, "quantite_boites", e.target.value)}
                    placeholder="Boîtes"
                  />
                  {calibres.length > 1 && (
                    <button type="button" onClick={() => removeCalibre(index)} className="text-red-400 hover:text-red-300 p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live summary */}
          {totalBoxes > 0 && m2PerBox > 0 && (
            <div className="p-4 bg-ceramore-gold/10 border border-ceramore-gold/20 rounded-xl space-y-1">
              <p className="text-amber-300 text-sm">
                📦 Total boîtes : <span className="font-bold">{totalBoxes}</span> | 
                📐 Total m² : <span className="font-bold">{totalM2.toFixed(2)}</span> | 
                💰 Valeur : <span className="font-bold">{totalValue.toFixed(2)} DH</span>
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
