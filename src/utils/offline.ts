
// Système de sauvegarde offline et synchronisation
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private pendingOperations: any[] = [];

  private constructor() {
    // Écouter les changements de connexion
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  // Sauvegarder les données localement
  async saveToLocal(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(`cornerstone_${key}`, serializedData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde locale:', error);
    }
  }

  // Charger les données locales
  async loadFromLocal(key: string): Promise<any> {
    try {
      const serializedData = localStorage.getItem(`cornerstone_${key}`);
      if (!serializedData) return null;

      const parsed = JSON.parse(serializedData);
      return parsed.data;
    } catch (error) {
      console.error('Erreur lors du chargement local:', error);
      return null;
    }
  }

  // Ajouter une opération en attente
  addPendingOperation(operation: any): void {
    this.pendingOperations.push({
      ...operation,
      timestamp: new Date().toISOString()
    });
    
    // Sauvegarder les opérations en attente
    this.saveToLocal('pending_operations', this.pendingOperations);
  }

  // Synchroniser les opérations en attente
  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline || this.pendingOperations.length === 0) return;

    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    for (const operation of operations) {
      try {
        // Traiter chaque opération en attente
        await this.processOperation(operation);
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        // Remettre l'opération en attente en cas d'erreur
        this.pendingOperations.push(operation);
      }
    }

    // Mettre à jour les opérations en attente
    this.saveToLocal('pending_operations', this.pendingOperations);
  }

  private async processOperation(operation: any): Promise<void> {
    // Logique de traitement des opérations en attente
    console.log('Traitement de l\'opération:', operation);
  }

  // Vérifier si on est en ligne
  isOnlineMode(): boolean {
    return this.isOnline;
  }

  // Nettoyer les données locales
  clearLocalData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cornerstone_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Instance globale
export const offlineManager = OfflineManager.getInstance();
