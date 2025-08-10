
import { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin, Calendar, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEmployees } from '@/hooks/useSupabaseDatabase';
import { EmployeeDialog } from '@/components/employees/EmployeeDialog';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  role: string;
  salary?: number;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Employes = () => {
  const { data: employees, loading, create, update, remove } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
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
      await update(selectedEmployee.id, employeeData);
    } else {
      const newEmployee = {
        ...employeeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await create(newEmployee);
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (is_active: boolean) => {
    const variant = is_active ? 'default' : 'secondary';
    const label = is_active ? 'Actif' : 'Inactif';
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getInitials = (first_name: string, last_name: string) => {
    return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
  };

  const activeEmployees = employees.filter((emp: Employee) => emp.is_active).length;
  const totalSalary = employees.reduce((sum: number, emp: Employee) => sum + (emp.salary || 0), 0);

  // Grouper les employés par rôle
  const roleCounts = employees.reduce((acc: Record<string, number>, emp: Employee) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {});

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
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
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
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun employé enregistré</p>
              <p className="text-sm text-gray-400">Cliquez sur "Nouvel Employé" pour commencer</p>
            </div>
          ) : (
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
                {employees.map((employee: Employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(employee.first_name, employee.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
                          {employee.email && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.role}</div>
                        {employee.department && (
                          <div className="text-sm text-muted-foreground">{employee.department}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.phone && (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.hire_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.salary ? `${employee.salary.toLocaleString()} FCFA` : 'Non défini'}
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.is_active)}</TableCell>
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
          )}
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
