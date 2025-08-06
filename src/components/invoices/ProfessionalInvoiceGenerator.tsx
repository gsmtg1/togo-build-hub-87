
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Plus, Trash2, Download, Printer } from 'lucide-react';
import { useProducts, useClients, useInvoices } from '@/hooks/useSupabaseData';

interface InvoiceItem {
  id: string;
  productId?: string;
  customName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isCustom: boolean;
}

interface ProfessionalInvoiceGeneratorProps {
  saleId?: string;
}

export const ProfessionalInvoiceGenerator = ({ saleId }: ProfessionalInvoiceGeneratorProps) => {
  const { data: products } = useProducts();
  const { data: clients } = useClients();
  const { create: createInvoice } = useInvoices();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    invoiceNumber: `FACT-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    includeTax: false,
    taxRate: 18
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      quantity: 1,
      unitPrice: 0,
      total: 0,
      isCustom: true
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  const selectProduct = (itemId: string, productId: string) => {
    if (productId === 'custom') {
      updateItem(itemId, { 
        isCustom: true, 
        productId: undefined, 
        customName: '', 
        unitPrice: 0 
      });
    } else {
      const product = products.find(p => p.id === productId);
      if (product) {
        updateItem(itemId, {
          isCustom: false,
          productId: productId,
          customName: product.name,
          unitPrice: product.price
        });
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = formData.includeTax ? (subtotal * formData.taxRate) / 100 : 0;
  const totalAmount = subtotal + taxAmount;

  const generateInvoice = async () => {
    try {
      await createInvoice({
        invoice_number: formData.invoiceNumber,
        sale_id: saleId || null,
        issue_date: formData.issueDate,
        due_date: formData.dueDate,
        total_amount: totalAmount,
        tax_rate: formData.includeTax ? formData.taxRate : 0,
        tax_amount: taxAmount,
        notes: formData.notes,
        status: 'draft'
      });

      // Générer le PDF ou imprimer
      printInvoice();
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getInvoiceHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getInvoiceHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Facture ${formData.invoiceNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
            .company-info { font-size: 14px; line-height: 1.6; }
            .invoice-title { font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0; color: #1f2937; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info, .client-info { width: 48%; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #374151; }
            .info-box { background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f1f5f9; font-weight: bold; color: #374151; }
            .amount { text-align: right; font-weight: bold; }
            .total-section { margin-top: 30px; text-align: right; }
            .total-row { margin: 8px 0; padding: 8px; }
            .final-total { font-size: 20px; font-weight: bold; background-color: #2563eb; color: white; padding: 15px; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
            .notes { margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 8px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">CORNERSTONE BRIQUES</div>
            <div class="company-info">
                21 Rue Be HEDJE, après les rails non loin de la station d'essence CM<br>
                Akodésséwa, Lomé - Togo<br>
                📞 Tél: +228 XX XX XX XX | ✉️ Email: contact@cornerstone-briques.tg
            </div>
        </div>

        <div class="invoice-title">FACTURE N° ${formData.invoiceNumber}</div>

        <div class="invoice-details">
            <div class="invoice-info">
                <div class="section-title">Informations de facturation</div>
                <div class="info-box">
                    <strong>Date d'émission:</strong> ${new Date(formData.issueDate).toLocaleDateString('fr-FR')}<br>
                    <strong>Date d'échéance:</strong> ${new Date(formData.dueDate).toLocaleDateString('fr-FR')}<br>
                    <strong>Facture N°:</strong> ${formData.invoiceNumber}
                </div>
            </div>
            <div class="client-info">
                <div class="section-title">Facturé à</div>
                <div class="info-box">
                    <strong>${formData.clientName}</strong><br>
                    ${formData.clientPhone ? `📞 ${formData.clientPhone}<br>` : ''}
                    ${formData.clientAddress ? `📍 ${formData.clientAddress}` : ''}
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Désignation</th>
                    <th>Quantité</th>
                    <th>Prix unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.customName || 'Article personnalisé'}</td>
                        <td>${item.quantity}</td>
                        <td class="amount">${item.unitPrice.toLocaleString()} FCFA</td>
                        <td class="amount">${item.total.toLocaleString()} FCFA</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <strong>Sous-total: ${subtotal.toLocaleString()} FCFA</strong>
            </div>
            ${formData.includeTax ? `
            <div class="total-row">
                <strong>TVA (${formData.taxRate}%): ${taxAmount.toLocaleString()} FCFA</strong>
            </div>
            ` : ''}
            <div class="final-total">
                TOTAL À PAYER: ${totalAmount.toLocaleString()} FCFA
            </div>
        </div>

        ${formData.notes ? `
        <div class="notes">
            <strong>Notes:</strong><br>
            ${formData.notes}
        </div>
        ` : ''}

        <div class="footer">
            <p>Merci de votre confiance ! Pour toute question, contactez-nous.</p>
            <p>Conditions de paiement : Règlement à ${new Date(formData.dueDate).toLocaleDateString('fr-FR')}</p>
        </div>
    </body>
    </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Générer facture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🧾 Nouvelle facture professionnelle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Nom du client</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Nom du client"
                required
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Téléphone</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="Téléphone du client"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientAddress">Adresse</Label>
            <Textarea
              id="clientAddress"
              value={formData.clientAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
              placeholder="Adresse du client"
            />
          </div>

          {/* Informations facture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Numéro facture</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Date d'émission</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">🧱 Articles</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Type de produit</Label>
                      <Select onValueChange={(value) => selectProduct(item.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un produit..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">⚡ Autre (personnalisé)</SelectItem>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              🧱 {product.name} - {product.dimensions} ({product.price.toLocaleString()} FCFA)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {item.isCustom && (
                      <div>
                        <Label>Nom du produit</Label>
                        <Input
                          placeholder="Nom du produit personnalisé"
                          value={item.customName || ''}
                          onChange={(e) => updateItem(item.id, { customName: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Prix unitaire (FCFA)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                        readOnly={!item.isCustom}
                      />
                    </div>
                    <div>
                      <Label>Total (FCFA)</Label>
                      <Input
                        type="number"
                        value={item.total}
                        readOnly
                        className="bg-gray-50 font-bold"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground">Aucun article ajouté</p>
                  <p className="text-sm text-muted-foreground">Cliquez sur "Ajouter un article" pour commencer</p>
                </div>
              )}
            </div>
          </div>

          {/* Options TVA */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTax"
                checked={formData.includeTax}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeTax: !!checked }))}
              />
              <Label htmlFor="includeTax">Inclure la TVA</Label>
            </div>
            
            {formData.includeTax && (
              <div className="w-32">
                <Label>Taux TVA (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            )}
          </div>

          {/* Résumé des totaux */}
          {items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-right">
                <div>Sous-total: <span className="font-bold">{subtotal.toLocaleString()} FCFA</span></div>
                {formData.includeTax && (
                  <div>TVA ({formData.taxRate}%): <span className="font-bold">{taxAmount.toLocaleString()} FCFA</span></div>
                )}
                <div className="text-lg font-bold text-blue-600 border-t pt-2">
                  Total: {totalAmount.toLocaleString()} FCFA
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Conditions de paiement, informations supplémentaires..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="button" variant="outline" onClick={printInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              Aperçu & Imprimer
            </Button>
            <Button onClick={generateInvoice} disabled={items.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Générer facture
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
