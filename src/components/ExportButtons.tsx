"use client";

import { useState } from "react";

export default function ExportButtons() {
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export?format=json");
      const data = await res.json();

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(20);
      doc.setTextColor(212, 165, 116);
      doc.text("Ceramore - Inventaire", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, 14, 30);

      autoTable(doc, {
        startY: 38,
        head: [["Code", "Nom", "Type", "Dimensions", "Pcs/Caisse", "m²/Caisse", "Prix Unitaire", "Caises", "Total m²", "Valeur (DH)"]],
        body: data.map((r: Record<string, unknown>) => [
          r.code,
          r.nom,
          r.type,
          r.dimensions,
          r.pieces_par_caisse,
          r.m2_par_caisse,
          r.prix_unitaire,
          r.caises,
          r.total_m2,
          r.valeur_stock,
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [212, 165, 116], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const totalValeur = data.reduce((s: number, r: Record<string, unknown>) => s + (r.valeur_stock as number), 0);
      const totalM2 = data.reduce((s: number, r: Record<string, unknown>) => s + (r.total_m2 as number), 0);
      const finalY = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY) || 200;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total: ${totalM2.toFixed(2)} m² | Valeur: ${totalValeur.toFixed(2)} DH`, 14, finalY + 10);

      doc.save(`ceramore-inventaire-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Erreur lors de l'export PDF");
    }
    setExporting(false);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export?format=json");
      const data = await res.json();

      const XLSX = await import("xlsx");

      const headers = [
        "Code", "Nom", "Type", "Dimensions", "Pcs/Caisse", "m²/Caisse", "Prix Unitaire (DH)",
        "Caises", "Total m²", "Valeur Stock (DH)", "Date Création"
      ];

      const rows = data.map((r: Record<string, unknown>) => [
        r.code, r.nom, r.type, r.dimensions, r.pieces_par_caisse, r.m2_par_caisse,
        r.prix_unitaire, r.caises, r.total_m2, r.valeur_stock, r.date_creation,
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = headers.map(() => ({ wch: 16 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventaire");
      XLSX.writeFile(wb, `ceramore-inventaire-${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Export Excel error:", error);
      alert("Erreur lors de l'export Excel");
    }
    setExporting(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportPDF}
        disabled={exporting}
        className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
      >
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF
      </button>
      <button
        onClick={exportExcel}
        disabled={exporting}
        className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
      >
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
    </div>
  );
}
