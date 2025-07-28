
export interface ProductionOrder {
  id: string;
  order_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  product_id: string | null;
  quantity: number;
  unit_price: number | null;
  total_amount: number | null;
  requested_date: string | null;
  start_date: string | null;
  completion_date: string | null;
  initiator_name: string;
  notes: string | null;
  approval_date: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionStep {
  id: string;
  production_order_id: string;
  step_name: string;
  step_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  start_date: string | null;
  completion_date: string | null;
  responsible_person: string | null;
  estimated_duration: number | null;
  actual_duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  delivery_number: string;
  production_order_id: string | null;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  customer_name: string;
  customer_phone: string | null;
  customer_address: string;
  delivery_date: string | null;
  delivery_time: string | null;
  transport_method: string | null;
  transport_company: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
  quantity_delivered: number;
  delivery_notes: string | null;
  received_by: string | null;
  delivery_confirmation_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  brick_type_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrickType {
  id: string;
  name: string;
  dimensions: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionMaterial {
  id: string;
  name: string;
  unit: string;
  unit_cost: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionRecipe {
  id: string;
  brick_type_id: string | null;
  material_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionCost {
  id: string;
  brick_type_id: string | null;
  calculated_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoal {
  id: string;
  title: string;
  description: string | null;
  target_quantity: number;
  current_quantity: number;
  target_amount: number;
  current_amount: number;
  month: number;
  year: number;
  brick_type_id: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AccountingCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountingEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string | null;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'mobile_money' | null;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}
