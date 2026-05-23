export interface Reference {
  id: number;
  code: string;
  nom: string;
  largeur_cm: number;
  longueur_cm: number;
  pieces_par_boite: number;
  m2_par_boite: number;
  prix_unitaire: number;
  quantite: number;
  total_m2: number;
  valeur_stock: number;
  type: "carrelage" | "produit";
  created_at: string;
  updated_at: string;
}

export interface ReferenceWithDetails extends Reference {
  is_product: boolean;
}

export interface StockHistory {
  id: number;
  reference_id: number;
  type: "entree" | "sortie";
  quantite: number;
  date_entry: string;
  note: string | null;
  reference_code?: string;
  reference_nom?: string;
}

export interface StockSnapshot {
  id: number;
  date: string;
  total_m2: number;
  total_valeur: number;
  total_quantite: number;
}

export interface DashboardStats {
  total_references: number;
  total_quantite: number;
  total_m2: number;
  total_valeur: number;
}

export interface FilterOptions {
  codes: string[];
  noms: string[];
  dimensions: string[];
}
