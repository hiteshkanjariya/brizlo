import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  clearError,
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from '@/store/slices/customerSlice';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Power,
  PowerOff,
  User,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerFormValues {
  name: string;
  mobile: string;
  address: string;
  is_active: boolean;
  note: string;
}

const defaultForm: CustomerFormValues = {
  name: '',
  mobile: '',
  address: '',
  is_active: true,
  note: '',
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      <TableCell><div className="h-4 w-6 rounded bg-muted" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-24 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-6 w-16 rounded-full bg-muted" /></TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Customer Form Dialog ─────────────────────────────────────────────────────

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
  initialValues?: CustomerFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

function CustomerFormDialog({
  open, onClose, onSubmit, initialValues, isSubmitting, mode,
}: CustomerFormDialogProps) {
  const [form, setForm] = useState<CustomerFormValues>(initialValues ?? defaultForm);

  useEffect(() => {
    setForm(initialValues ?? defaultForm);
  }, [open, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isValid = form.name.trim().length > 0 && form.mobile.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              {mode === 'create'
                ? <Plus className="h-5 w-5 text-primary-foreground" />
                : <Pencil className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {mode === 'create' ? 'Create Customer' : 'Edit Customer'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the details for your customer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="cust-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cust-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="cust-mobile" className="text-sm font-medium">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cust-mobile"
                  value={form.mobile}
                  onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                  placeholder="e.g. +919876543210"
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="cust-address" className="text-sm font-medium">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="cust-address"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Street, City, State..."
                  className="resize-none text-sm pl-9 pt-2"
                  rows={2}
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="cust-note" className="text-sm font-medium">Note</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="cust-note"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Additional notes about the customer..."
                  className="resize-none text-sm pl-9 pt-2"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Active Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show or hide this customer in selection lists</p>
            </div>
            <Switch
              id="cust-active"
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
              ) : (
                mode === 'create' ? 'Create Customer' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const { customers, isLoading, isCreating, isUpdating, isDeleting, error, total, totalPages, currentPage } =
    useAppSelector((state) => state.customers);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  // Search / filter
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 10 }));
  }, [dispatch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRefresh = () => {
    dispatch(fetchCustomers({ page: currentPage, limit, search }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchCustomers({ page, limit, search }));
  };

  const handleLimitChange = (newLimit: string) => {
    const l = parseInt(newLimit);
    setLimit(l);
    dispatch(fetchCustomers({ page: 1, limit: l, search }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchCustomers({ page: 1, limit, search }));
  };

  const handleCreate = useCallback(
    async (values: CustomerFormValues) => {
      const payload: CreateCustomerPayload = {
        name: values.name,
        mobile: values.mobile,
        address: values.address || undefined,
        is_active: values.is_active,
        note: values.note || undefined,
      };
      try {
        await dispatch(createCustomer(payload)).unwrap();
        toast.success('Customer created successfully');
        setCreateOpen(false);
      } catch (err) {
        toast.error((err as string) || 'Failed to create customer');
      }
    },
    [dispatch]
  );

  const handleUpdate = useCallback(
    async (values: CustomerFormValues) => {
      if (!editTarget) return;
      const updates: UpdateCustomerPayload = {
        name: values.name,
        mobile: values.mobile,
        address: values.address || undefined,
        is_active: values.is_active,
        note: values.note || undefined,
      };
      try {
        await dispatch(updateCustomer({ customer_id: editTarget.id, updates })).unwrap();
        toast.success('Customer updated successfully');
        setEditTarget(null);
      } catch (err) {
        toast.error((err as string) || 'Failed to update customer');
      }
    },
    [dispatch, editTarget]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteCustomer(deleteTarget.id)).unwrap();
      toast.success('Customer deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      toast.error((err as string) || 'Failed to delete customer');
    }
  }, [dispatch, deleteTarget]);

  const handleToggleStatus = useCallback(
    async (cust: Customer) => {
      try {
        await dispatch(
          updateCustomer({ customer_id: cust.id, updates: { is_active: !cust.is_active } })
        ).unwrap();
        toast.success(`Customer ${!cust.is_active ? 'activated' : 'deactivated'}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    },
    [dispatch]
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <p className="text-muted-foreground">Manage your customer database</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{total}</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">
                  {customers.filter(c => c.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">Active in Current Page</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or address..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" className="sm:w-auto">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
             <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Directory</CardTitle>
                <CardDescription>
                  A complete list of your customers and their contact information
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {customers.length} Records Loaded
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <User className="h-12 w-12 opacity-20" />
                          <p className="text-lg font-medium">No customers found</p>
                          <Button variant="link" onClick={() => setCreateOpen(true)}>Add your first customer</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((cust, idx) => (
                      <TableRow key={cust.id}>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {(currentPage - 1) * limit + idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold leading-none">{cust.name}</p>
                              {cust.address && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">
                                  {cust.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-sm font-mono">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {cust.mobile}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs gap-1',
                              cust.is_active
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            )}
                          >
                            {cust.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {cust.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => setEditTarget(cust)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8",
                                    cust.is_active ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"
                                  )}
                                  onClick={() => handleToggleStatus(cust)}
                                >
                                  {cust.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{cust.is_active ? 'Deactivate' : 'Activate'}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setDeleteTarget(cust)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-6">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rows per page:</span>
                  <Select value={limit.toString()} onValueChange={handleLimitChange}>
                    <SelectTrigger className="h-8 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['10', '20', '50', '100'].map((l) => (
                        <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <CustomerFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        mode="create"
      />

      {/* Edit Dialog */}
      <CustomerFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        mode="edit"
        initialValues={editTarget ? {
          name: editTarget.name,
          mobile: editTarget.mobile,
          address: editTarget.address || '',
          is_active: editTarget.is_active,
          note: editTarget.note || '',
        } : undefined}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              <span className="font-semibold text-foreground"> "{deleteTarget?.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
