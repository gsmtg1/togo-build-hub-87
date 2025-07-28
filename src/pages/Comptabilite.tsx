
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Calculator, Edit, Trash2 } from 'lucide-react';
import { ExpenseDialog } from '@/components/accounting/ExpenseDialog';
import { useAccountingCategories, useAccountingEntries } from '@/hooks/useSupabaseDatabase';

const Comptabilite = () => {
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const { data: categories } = useAccountingCategories();
  const { data: entries, loading, create, update, remove } = useAccountingEntries();

  const handleCreateExpense = (data: any) => {
    create(data);
  };

  const totalExpenses = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: 'Espèces',
      bank_transfer: 'Virement bancaire',
      check: 'Chèque',
      mobile_money: 'Mobile Money'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Comptabilité</h1>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => setIsExpenseDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Résumé des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total des dépenses</span>
                <span className="text-red-600 font-medium">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Nombre d'entrées</span>
                <span className="font-medium">{entries.length}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between items-center text-sm">
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">
                    {entries.filter(e => e.category_id === category.id).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculer les coûts
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Rapport mensuel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dépenses récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Catégorie</th>
                    <th className="text-left py-2">Montant</th>
                    <th className="text-left py-2">Paiement</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="py-2">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2">{entry.description}</td>
                      <td className="py-2">
                        {categories.find(c => c.id === entry.category_id)?.name || 'N/A'}
                      </td>
                      <td className="py-2 text-red-600 font-medium">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-2">
                        {entry.payment_method ? getPaymentMethodLabel(entry.payment_method) : 'N/A'}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => remove(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onSubmit={handleCreateExpense}
        categories={categories}
      />
    </div>
  );
};

export default Comptabilite;
