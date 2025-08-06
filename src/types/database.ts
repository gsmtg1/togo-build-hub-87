
export interface Product {
  id: string;
  name: string;
  nom: string; // Compatibilité avec l'ancienne structure
  type: string;
  dimensions: string;
  description?: string;
  unit: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyLoss {
  id: string;
  product_id: string;
  quantity_lost: number;
  loss_date: string;
  loss_value?: number;
  responsible?: string;
  comments?: string;
  loss_type: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingEntry {
  id: string;
  entry_date: string;
  description: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  reference?: string;
  category: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingCategory {
  id: string;
  name: string;
  description?: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  month: number;
  year: number;
  category: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  cle: string;
  valeur: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionOrder {
  id: string;
  numero_ordre: string;
  product_id: string;
  planned_quantity: number;
  produced_quantity: number;
  start_date: string;
  end_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  numero_livraison: string;
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

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  created_at: string;
}

export interface Sale {
  id: string;
  numero_vente: string;
  client_nom: string;
  client_telephone?: string;
  client_adresse?: string;
  date_vente: string;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  montant_total: number;
  vendeur_id?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  created_at: string;
}

export interface Quote {
  id: string;
  numero_devis: string;
  client_nom: string;
  client_telephone?: string;
  client_adresse?: string;
  date_devis: string;
  date_validite?: string;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  montant_total: number;
  vendeur_id?: string;
  commentaires?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id?: string;
  description?: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  created_at: string;
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

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  description?: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  created_at: string;
}

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  document_identite?: string;
  role: 'admin' | 'manager' | 'vendeur' | 'production' | 'livraison' | 'employe';
  salaire: number;
  date_embauche: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrickType {
  id: string;
  nom: string;
  description?: string;
  longueur_cm: number;
  largeur_cm: number;
  hauteur_cm: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionMaterial {
  id: string;
  nom: string;
  description?: string;
  unite: string;
  prix_unitaire: number;
  stock_actuel: number;
  stock_minimum: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionRecipe {
  id: string;
  product_id: string;
  material_id: string;
  quantite_necessaire: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionCost {
  id: string;
  production_order_id: string;
  material_id: string;
  quantite_utilisee: number;
  cout_unitaire: number;
  cout_total: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

export interface QuoteProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}
