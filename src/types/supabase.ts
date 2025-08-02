
// Types temporaires pour l'application jusqu'à ce que Supabase génère automatiquement les types
export interface Product {
  id: string;
  nom: string;
  categorie: string;
  longueur_cm: number;
  largeur_cm: number;
  hauteur_cm: number;
  prix_unitaire: number;
  stock_actuel: number;
  stock_minimum: number;
  actif: boolean;
  date_creation: string;
  date_modification: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'entree' | 'sortie' | 'perte' | 'ajustement';
  quantite: number;
  motif?: string;
  reference_document?: string;
  date_mouvement: string;
  created_by?: string;
  commentaire?: string;
  created_at: string;
}

export interface DailyLoss {
  id: string;
  product_id: string;
  date_perte: string;
  quantite_cassee: number;
  motif?: string;
  valeur_perte?: number;
  responsable?: string;
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  numero_vente: string;
  client_nom: string;
  client_telephone?: string;
  client_adresse?: string;
  date_vente: string;
  statut: 'en_attente' | 'confirmee' | 'livree' | 'annulee';
  montant_total: number;
  vendeur_id?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  numero_livraison: string;
  sale_id?: string;
  client_nom: string;
  client_telephone?: string;
  client_adresse: string;
  lieu_livraison: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  statut: 'en_attente' | 'approuve' | 'en_cours' | 'livre' | 'annule';
  responsable_id?: string;
  signature_client?: string;
  commentaires?: string;
  montant_total: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  numero_facture: string;
  client_nom: string;
  client_telephone?: string;
  client_adresse?: string;
  date_facture: string;
  date_echeance?: string;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee';
  montant_total: number;
  montant_paye: number;
  vendeur_id?: string;
  sale_id?: string;
  delivery_id?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionOrder {
  id: string;
  numero_ordre: string;
  product_id: string;
  quantite: number;
  date_demande: string;
  date_prevue?: string;
  date_completion?: string;
  statut: 'en_attente' | 'approuve' | 'rejete' | 'en_cours' | 'termine' | 'annule';
  demandeur_id?: string;
  approbateur_id?: string;
  commentaires?: string;
  cout_prevu?: number;
  cout_reel?: number;
  created_at: string;
  updated_at: string;
}
