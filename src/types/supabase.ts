
// Types pour l'application basés sur les tables Supabase
export interface Product {
  id: string;
  name: string;
  type: string;
  dimensions: string;
  description?: string;
  price: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'entree' | 'sortie' | 'perte' | 'ajustement';
  quantite: number;
  motif?: string;
  commentaire?: string;
  date_mouvement: string;
  created_at: string;
  updated_at: string;
}

export interface DailyLoss {
  id: string;
  product_id: string;
  loss_date: string;
  quantity_lost: number;
  loss_type: string;
  loss_value?: number;
  responsible?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  client_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sale_date: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  payment_method?: 'cash' | 'transfer' | 'check' | 'mobile_money';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  sale_id: string;
  delivery_address: string;
  delivery_date: string;
  status: 'scheduled' | 'in_progress' | 'delivered' | 'cancelled';
  driver_name?: string;
  vehicle_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  sale_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total_amount: number;
  tax_rate: number;
  tax_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionOrder {
  id: string;
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

export interface AccountingEntry {
  id: string;
  entry_date: string;
  account_name: string;
  description: string;
  debit_amount?: number;
  credit_amount?: number;
  category: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountingCategory {
  id: string;
  name: string;
  account_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoal {
  id: string;
  title: string;
  description?: string;
  category: string;
  month: number;
  year: number;
  target_value: number;
  current_value: number;
  unit: string;
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

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  hire_date?: string;
  is_active: boolean;
  role: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionMaterial {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface BrickType {
  id: string;
  name: string;
  dimensions: string;
  weight?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionRecipe {
  id: string;
  product_id: string;
  material_id: string;
  quantity_needed: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionCost {
  id: string;
  production_id: string;
  material_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}
