
// Database configuration and management
export interface DatabaseSchema {
  sales: Sale[];
  quotes: Quote[];
  goals: Goal[];
  employees: Employee[];
  invoices: Invoice[];
  settings: Settings[];
}

export interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: SaleProduct[];
  totalAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface SaleProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: QuoteProduct[];
  totalAmount: number;
  date: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface QuoteProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  month: string;
  year: number;
  employeeId?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  products: InvoiceProduct[];
  totalAmount: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  saleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Settings {
  id: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  invoiceTemplate: string;
  quoteTemplate: string;
  headerText: string;
  footerText: string;
  createdAt: string;
  updatedAt: string;
}

class Database {
  private dbName = 'cornerstone-briques-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        const stores = ['sales', 'quotes', 'goals', 'employees', 'invoices', 'settings'];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });

        // Initialize default settings
        const transaction = request.transaction;
        const settingsStore = transaction?.objectStore('settings');
        const defaultSettings: Settings = {
          id: 'default',
          companyName: 'Cornerstone Briques',
          companyAddress: 'Lomé, Togo',
          companyPhone: '+228 XX XX XX XX',
          companyEmail: 'contact@cornerstone-briques.tg',
          logo: '',
          primaryColor: '#ea580c',
          secondaryColor: '#f97316',
          invoiceTemplate: 'default',
          quoteTemplate: 'default',
          headerText: 'Cornerstone Briques - Votre partenaire de confiance',
          footerText: 'Merci pour votre confiance',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        settingsStore?.add(defaultSettings);
      };
    });
  }

  async create<T>(storeName: keyof DatabaseSchema, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(data);
    });
  }

  async read<T>(storeName: keyof DatabaseSchema, id: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async readAll<T>(storeName: keyof DatabaseSchema): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async update<T>(storeName: keyof DatabaseSchema, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(data);
    });
  }

  async delete(storeName: keyof DatabaseSchema, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: keyof DatabaseSchema): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async resetAll(): Promise<void> {
    const stores: (keyof DatabaseSchema)[] = ['sales', 'quotes', 'goals', 'employees', 'invoices'];
    
    for (const store of stores) {
      await this.clear(store);
    }
  }
}

export const database = new Database();
