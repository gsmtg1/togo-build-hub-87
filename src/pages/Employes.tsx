import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDatabase, useLocalStorage } from '@/hooks/useDatabase';
import { Employee } from '@/lib/database';
import { EmployeeDialog } from '@/components/employees/EmployeeDialog';

const Employes = () => {
  const { isInitialized } = useDatabase();
  const { data: employees, loading, create, update, remove } = useLocalStorage<Employee>('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des employés...</div>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (employeeData: Partial<Employee>) => {
    if (isEditing && selectedEmployee) {
      await update({ ...selectedEmployee, ...employeeData, updated_at: new Date().toISOString() });
    } else {
      const newEmployee: Employee = {
        id: crypto.randomUUID(),
        nom: employeeData.nom || '',
        prenom: employeeData.prenom || '',
        email: employeeData.email || '',
        telephone: employeeData.telephone || '',
        adresse: employeeData.adresse || '',
        document_identite: employeeData.document_identite || '',
        role: employeeData.role || 'employe',
        salaire: employeeData.salaire || 0,
        date_embauche: employeeData.date_embauche || new Date().toISOString().split('T')[0],
        actif: employeeData.actif !== undefined ? employeeData.actif : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await create(newEmployee);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (actif: boolean) => {
    const variant = actif ? 'default' : 'secondary';
    const label = actif ? 'Actif' : 'Inactif';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const activeEmployees = employees.filter(emp => emp.actif).length;
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salaire, 0);

  // Group employees by role since department doesn't exist
  const roleCounts = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Employés</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Employé
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Masse Salariale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalary.toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rôles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(roleCounts).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Employés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date d'embauche</TableHead>
                <TableHead>Salaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(employee.prenom, employee.nom)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {employee.prenom} {employee.nom}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {employee.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(employee.date_embauche).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{employee.salaire.toLocaleString()} FCFA</TableCell>
                  <TableCell>{getStatusBadge(employee.actif)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={selectedEmployee}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Employes;
