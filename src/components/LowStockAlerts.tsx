"use client";

import type { ReferenceWithCalibres } from "@/lib/types";

interface Props {
  references: ReferenceWithCalibres[];
}

export default function LowStockAlerts({ references }: Props) {
  const lowStockRefs = references.filter((r) => r.is_low_stock);

  if (lowStockRefs.length === 0) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 slide-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-500/20 rounded-xl shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-400 mb-2">
            Alerte Stock Bas — {lowStockRefs.length} référence{lowStockRefs.length > 1 ? "s" : ""}
          </h3>
          <div className="flex flex-wrap gap-2">
            {lowStockRefs.map((ref) => (
              <span
                key={ref.id}
                className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300"
              >
                <span className="font-semibold">{ref.code}</span>
                <span className="text-red-400 ml-1">
                  ({ref.total_boites}/{ref.seuil_alerte} boîtes)
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
