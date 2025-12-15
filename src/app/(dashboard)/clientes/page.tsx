'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { CustomerDialog } from '@/components/finanzas/CustomerDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCurrentAccountByCustomer,
} from '@/services/customers';
import type {
  Customer,
  CustomerFormData,
  CurrentAccount,
} from '@/types/finanzas';
import {
  Plus,
  Search,
  Edit,
  Trash,
  Wallet,
  User,
  Building,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface CustomerWithAccount extends Customer {
  currentAccount?: CurrentAccount | null;
}

export default function ClientesPage() {
  const { organization } = useOrganization();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<CustomerWithAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    if (organization?.id) {
      loadCustomers();
    }
  }, [organization?.id]);

  const loadCustomers = async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const data = await getCustomers(organization.id);
      // Cargar cuentas corrientes
      const customersWithAccounts = await Promise.all(
        data.map(async customer => {
          if (customer.hasCurrentAccount) {
            const account = await getCurrentAccountByCustomer(
              organization.id,
              customer.id
            );
            return { ...customer, currentAccount: account };
          }
          return { ...customer, currentAccount: null };
        })
      );
      setCustomers(customersWithAccounts);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: CustomerFormData) => {
    if (!organization?.id) return;

    if (selectedCustomer) {
      await updateCustomer(organization.id, selectedCustomer.id, data);
      toast({ title: 'Cliente actualizado', description: data.name });
    } else {
      await createCustomer(organization.id, {
        ...data,
        organizationId: organization.id,
      });
      toast({ title: 'Cliente creado', description: data.name });
    }
    loadCustomers();
    setSelectedCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!organization?.id || !customerToDelete) return;

    try {
      await deleteCustomer(organization.id, customerToDelete.id);
      toast({ title: 'Cliente eliminado', description: customerToDelete.name });
      loadCustomers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document.includes(searchTerm)
  );

  const formatBalance = (balance: number) => {
    const formatted = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Math.abs(balance));
    if (balance > 0)
      return <span className="text-red-400">Debe: {formatted}</span>;
    if (balance < 0)
      return <span className="text-green-400">A favor: {formatted}</span>;
    return <span className="text-slate-400">Sin saldo</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400">
            Gestión de clientes y cuentas corrientes
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCustomer(null);
            setDialogOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre o documento..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800/50 hover:bg-slate-800/50">
              <TableHead className="text-slate-400">Tipo</TableHead>
              <TableHead className="text-slate-400">Nombre</TableHead>
              <TableHead className="text-slate-400">Documento</TableHead>
              <TableHead className="text-slate-400">Condición</TableHead>
              <TableHead className="text-slate-400">Cuenta Corriente</TableHead>
              <TableHead className="text-slate-400 w-[100px]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-400"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-400"
                >
                  No hay clientes registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map(customer => (
                <TableRow key={customer.id} className="hover:bg-slate-800/50">
                  <TableCell>
                    {customer.type === 'individual' ? (
                      <User className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Building className="h-4 w-4 text-purple-400" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {customer.document}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {customer.taxCondition.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    {customer.hasCurrentAccount ? (
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-emerald-400" />
                        {customer.currentAccount ? (
                          formatBalance(customer.currentAccount.balance)
                        ) : (
                          <span className="text-slate-400">Sin saldo</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">No habilitada</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-slate-800 border-slate-700"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit(customer)}
                          className="hover:bg-slate-700 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(customer)}
                          className="text-red-400 hover:bg-red-900/20 cursor-pointer"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Eliminar cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción no se puede deshacer. Se eliminará{' '}
              {customerToDelete?.name} y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
