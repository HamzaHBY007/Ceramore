"use client";

import type { DashboardStats } from "@/lib/types";

interface Props {
  stats: DashboardStats;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: Props) {
  const cards = [
    {
      label: "Références",
      value: stats.total_references,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      label: "Quantité en Stock",
      value: stats.total_quantite.toLocaleString("fr-FR"),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: "from-emerald-500 to-green-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      label: "Surface Totale (m²)",
      value: stats.total_m2.toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      gradient: "from-purple-500 to-violet-500",
      bgGlow: "bg-purple-500/10",
    },
    {
      label: "Valeur du Stock",
      value: `${stats.total_valeur.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-ceramore-gold to-amber-500",
      bgGlow: "bg-amber-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="stat-card slide-in group">
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${card.bgGlow} blur-2xl group-hover:blur-xl transition-all`} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                {card.icon}
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
