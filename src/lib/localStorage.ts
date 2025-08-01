
export interface DatabaseSchema {
  products: any[];
  invoices: any[];
  quotes: any[];
  employees: any[];
  sales: any[];
  deliveries: any[];
}

export const database = {
  init: async (): Promise<void> => {
    // Initialize localStorage if needed
    const stores = ['products', 'invoices', 'quotes', 'employees', 'sales', 'deliveries'];
    stores.forEach(store => {
      if (!localStorage.getItem(store)) {
        localStorage.setItem(store, JSON.stringify([]));
      }
    });
  },

  readAll: async <T>(storeName: string): Promise<T[]> => {
    const data = localStorage.getItem(storeName);
    return data ? JSON.parse(data) : [];
  },

  create: async <T extends { id: string }>(storeName: string, item: T): Promise<void> => {
    const data = await database.readAll<T>(storeName);
    data.push(item);
    localStorage.setItem(storeName, JSON.stringify(data));
  },

  update: async <T extends { id: string }>(storeName: string, item: T): Promise<void> => {
    const data = await database.readAll<T>(storeName);
    const index = data.findIndex(d => d.id === item.id);
    if (index !== -1) {
      data[index] = item;
      localStorage.setItem(storeName, JSON.stringify(data));
    }
  },

  delete: async (storeName: string, id: string): Promise<void> => {
    const data = await database.readAll(storeName);
    const filtered = data.filter(item => item.id !== id);
    localStorage.setItem(storeName, JSON.stringify(filtered));
  }
};
