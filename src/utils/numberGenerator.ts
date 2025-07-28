
// Générateurs de numéros pour les différents documents
export class NumberGenerator {
  private static formatNumber(prefix: string, number: number): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const formattedNumber = number.toString().padStart(4, '0');
    return `${prefix}${year}${month}${formattedNumber}`;
  }

  static async generateProductionOrderNumber(): Promise<string> {
    const lastNumber = localStorage.getItem('last_production_order_number') || '0';
    const nextNumber = parseInt(lastNumber) + 1;
    localStorage.setItem('last_production_order_number', nextNumber.toString());
    return this.formatNumber('OP', nextNumber);
  }

  static async generateDeliveryNumber(): Promise<string> {
    const lastNumber = localStorage.getItem('last_delivery_number') || '0';
    const nextNumber = parseInt(lastNumber) + 1;
    localStorage.setItem('last_delivery_number', nextNumber.toString());
    return this.formatNumber('LV', nextNumber);
  }

  static async generateSaleNumber(): Promise<string> {
    const lastNumber = localStorage.getItem('last_sale_number') || '0';
    const nextNumber = parseInt(lastNumber) + 1;
    localStorage.setItem('last_sale_number', nextNumber.toString());
    return this.formatNumber('VT', nextNumber);
  }

  static async generateQuoteNumber(): Promise<string> {
    const lastNumber = localStorage.getItem('last_quote_number') || '0';
    const nextNumber = parseInt(lastNumber) + 1;
    localStorage.setItem('last_quote_number', nextNumber.toString());
    return this.formatNumber('DV', nextNumber);
  }

  static async generateInvoiceNumber(): Promise<string> {
    const lastNumber = localStorage.getItem('last_invoice_number') || '0';
    const nextNumber = parseInt(lastNumber) + 1;
    localStorage.setItem('last_invoice_number', nextNumber.toString());
    return this.formatNumber('FC', nextNumber);
  }
}
