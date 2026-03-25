import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
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
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Loader2,
  Tag,
  Power,
  PowerOff,
  Package,
  DollarSign,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductFormValues {
  name: string;
  qty: number;
  price: string;
  description: string;
  is_active: boolean;
  category_ids: number[];
}

const defaultForm: ProductFormValues = {
  name: '',
  qty: 0,
  price: '0.00',
  description: '',
  is_active: true,
  category_ids: [],
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
      <TableCell><div className="h-4 w-12 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-4 w-16 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-6 w-24 rounded bg-muted" /></TableCell>
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

// ─── Product Form Dialog ─────────────────────────────────────────────────────

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  initialValues?: ProductFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

function ProductFormDialog({
  open, onClose, onSubmit, initialValues, isSubmitting, mode,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductFormValues>(initialValues ?? defaultForm);
  const { categories } = useAppSelector((state) => state.categories);

  useEffect(() => {
    setForm(initialValues ?? defaultForm);
  }, [open, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isValid = form.name.trim().length > 0 && form.qty >= 0 && parseFloat(form.price) >= 0;

  const toggleCategory = (id: number) => {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter(cid => cid !== id)
        : [...prev.category_ids, id]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              {mode === 'create'
                ? <Plus className="h-5 w-5 text-primary-foreground" />
                : <Pencil className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {mode === 'create' ? 'Create Product' : 'Edit Product'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the details for your product
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="prod-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Wireless Headset"
                className="h-10"
                required
              />
            </div>

            {/* Qty */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-qty" className="text-sm font-medium">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prod-qty"
                  type="number"
                  min="0"
                  value={form.qty}
                  onChange={(e) => setForm((p) => ({ ...p, qty: parseInt(e.target.value) || 0 }))}
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-price" className="text-sm font-medium">
                Price <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Categories</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal"
                >
                  <div className="flex flex-wrap gap-1">
                    {form.category_ids.length > 0 ? (
                      form.category_ids.map(id => {
                        const cat = categories.find(c => c.id === id);
                        return (
                          <Badge key={id} variant="secondary" className="font-normal">
                            {cat?.name || id}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground">Select categories...</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandList>
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          onSelect={() => toggleCategory(cat.id)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                        id={`cat-${cat.id}`}
                            checked={form.category_ids.includes(cat.id)}
                          />
                          <span>{cat.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="prod-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Product details and specifications..."
              className="resize-none text-sm"
              rows={4}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Active Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show or hide this product in the catalog</p>
            </div>
            <Switch
              id="prod-active"
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
                mode === 'create' ? 'Create Product' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, isLoading, isCreating, isUpdating, isDeleting, error, total, totalPages, currentPage } =
    useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Search / filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [limit, setLimit] = useState(10);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
    dispatch(fetchCategories({ limit: 100 }));
  }, [dispatch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRefresh = () => {
    dispatch(fetchProducts({ page: currentPage, limit }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchProducts({ page, limit }));
  };

  const handleLimitChange = (newLimit: string) => {
    const l = parseInt(newLimit);
    setLimit(l);
    dispatch(fetchProducts({ page: 1, limit: l }));
  };

  const handleCreate = useCallback(
    async (values: ProductFormValues) => {
      const payload: CreateProductPayload = {
        name: values.name,
        qty: values.qty,
        price: values.price,
        description: values.description || undefined,
        is_active: values.is_active,
        category_ids: values.category_ids,
      };
      try {
        await dispatch(createProduct(payload)).unwrap();
        toast.success('Product created successfully');
        setCreateOpen(false);
      } catch (err) {
        toast.error((err as string) || 'Failed to create product');
      }
    },
    [dispatch]
  );

  const handleUpdate = useCallback(
    async (values: ProductFormValues) => {
      if (!editTarget) return;
      const updates: UpdateProductPayload = {
        name: values.name,
        qty: values.qty,
        price: values.price,
        description: values.description || undefined,
        is_active: values.is_active,
        category_ids: values.category_ids,
      };
      try {
        await dispatch(updateProduct({ product_id: editTarget.id, updates })).unwrap();
        toast.success('Product updated successfully');
        setEditTarget(null);
      } catch (err) {
        toast.error((err as string) || 'Failed to update product');
      }
    },
    [dispatch, editTarget]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteProduct(deleteTarget.id)).unwrap();
      toast.success('Product deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      toast.error((err as string) || 'Failed to delete product');
    }
  }, [dispatch, deleteTarget]);

  const handleToggleStatus = useCallback(
    async (prod: Product) => {
      try {
        await dispatch(
          updateProduct({ product_id: prod.id, updates: { is_active: !prod.is_active } })
        ).unwrap();
        toast.success(`Product ${!prod.is_active ? 'activated' : 'deactivated'}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    },
    [dispatch]
  );

  // ── Filtered local list (for search on current page) ─────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && p.is_active) || (statusFilter === 'inactive' && !p.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground">Manage your product inventory</p>
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
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{total}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
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
                  {products.filter(p => p.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">Active in Current Page</p>
              </div>
            </CardContent>
          </Card>
           <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{categories.length}</p>
                <p className="text-xs text-muted-foreground">Available Categories</p>
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
                  placeholder="Search products..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  List of all your products across all categories
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {products.length} Items Listed
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <ShoppingBag className="h-12 w-12 opacity-20" />
                        <p className="text-lg font-medium">No products found</p>
                        <Button variant="link" onClick={() => setCreateOpen(true)}>Add your first product</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((prod, idx) => (
                    <TableRow key={prod.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {(currentPage - 1) * limit + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 border border-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold leading-none">{prod.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{prod.description || 'No description'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prod.qty > 5 ? "secondary" : "destructive"} className="font-mono">
                          {prod.qty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold font-mono">${prod.price}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {prod.categories.map((c) => (
                            <Badge key={c.id} variant="outline" className="text-[10px] h-5 py-0 px-1 border-primary/20 bg-primary/5">
                              {c.name}
                            </Badge>
                          ))}
                          {prod.categories.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs gap-1',
                            prod.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {prod.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {prod.is_active ? 'Active' : 'Hidden'}
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
                                onClick={() => setEditTarget(prod)}
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
                                  prod.is_active ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"
                                )}
                                onClick={() => handleToggleStatus(prod)}
                              >
                                {prod.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{prod.is_active ? 'Deactivate' : 'Activate'}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTarget(prod)}
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
      <ProductFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        mode="create"
      />

      {/* Edit Dialog */}
      <ProductFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        mode="edit"
        initialValues={editTarget ? {
          name: editTarget.name,
          qty: editTarget.qty,
          price: editTarget.price,
          description: editTarget.description || '',
          is_active: editTarget.is_active,
          category_ids: editTarget.categories.map(c => c.id),
        } : undefined}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
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
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
