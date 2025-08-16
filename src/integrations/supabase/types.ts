export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounting_categories: {
        Row: {
          account_type: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          account_type: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      accounting_entries: {
        Row: {
          account_name: string
          category: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string
          entry_date: string
          id: string
          notes: string | null
          reference: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          category: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description: string
          entry_date?: string
          id?: string
          notes?: string | null
          reference?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          category?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          cle: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
          valeur: string
        }
        Insert: {
          cle: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          valeur: string
        }
        Update: {
          cle?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          valeur?: string
        }
        Relationships: []
      }
      brick_types: {
        Row: {
          created_at: string
          description: string | null
          dimensions: string
          id: string
          name: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dimensions: string
          id?: string
          name: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dimensions?: string
          id?: string
          name?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients_complets: {
        Row: {
          adresse: string | null
          created_at: string
          email: string | null
          id: string
          nom_complet: string
          notes: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom_complet: string
          notes?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom_complet?: string
          notes?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      couts_production: {
        Row: {
          cout_total: number
          cout_unitaire: number
          created_at: string
          id: string
          material_id: string
          production_order_id: string
          quantite_utilisee: number
          updated_at: string
        }
        Insert: {
          cout_total?: number
          cout_unitaire?: number
          created_at?: string
          id?: string
          material_id: string
          production_order_id: string
          quantite_utilisee?: number
          updated_at?: string
        }
        Update: {
          cout_total?: number
          cout_unitaire?: number
          created_at?: string
          id?: string
          material_id?: string
          production_order_id?: string
          quantite_utilisee?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_losses: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          loss_date: string
          loss_type: string
          loss_value: number | null
          product_id: string
          quantity_lost: number
          responsible: string | null
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          loss_date?: string
          loss_type: string
          loss_value?: number | null
          product_id: string
          quantity_lost: number
          responsible?: string | null
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          loss_date?: string
          loss_type?: string
          loss_value?: number | null
          product_id?: string
          quantity_lost?: number
          responsible?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_losses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          created_at: string
          delivery_address: string
          delivery_date: string
          driver_name: string | null
          id: string
          notes: string | null
          sale_id: string
          status: string
          updated_at: string
          vehicle_info: string | null
        }
        Insert: {
          created_at?: string
          delivery_address: string
          delivery_date: string
          driver_name?: string | null
          id?: string
          notes?: string | null
          sale_id: string
          status?: string
          updated_at?: string
          vehicle_info?: string | null
        }
        Update: {
          created_at?: string
          delivery_address?: string
          delivery_date?: string
          driver_name?: string | null
          id?: string
          notes?: string | null
          sale_id?: string
          status?: string
          updated_at?: string
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_deliveries_sale_id"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_items: {
        Row: {
          created_at: string
          devis_id: string
          id: string
          nom_produit: string
          prix_unitaire: number
          product_id: string | null
          quantite: number
          total_ligne: number
        }
        Insert: {
          created_at?: string
          devis_id: string
          id?: string
          nom_produit: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Update: {
          created_at?: string
          devis_id?: string
          id?: string
          nom_produit?: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Relationships: [
          {
            foreignKeyName: "devis_items_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis_professionnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_produits: {
        Row: {
          created_at: string
          devis_id: string
          id: string
          nom_produit: string
          prix_unitaire: number
          product_id: string | null
          quantite: number
          total_ligne: number
        }
        Insert: {
          created_at?: string
          devis_id: string
          id?: string
          nom_produit: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Update: {
          created_at?: string
          devis_id?: string
          id?: string
          nom_produit?: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Relationships: [
          {
            foreignKeyName: "devis_produits_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis_professionnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_produits_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_professionnels: {
        Row: {
          client_adresse: string | null
          client_id: string | null
          client_nom: string
          client_telephone: string | null
          commentaires: string | null
          created_at: string
          date_devis: string
          date_echeance: string
          id: string
          montant_total: number
          numero_devis: string
          remise_globale_pourcentage: number | null
          statut: string
          updated_at: string
          vendeur_id: string | null
        }
        Insert: {
          client_adresse?: string | null
          client_id?: string | null
          client_nom: string
          client_telephone?: string | null
          commentaires?: string | null
          created_at?: string
          date_devis?: string
          date_echeance: string
          id?: string
          montant_total?: number
          numero_devis: string
          remise_globale_pourcentage?: number | null
          statut?: string
          updated_at?: string
          vendeur_id?: string | null
        }
        Update: {
          client_adresse?: string | null
          client_id?: string | null
          client_nom?: string
          client_telephone?: string | null
          commentaires?: string | null
          created_at?: string
          date_devis?: string
          date_echeance?: string
          id?: string
          montant_total?: number
          numero_devis?: string
          remise_globale_pourcentage?: number | null
          statut?: string
          updated_at?: string
          vendeur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_professionnels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_complets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_professionnels_vendeur_id_fkey"
            columns: ["vendeur_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string
          hire_date: string | null
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          position: string | null
          role: string
          salary: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          position?: string | null
          role?: string
          salary?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          position?: string | null
          role?: string
          salary?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facture_items: {
        Row: {
          created_at: string
          facture_id: string
          id: string
          nom_produit: string
          prix_unitaire: number
          product_id: string | null
          quantite: number
          total_ligne: number
        }
        Insert: {
          created_at?: string
          facture_id: string
          id?: string
          nom_produit: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Update: {
          created_at?: string
          facture_id?: string
          id?: string
          nom_produit?: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Relationships: [
          {
            foreignKeyName: "facture_items_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures_professionnelles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facture_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      facture_produits: {
        Row: {
          created_at: string
          facture_id: string
          id: string
          nom_produit: string
          prix_unitaire: number
          product_id: string | null
          quantite: number
          total_ligne: number
        }
        Insert: {
          created_at?: string
          facture_id: string
          id?: string
          nom_produit: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Update: {
          created_at?: string
          facture_id?: string
          id?: string
          nom_produit?: string
          prix_unitaire?: number
          product_id?: string | null
          quantite?: number
          total_ligne?: number
        }
        Relationships: [
          {
            foreignKeyName: "facture_produits_facture_id_fkey"
            columns: ["facture_id"]
            isOneToOne: false
            referencedRelation: "factures_professionnelles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facture_produits_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      factures_professionnelles: {
        Row: {
          adresse_livraison: string | null
          client_adresse: string | null
          client_id: string | null
          client_nom: string
          client_telephone: string | null
          commentaires: string | null
          created_at: string
          date_echeance: string | null
          date_facture: string
          delivery_id: string | null
          frais_livraison: number | null
          id: string
          mode_livraison: string | null
          montant_paye: number
          montant_total: number
          numero_facture: string
          remise_globale_montant: number | null
          remise_globale_pourcentage: number | null
          sale_id: string | null
          sous_total: number | null
          statut: string
          updated_at: string
          vendeur_id: string | null
        }
        Insert: {
          adresse_livraison?: string | null
          client_adresse?: string | null
          client_id?: string | null
          client_nom: string
          client_telephone?: string | null
          commentaires?: string | null
          created_at?: string
          date_echeance?: string | null
          date_facture?: string
          delivery_id?: string | null
          frais_livraison?: number | null
          id?: string
          mode_livraison?: string | null
          montant_paye?: number
          montant_total?: number
          numero_facture: string
          remise_globale_montant?: number | null
          remise_globale_pourcentage?: number | null
          sale_id?: string | null
          sous_total?: number | null
          statut?: string
          updated_at?: string
          vendeur_id?: string | null
        }
        Update: {
          adresse_livraison?: string | null
          client_adresse?: string | null
          client_id?: string | null
          client_nom?: string
          client_telephone?: string | null
          commentaires?: string | null
          created_at?: string
          date_echeance?: string | null
          date_facture?: string
          delivery_id?: string | null
          frais_livraison?: number | null
          id?: string
          mode_livraison?: string | null
          montant_paye?: number
          montant_total?: number
          numero_facture?: string
          remise_globale_montant?: number | null
          remise_globale_pourcentage?: number | null
          sale_id?: string | null
          sous_total?: number | null
          statut?: string
          updated_at?: string
          vendeur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_professionnelles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_complets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_professionnelles_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_professionnelles_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_professionnelles_vendeur_id_fkey"
            columns: ["vendeur_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          sale_id: string
          status: string
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          sale_id: string
          status?: string
          tax_amount: number
          tax_rate?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          sale_id?: string
          status?: string
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_sale_id"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      losses: {
        Row: {
          cost_impact: number | null
          created_at: string
          description: string | null
          id: string
          loss_date: string
          loss_type: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cost_impact?: number | null
          created_at?: string
          description?: string | null
          id?: string
          loss_date: string
          loss_type: string
          product_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          cost_impact?: number | null
          created_at?: string
          description?: string | null
          id?: string
          loss_date?: string
          loss_type?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_losses_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "losses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      materiaux_production: {
        Row: {
          created_at: string
          description: string | null
          id: string
          nom: string
          prix_unitaire: number
          stock_actuel: number
          stock_minimum: number
          unite: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          prix_unitaire?: number
          stock_actuel?: number
          stock_minimum?: number
          unite?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          prix_unitaire?: number
          stock_actuel?: number
          stock_minimum?: number
          unite?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          category: string
          created_at: string
          current_value: number
          description: string | null
          id: string
          month: number
          status: string
          target_value: number
          title: string
          unit: string
          updated_at: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number
          description?: string | null
          id?: string
          month: number
          status?: string
          target_value: number
          title: string
          unit: string
          updated_at?: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number
          description?: string | null
          id?: string
          month?: number
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      objectives: {
        Row: {
          category: string
          created_at: string
          current_value: number
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          target_value: number
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          target_value: number
          title: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      ordres_production_briques: {
        Row: {
          cout_main_oeuvre: number | null
          cout_materiel: number | null
          cout_total: number | null
          created_at: string
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          date_lancement: string
          id: string
          notes: string | null
          numero_ordre: string
          product_id: string
          quantite_planifiee: number
          quantite_produite: number
          responsable_production: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          cout_main_oeuvre?: number | null
          cout_materiel?: number | null
          cout_total?: number | null
          created_at?: string
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          date_lancement?: string
          id?: string
          notes?: string | null
          numero_ordre: string
          product_id: string
          quantite_planifiee: number
          quantite_produite?: number
          responsable_production?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          cout_main_oeuvre?: number | null
          cout_materiel?: number | null
          cout_total?: number | null
          created_at?: string
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          date_lancement?: string
          id?: string
          notes?: string | null
          numero_ordre?: string
          product_id?: string
          quantite_planifiee?: number
          quantite_produite?: number
          responsable_production?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordres_production_briques_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_hours: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          employee_id: string
          hourly_rate: number
          hours_worked: number
          id: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          employee_id: string
          hourly_rate: number
          hours_worked: number
          id?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          employee_id?: string
          hourly_rate?: number
          hours_worked?: number
          id?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_overtime_hours_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      production: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string | null
          planned_quantity: number
          produced_quantity: number
          product_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          planned_quantity: number
          produced_quantity?: number
          product_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          planned_quantity?: number
          produced_quantity?: number
          product_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_production_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_costs: {
        Row: {
          created_at: string
          id: string
          labor_cost: number
          material_cost: number
          overhead_cost: number
          production_id: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          labor_cost?: number
          material_cost?: number
          overhead_cost?: number
          production_id: string
          total_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          labor_cost?: number
          material_cost?: number
          overhead_cost?: number
          production_id?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      production_materials: {
        Row: {
          cost_per_unit: number
          created_at: string
          id: string
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          name: string
          unit?: string
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          planned_quantity: number
          produced_quantity: number
          product_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          planned_quantity?: number
          produced_quantity?: number
          product_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          planned_quantity?: number
          produced_quantity?: number
          product_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_production_orders_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_recipes: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string
          quantity_needed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id: string
          quantity_needed: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string
          quantity_needed?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          dimensions: string
          id: string
          is_active: boolean
          name: string
          price: number
          type: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dimensions: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          type: string
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dimensions?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          type?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          status: string
          total_amount: number
          unit_price: number
          updated_at: string
          valid_until: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          status?: string
          total_amount: number
          unit_price: number
          updated_at?: string
          valid_until: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          status?: string
          total_amount?: number
          unit_price?: number
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quotations_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quotations_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      recettes_production: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string
          quantite_necessaire: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id: string
          quantite_necessaire?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string
          quantite_necessaire?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          client_adresse: string | null
          client_id: string
          client_nom: string | null
          client_telephone: string | null
          commentaires: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          product_id: string
          quantity: number
          sale_date: string
          status: string
          total_amount: number
          unit_price: number
          updated_at: string
          vendeur_nom: string | null
        }
        Insert: {
          client_adresse?: string | null
          client_id: string
          client_nom?: string | null
          client_telephone?: string | null
          commentaires?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id: string
          quantity: number
          sale_date?: string
          status?: string
          total_amount: number
          unit_price: number
          updated_at?: string
          vendeur_nom?: string | null
        }
        Update: {
          client_adresse?: string | null
          client_id?: string
          client_nom?: string | null
          client_telephone?: string | null
          commentaires?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string
          quantity?: number
          sale_date?: string
          status?: string
          total_amount?: number
          unit_price?: number
          updated_at?: string
          vendeur_nom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sales_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sales_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          created_at: string
          id: string
          last_restocked: string | null
          location: string | null
          minimum_stock: number
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_restocked?: string | null
          location?: string | null
          minimum_stock?: number
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_restocked?: string | null
          location?: string | null
          minimum_stock?: number
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          commentaire: string | null
          created_at: string
          date_mouvement: string
          id: string
          motif: string | null
          product_id: string
          quantite: number
          type: string
          updated_at: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          date_mouvement?: string
          id?: string
          motif?: string | null
          product_id: string
          quantite: number
          type: string
          updated_at?: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          date_mouvement?: string
          id?: string
          motif?: string | null
          product_id?: string
          quantite?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      types_briques: {
        Row: {
          created_at: string
          description: string | null
          hauteur_cm: number
          id: string
          largeur_cm: number
          longueur_cm: number
          nom: string
          poids_kg: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hauteur_cm?: number
          id?: string
          largeur_cm?: number
          longueur_cm?: number
          nom: string
          poids_kg?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hauteur_cm?: number
          id?: string
          largeur_cm?: number
          longueur_cm?: number
          nom?: string
          poids_kg?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
