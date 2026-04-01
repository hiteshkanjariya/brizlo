import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBills,
  createBill,
  updateBill,
  deleteBill,
  Bill,
  CreateBillPayload,
  UpdateBillPayload,
} from '@/store/slices/billingSlice';
import { fetchCustomers } from '@/store/slices/customerSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  DollarSign,
  User,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillFormValues {
  customer_id: number;
  product_ids: number[];
  bill_amount: number;
  total_discount: number;
  discount_mode: 'percent' | 'netAmount';
  is_discount: boolean;
  net_amount: number;
  tax_amount: number;
  tax_percent: number;
  tax_type: string;
  text_amount: string;
  payment_mode: 'cash' | 'online' | 'card';
  status: 'pending' | 'paid';
  note: string;
  items: { product_id: number; qty: number }[];
}

const defaultForm: BillFormValues = {
  customer_id: 0,
  product_ids: [],
  bill_amount: 0,
  total_discount: 0,
  discount_mode: 'netAmount',
  is_discount: false,
  net_amount: 0,
  tax_amount: 0,
  tax_percent: 0,
  tax_type: 'GST',
  text_amount: '',
  payment_mode: 'cash',
  status: 'pending',
  note: '',
  items: [],
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      <TableCell><div className="h-4 w-6 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-4 w-24 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-4 w-16 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-4 w-16 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-6 w-20 rounded-full bg-muted" /></TableCell>
      <TableCell><div className="h-6 w-16 rounded-full bg-muted" /></TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Number to Words (Simplified) ─────────────────────────────────────────────
function numberToWords(num: number): string {
  // This is a placeholder since a full library is not available.
  // In a real app, you'd use a dedicated library like 'number-to-words'
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('₹', '') + ' Only';
}

// ─── Bill Form Dialog ─────────────────────────────────────────────────────

interface BillFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BillFormValues) => void;
  initialValues?: BillFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

