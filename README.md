# Ceramore - Gestion d'Inventaire

Tableau de bord de gestion d'inventaire pour Ceramore, une entreprise de carrelage.

## Fonctionnalités

- **Gestion des références** : Ajout de références de carrelage avec dimensions (cm) et pièces par boîte
- **Calcul automatique** : m² par boîte calculé automatiquement à partir des dimensions
- **Gestion des calibres** : Grades de qualité avec répartition automatique des quantités
- **Suivi du stock** : Entrées/sorties de stock avec calcul des totaux en temps réel
- **Valeur du stock** : Prix au m² avec valeur totale mise à jour en direct
- **Graphiques** : Évolution de la valeur et tendances des quantités dans le temps
- **Alertes stock bas** : Notification visuelle pour les références en dessous du seuil
- **Recherche & filtres** : Par référence, calibre et plage de dates
- **Export** : PDF et Excel de l'inventaire complet
- **Suivi des dates** : Date d'ajout de chaque entrée

## Stack Technique

- **Frontend** : Next.js 15, React 19, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : SQLite (better-sqlite3)
- **Graphiques** : Chart.js / react-chartjs-2
- **Export** : jsPDF + jspdf-autotable, SheetJS (xlsx)

## Installation

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement (Fly.io)

```bash
fly auth login
fly launch
fly deploy
```

## Structure

```
src/
├── app/
│   ├── api/          # Routes API (references, stock-history, export)
│   ├── layout.tsx    # Layout principal
│   ├── page.tsx      # Dashboard principal
│   └── globals.css   # Styles globaux
├── components/       # Composants React
│   ├── StatsCards.tsx
│   ├── ReferenceForm.tsx
│   ├── ReferenceTable.tsx
│   ├── StockCharts.tsx
│   ├── SearchFilters.tsx
│   ├── LowStockAlerts.tsx
│   ├── StockModal.tsx
│   └── ExportButtons.tsx
└── lib/
    ├── db.ts         # Configuration SQLite
    └── types.ts      # Types TypeScript
```
