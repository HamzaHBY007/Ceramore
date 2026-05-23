"use client";

import { useState } from "react";
import type { ReferenceWithCalibres } from "@/lib/types";

interface Props {
  reference: ReferenceWithCalibres;
  type: "entree" | "sortie";
  onClose: () => void;
}

export default function StockModal({ reference, type, onClose }: Props) {
  const [selectedCalibre, setSelectedCalibre] = useState(
    reference.calibres.length > 0 ? reference.calibres[0].id.toString() : ""
  );
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setError("La quantité doit être supérieure à 0");
      return;
    }

    if (type === "sortie") {
      const calibre = reference.calibres.find((c) => c.id === parseInt(selectedCalibre));
      if (calibre && qty > calibre.quantite_boites) {
        setError(`Stock insuffisant. ${calibre.nom} a seulement ${calibre.quantite_boites} boîtes.`);
        return;
      }
    }

    setSaving(true);

    const res = await fetch("/api/references/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_id: reference.id,
        calibre_id: parseInt(selectedCalibre),
        type,
        quantite_boites: qty,
        note: note || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {type === "entree" ? "Entrée de Stock" : "Sortie de Stock"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-900/50 rounded-xl">
          <p className="text-sm text-slate-400">Référence</p>
          <p className="font-semibold text-white">{reference.code} — {reference.nom}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Calibre</label>
            <select
              className="input-field"
              value={selectedCalibre}
              onChange={(e) => setSelectedCalibre(e.target.value)}
            >
              {reference.calibres.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.nom} ({cal.quantite_boites} boîtes en stock)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Quantité (boîtes)
            </label>
            <input
              className="input-field"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Nombre de boîtes"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Note (optionnel)</label>
            <input
              className="input-field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Commande #1234"
            />
          </div>

          {quantity && parseInt(quantity) > 0 && (
            <div className={`p-3 rounded-xl border ${type === "entree" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"}`}>
              <p className={`text-sm ${type === "entree" ? "text-emerald-400" : "text-orange-400"}`}>
                {type === "entree" ? "+" : "-"}{parseInt(quantity)} boîtes = {(parseInt(quantity) * reference.m2_par_boite).toFixed(2)} m²
                {reference.prix_unitaire_m2 > 0 && (
                  <span> = {(parseInt(quantity) * reference.m2_par_boite * reference.prix_unitaire_m2).toFixed(2)} DH</span>
                )}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${
                type === "entree"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {saving ? "..." : type === "entree" ? "Confirmer l'entrée" : "Confirmer la sortie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