function BillFormDialog({
  open, onClose, onSubmit, initialValues, isSubmitting, mode,
}: BillFormDialogProps) {
  const [form, setForm] = useState<BillFormValues>(initialValues ?? defaultForm);
  const { customers } = useAppSelector((state) => state.customers);
  const { products } = useAppSelector((state) => state.products);

  useEffect(() => {
    setForm(initialValues ?? defaultForm);
  }, [open, initialValues]);

  // Handle calculations
  useEffect(() => {
    // Calculate bill_amount from selected items
    const amount = form.items.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.product_id);
      return sum + (prod ? parseFloat(prod.price) * item.qty : 0);
    }, 0);

    // Calculate discount
    let discount = 0;
    if (form.is_discount) {
      if (form.discount_mode === 'percent') {
        discount = (amount * form.total_discount) / 100;
      } else {
        discount = form.total_discount;
      }
    }

    const taxableAmount = Math.max(0, amount - discount);

    // Calculate tax
    const tax = (taxableAmount * form.tax_percent) / 100;
    const net = taxableAmount + tax;

    setForm(prev => ({
      ...prev,
      bill_amount: amount,
      tax_amount: tax,
      net_amount: net,
      text_amount: numberToWords(net)
    }));
  }, [form.items, form.total_discount, form.discount_mode, form.is_discount, form.tax_percent, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.customer_id === 0) {
      toast.error('Please select a customer');
      return;
    }
    if (form.items.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Convert items to flat product_ids for API
    const product_ids: number[] = [];
    form.items.forEach(item => {
      for (let i = 0; i < item.qty; i++) product_ids.push(item.product_id);
    });

    onSubmit({ ...form, product_ids });
  };

  const toggleProduct = (id: number) => {
    setForm(prev => {
      const exists = prev.items.find(i => i.product_id === id);
      if (exists) {
        return { ...prev, items: prev.items.filter(i => i.product_id !== id) };
      } else {
        return { ...prev, items: [...prev.items, { product_id: id, qty: 1 }] };
      }
    });
  };

  const updateQty = (id: number, delta: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.product_id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              {mode === 'create'
                ? <Plus className="h-5 w-5 text-primary-foreground" />
                : <Pencil className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {mode === 'create' ? 'Create New Bill' : 'Edit Bill'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Generate a billing statement for your sale
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label className="text-sm font-medium">Customer <span className="text-destructive">*</span></Label>
              <Select
                value={form.customer_id.toString()}
                onValueChange={(val) => setForm(p => ({ ...p, customer_id: parseInt(val) }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.mobile})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode */}
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label className="text-sm font-medium">Payment Mode</Label>
              <Select
                value={form.payment_mode}
                onValueChange={(val: any) => setForm(p => ({ ...p, payment_mode: val }))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-medium">Select Products <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-between h-10 px-3 font-normal text-left"
                    >
                      <span className="text-muted-foreground">
                        {form.items.length > 0
                          ? `${form.items.length} products selected`
                          : "Click to select products..."}
                      </span>
                      <ShoppingBag className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search products..." />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((prod) => (
                            <CommandItem
                              key={prod.id}
                              onSelect={() => toggleProduct(prod.id)}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={form.items.some(i => i.product_id === prod.id)}
                              />
                              <div className="flex flex-col">
                                <span>{prod.name}</span>
                                <span className="text-xs text-muted-foreground">Price: {prod.price} | Stock: {prod.qty}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selected Products Table */}
              {form.items.length > 0 && (
                <div className="border rounded-xl shadow-sm overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-10 text-xs font-bold uppercase">Product Detail</TableHead>
                        <TableHead className="h-10 text-xs font-bold uppercase w-24">Price</TableHead>
                        <TableHead className="h-10 text-xs font-bold uppercase w-20 text-center">Qty</TableHead>
                        <TableHead className="h-10 text-xs font-bold uppercase w-20 text-center">Stock</TableHead>
                        <TableHead className="h-10 text-xs font-bold uppercase w-16 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map(item => {
                        const prod = products.find(p => p.id === item.product_id);
                        if (!prod) return null;
                        return (
                          <TableRow key={item.product_id} className="group transition-colors hover:bg-muted/30">
                            <TableCell className="py-2.5">
                              <p className="font-semibold text-sm leading-none">{prod.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 uppercase">ID: {prod.id}</p>
                            </TableCell>
                            <TableCell className="py-2.5 font-mono text-sm">
                              ₹{Number(prod.price).toFixed(2)}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 rounded-md"
                                  onClick={() => updateQty(item.product_id, -1)}
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center font-mono font-bold text-sm">{item.qty}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 rounded-md"
                                  onClick={() => updateQty(item.product_id, 1)}
                                  disabled={item.qty >= prod.qty}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5 text-center">
                              <Badge variant="outline" className={cn(
                                "font-mono text-[10px] h-5",
                                prod.qty < 5 ? "text-destructive border-destructive/20 bg-destructive/5" : "text-primary border-primary/20"
                              )}>
                                {prod.qty}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => toggleProduct(item.product_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Discount Toggle */}
            <div className="col-span-2 flex items-center gap-4 p-3 rounded-lg border border-primary/10 bg-primary/5">
              <Checkbox
                id="is_discount"
                checked={form.is_discount}
                onCheckedChange={(val: boolean) => setForm(p => ({ ...p, is_discount: val }))}
              />
              <Label htmlFor="is_discount" className="cursor-pointer">Apply Discount</Label>
            </div>

            {form.is_discount && (
              <div className="col-span-2 grid grid-cols-2 gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/20 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-amber-900">Discount Mode</Label>
                  <Select
                    value={form.discount_mode}
                    onValueChange={(val: any) => setForm(p => ({ ...p, discount_mode: val }))}
                  >
                    <SelectTrigger className="h-10 bg-background border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="netAmount">Amount (₹)</SelectItem>
                      <SelectItem value="percent">Percent (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-amber-900">Discount Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.total_discount}
                    onChange={(e) => setForm(p => ({ ...p, total_discount: parseFloat(e.target.value) || 0 }))}
                    className="bg-background border-amber-200"
                  />
                </div>
              </div>
            )}

            {/* Tax Section */}
            <div className="col-span-2 grid grid-cols-2 gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tax Type</Label>
                <Select
                  value={form.tax_type}
                  onValueChange={(val: string) => setForm(p => ({ ...p, tax_type: val }))}
                >
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="CGST">CGST</SelectItem>
                    <SelectItem value="SGST">SGST</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                    <SelectItem value="VAT">VAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tax Percent (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.tax_percent}
                  onChange={(e) => setForm(p => ({ ...p, tax_percent: parseFloat(e.target.value) || 0 }))}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="col-span-2 grid grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Subtotal</p>
                <p className="text-lg font-bold font-mono">₹{Number(form.bill_amount).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold text-amber-600">Tax ({form.tax_type})</p>
                <p className="text-lg font-bold font-mono text-amber-600">₹{Number(form.tax_amount).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold text-primary">Net Amount</p>
                <p className="text-lg font-bold font-mono text-primary">₹{Number(form.net_amount).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                <Select
                  value={form.status}
                  onValueChange={(val: any) => setForm(p => ({ ...p, status: val }))}
                >
                  <SelectTrigger className="h-8 border-none shadow-none p-0 focus:ring-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Amount in Words</Label>
              <div className="p-2 border rounded-lg bg-background text-sm italic">
                {form.text_amount}
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="bill-note" className="text-sm font-medium">Note</Label>
              <Textarea
                id="bill-note"
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Internal notes or comments..."
                className="resize-none text-sm"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{mode === 'create' ? 'Generating…' : 'Saving…'}</>
              ) : (
                mode === 'create' ? 'Generate Bill' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { bills, isLoading, isCreating, isUpdating, isDeleting, total, totalPages, currentPage } =
    useAppSelector((state) => state.billing);
  const { customers } = useAppSelector((state) => state.customers);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bill | null>(null);

  // Search / filter
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [limit, setLimit] = useState(10);

  // Load dependency data
  useEffect(() => {
    dispatch(fetchBills({ page: 1, limit: 10 }));
    dispatch(fetchCustomers({ limit: 100 }));
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchBills({ page: currentPage, limit, customer_id: customerFilter !== 'all' ? parseInt(customerFilter) : undefined }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchBills({ page, limit, customer_id: customerFilter !== 'all' ? parseInt(customerFilter) : undefined }));
  };

  const handleCreate = async (values: BillFormValues) => {
    try {
      await dispatch(createBill(values)).unwrap();
      toast.success('Bill generated successfully');
      setCreateOpen(false);
    } catch (err) {
      toast.error((err as string) || 'Failed to generate bill');
    }
  };

  const handleUpdate = async (values: BillFormValues) => {
    if (!editTarget) return;
    try {
      await dispatch(updateBill({ id: editTarget.id, updates: values })).unwrap();
      toast.success('Bill updated successfully');
      setEditTarget(null);
    } catch (err) {
      toast.error((err as string) || 'Failed to update bill');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteBill(deleteTarget.id)).unwrap();
      toast.success('Bill deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      toast.error((err as string) || 'Failed to delete bill');
    }
  };

  const getCustomerName = (id: number) => {
    return customers.find(c => c.id === id)?.name || `ID: ${id}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sell / Billing</h1>
              <p className="text-muted-foreground">Manage your sales and generate bills</p>
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
              New Bill
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{total}</p>
                <p className="text-xs text-muted-foreground">Total Bills</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">
                  ₹{bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.net_amount), 0).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Collected Revenue (Page)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{customers.length}</p>
                <p className="text-xs text-muted-foreground">Registered Customers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bill Ledger</CardTitle>
                <CardDescription>
                  List of all sales transactions
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {bills.length} Transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <FileText className="h-12 w-12 opacity-20" />
                        <p className="text-lg font-medium">No bills found</p>
                        <Button variant="link" onClick={() => setCreateOpen(true)}>Generate your first bill</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((bill, idx) => (
                    <TableRow key={bill.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {(currentPage - 1) * limit + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold leading-none">{getCustomerName(bill.customer_id)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold font-mono">₹{Number(bill.net_amount).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {bill.payment_mode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs gap-1',
                            bill.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          )}
                        >
                          {bill.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {bill.status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{new Date(bill.created_at).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => setEditTarget(bill)}
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
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTarget(bill)}
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

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-6">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rows per page:</span>
                  <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
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
      <BillFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        mode="create"
      />

      {/* Edit Dialog */}
      {editTarget && (
        <BillFormDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          mode="edit"
          initialValues={{
            customer_id: editTarget.customer_id,
            product_ids: [], // We need a way to get these from details if available
            bill_amount: Number(editTarget.bill_amount),
            total_discount: Number(editTarget.total_discount),
            discount_mode: editTarget.discount_mode,
            is_discount: editTarget.is_discount,
            net_amount: Number(editTarget.net_amount),
            tax_amount: Number(editTarget.tax_amount),
            tax_percent: Number(editTarget.tax_percent),
            tax_type: editTarget.tax_type,
            text_amount: editTarget.text_amount,
            payment_mode: editTarget.payment_mode,
            status: editTarget.status,
            note: editTarget.note || '',
            items: [], // Since we don't have detail view available yet in main list
          }}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bill for
              <span className="font-semibold text-foreground"> "{getCustomerName(deleteTarget?.customer_id || 0)}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Bill'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
