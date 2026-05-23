"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import type { StockSnapshot } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface Props {
  snapshots: StockSnapshot[];
}

export default function StockCharts({ snapshots }: Props) {
  if (snapshots.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">Les graphiques apparaîtront après l&apos;ajout de données de stock.</p>
      </div>
    );
  }

  const labels = snapshots.map((s) =>
    new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  );

  const valueData = {
    labels,
    datasets: [
      {
        label: "Valeur du Stock (DH)",
        data: snapshots.map((s) => s.total_valeur),
        borderColor: "#d4a574",
        backgroundColor: "rgba(212, 165, 116, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#d4a574",
        pointBorderColor: "#d4a574",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const quantityData = {
    labels,
    datasets: [
      {
        label: "Total m²",
        data: snapshots.map((s) => s.total_m2),
        backgroundColor: "rgba(139, 92, 246, 0.6)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Total Caises",
        data: snapshots.map((s) => s.total_caises),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { size: 12 } },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { size: 11 } },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
      y: {
        ticks: { color: "#64748b", font: { size: 11 } },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-ceramore-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Évolution de la Valeur du Stock
        </h3>
        <div className="h-72">
          <Line data={valueData} options={chartOptions} />
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Tendance des Quantités
        </h3>
        <div className="h-72">
          <Bar data={quantityData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
