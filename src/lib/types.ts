export interface Reference {
  id: number;
  code: string;
  nom: string;
  largeur_cm: number;
  longueur_cm: number;
  pieces_par_boite: number;
  m2_par_boite: number;
  prix_unitaire_m2: number;
  seuil_alerte: number;
  created_at: string;
  updated_at: string;
}

export interface Calibre {
  id: number;
  reference_id: number;
  nom: string;
  quantite_boites: number;
}

export interface ReferenceWithCalibres extends Reference {
  calibres: Calibre[];
  total_boites: number;
  total_m2: number;
  valeur_stock: number;
  is_low_stock: boolean;
}

export interface StockHistory {
  id: number;
  reference_id: number;
  calibre_id: number | null;
  type: "entree" | "sortie";
  quantite_boites: number;
  date_entry: string;
  note: string | null;
  reference_code?: string;
  reference_nom?: string;
  calibre_nom?: string;
}

export interface StockSnapshot {
  id: number;
  date: string;
  total_m2: number;
  total_valeur: number;
  total_boites: number;
}

export interface DashboardStats {
  total_references: number;
  total_boites: number;
  total_m2: number;
  total_valeur: number;
  low_stock_count: number;
}
