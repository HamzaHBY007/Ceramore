"use client";

import { useState } from "react";
import type { ReferenceWithDetails } from "@/lib/types";

interface Props {
  reference: ReferenceWithDetails;
  action: "add" | "subtract";
  onClose: () => void;
  onConfirm: () => void;
}

export default function StockAdjustModal({ reference, action, onClose, onConfirm }: Props) {
  const isProduct = reference.type === "produit";
  const isTile = reference.type === "carrelage";

  const [mode, setMode] = useState<"caises" | "unites">(isProduct ? "unites" : "caises");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parsedAmount = parseInt(amount) || 0;
  const ppb = reference.pieces_par_boite || 1;
  const m2PerPiece = isTile && ppb > 0 ? reference.m2_par_boite / ppb : 0;

  const piecesToAdjust = mode === "caises" ? parsedAmount * ppb : parsedAmount;

  const newQuantite = (() => {
    if (action === "add") return reference.quantite + piecesToAdjust;
    return Math.max(0, reference.quantite - piecesToAdjust);
  })();

  const previewTotalM2 = isTile ? newQuantite * m2PerPiece : 0;
  const previewTotalPrice = isProduct
    ? newQuantite * reference.prix_unitaire
    : previewTotalM2 * reference.prix_unitaire;

  const deltaM2 = isTile ? piecesToAdjust * m2PerPiece : 0;
  const deltaPrice = isProduct
    ? piecesToAdjust * reference.prix_unitaire
    : deltaM2 * reference.prix_unitaire;

  const handleSubmit = async () => {
    if (parsedAmount <= 0) {
      setError("Veuillez saisir une quantité valide.");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/references/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_id: reference.id,
        type: action === "add" ? "entree" : "sortie",
        quantite: piecesToAdjust,
        note: `${action === "add" ? "Ajout" : "Retrait"} de ${parsedAmount} ${mode === "caises" ? "caises" : "unités"}`,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setSaving(false);
      return;
    }

    onConfirm();
  };

  const actionLabel = action === "add" ? "Ajouter" : "Retirer";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 slide-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {actionLabel} — {reference.code}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {isTile && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Type de quantité</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("caises")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === "caises" ? "bg-ceramore-gold/20 text-ceramore-gold border border-ceramore-gold/40" : "bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700"}`}
              >
                Caises
              </button>
              <button
                type="button"
                onClick={() => setMode("unites")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === "unites" ? "bg-ceramore-gold/20 text-ceramore-gold border border-ceramore-gold/40" : "bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700"}`}
              >
                Unités (pièces)
              </button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {isProduct ? "Nombre d'unités" : mode === "caises" ? "Nombre de caises" : "Nombre de pièces"}
          </label>
          <input
            className="input-field"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Quantité"
            autoFocus
          />
        </div>

        {isTile && mode === "caises" && parsedAmount > 0 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
            {parsedAmount} caisse{parsedAmount > 1 ? "s" : ""} = {piecesToAdjust} pièces ({ppb} pcs/caisse)
          </div>
        )}

        {parsedAmount > 0 && (
          <div className="mb-4 space-y-2">
            <div className={`p-3 rounded-xl text-sm ${action === "add" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <p className={action === "add" ? "text-emerald-300" : "text-red-300"}>
                {actionLabel} <span className="font-bold">{piecesToAdjust}</span> pièce{piecesToAdjust > 1 ? "s" : ""} {action === "add" ? "au" : "du"} stock
              </p>
            </div>

            <div className="p-3 bg-slate-700/30 border border-slate-600/20 rounded-xl text-sm space-y-1">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Après confirmation :</p>
              {isTile && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Total m²</span>
                  <span className="text-white font-medium">
                    {previewTotalM2.toFixed(2)} m²
                    <span className={`ml-1 text-xs ${action === "add" ? "text-emerald-400" : "text-red-400"}`}>
                      ({action === "add" ? "+" : "-"}{deltaM2.toFixed(2)})
                    </span>
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Valeur totale</span>
                <span className="text-ceramore-gold font-medium">
                  {previewTotalPrice.toFixed(2)} DH
                  <span className={`ml-1 text-xs ${action === "add" ? "text-emerald-400" : "text-red-400"}`}>
                    ({action === "add" ? "+" : "-"}{deltaPrice.toFixed(2)})
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pièces en stock</span>
                <span className="text-white font-medium">
                  {newQuantite}
                  <span className={`ml-1 text-xs ${action === "add" ? "text-emerald-400" : "text-red-400"}`}>
                    ({action === "add" ? "+" : "-"}{piecesToAdjust})
                  </span>
                </span>
              </div>
              {isTile && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Caises</span>
                  <span className="text-white font-medium">
                    {(newQuantite / ppb).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-sm">Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={saving || parsedAmount <= 0}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${action === "add" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}
          >
            {saving ? "..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
