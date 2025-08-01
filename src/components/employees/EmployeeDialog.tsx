
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/lib/database';

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSubmit: (data: Partial<Employee>) => void;
  isEditing: boolean;
}

export const EmployeeDialog = ({ open, onOpenChange, employee, onSubmit, isEditing }: EmployeeDialogProps) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    document_identite: '',
    role: 'employe' as Employee['role'],
    salaire: 0,
    date_embauche: new Date().toISOString().split('T')[0],
    actif: true,
  });

  useEffect(() => {
    if (employee && isEditing) {
      setFormData({
        nom: employee.nom,
        prenom: employee.prenom,
        email: employee.email || '',
        telephone: employee.telephone || '',
        adresse: employee.adresse || '',
        document_identite: employee.document_identite || '',
        role: employee.role,
        salaire: employee.salaire,
        date_embauche: employee.date_embauche,
        actif: employee.actif,
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        document_identite: '',
        role: 'employe',
        salaire: 0,
        date_embauche: new Date().toISOString().split('T')[0],
        actif: true,
      });
    }
  }, [employee, isEditing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'employé' : 'Nouvel employé'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document_identite">Document d'identité</Label>
              <Input
                id="document_identite"
                value={formData.document_identite}
                onChange={(e) => setFormData(prev => ({ ...prev, document_identite: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as Employee['role'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="vendeur">Vendeur</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="livraison">Livraison</SelectItem>
                  <SelectItem value="employe">Employé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_embauche">Date d'embauche</Label>
              <Input
                id="date_embauche"
                type="date"
                value={formData.date_embauche}
                onChange={(e) => setFormData(prev => ({ ...prev, date_embauche: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="salaire">Salaire (FCFA)</Label>
              <Input
                id="salaire"
                type="number"
                value={formData.salaire}
                onChange={(e) => setFormData(prev => ({ ...prev, salaire: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="actif">Statut</Label>
            <Select value={formData.actif ? 'true' : 'false'} onValueChange={(value) => setFormData(prev => ({ ...prev, actif: value === 'true' }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Actif</SelectItem>
                <SelectItem value="false">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
