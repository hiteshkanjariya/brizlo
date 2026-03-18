import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/store/slices/categorySlice';
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
  Layers,
  CheckCircle2,
  XCircle,
  Hash,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Tag,
  Power,
  PowerOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryFormValues {
  name: string;
  description: string;
  slug: string;
  is_active: boolean;
  note: string;
}

const defaultForm: CategoryFormValues = {
  name: '',
  description: '',
  slug: '',
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
          <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-3.5 w-48 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-5 w-16 rounded-full bg-muted" /></TableCell>
      <TableCell><div className="h-3.5 w-24 rounded bg-muted" /></TableCell>
      <TableCell><div className="h-3.5 w-24 rounded bg-muted" /></TableCell>
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

// ─── Category Form Dialog ─────────────────────────────────────────────────────

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  initialValues?: CategoryFormValues;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

function CategoryFormDialog({
  open, onClose, onSubmit, initialValues, isSubmitting, mode,
}: CategoryFormDialogProps) {
  const [form, setForm] = useState<CategoryFormValues>(initialValues ?? defaultForm);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    setForm(initialValues ?? defaultForm);
    setSlugTouched(false);
  }, [open, initialValues]);

  // Auto-generate slug from name (only for create mode and before touching)
  useEffect(() => {
    if (!slugTouched && mode === 'create') {
      const generated = form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setForm((prev) => ({ ...prev, slug: generated }));
    }
  }, [form.name, slugTouched, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isValid = form.name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              {mode === 'create'
                ? <Plus className="h-5 w-5 text-primary-foreground" />
                : <Pencil className="h-5 w-5 text-primary-foreground" />}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {mode === 'create' ? 'Create Category' : 'Edit Category'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {mode === 'create' ? 'Add a new product category' : 'Update category details'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Electronics"
              className="h-10"
              required
              autoFocus
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug" className="text-sm font-medium flex items-center gap-1.5">
              Slug
              <span className="text-muted-foreground text-xs font-normal">(auto-generated if blank)</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((p) => ({ ...p, slug: e.target.value }));
                }}
                placeholder="electronics"
                className="h-10 pl-8 font-mono text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of this category..."
              className="resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-note" className="text-sm font-medium flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-amber-500" />
              Internal Note
              <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Input
              id="cat-note"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="Private note visible only to admins..."
              className="h-10"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Active Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show or hide this category for products</p>
            </div>
            <Switch
              id="cat-active"
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
              id={mode === 'create' ? 'create-category-submit' : 'update-category-submit'}
              className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{mode === 'create' ? 'Creating…' : 'Saving…'}</>
              ) : (
                mode === 'create' ? 'Create Category' : 'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, isLoading, isCreating, isUpdating, isDeleting, error } =
    useAppSelector((state) => state.categories);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Search / filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  // ── Reset page on filter change ────────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ── Auto-dismiss error ────────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  // ── Filtered & paginated list ──────────────────────────────────────────────
  const filtered = categories.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_active) ||
      (statusFilter === 'inactive' && !c.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleCreate = useCallback(
    async (values: CategoryFormValues) => {
      const payload: CreateCategoryPayload = {
        name: values.name,
        ...(values.description && { description: values.description }),
        ...(values.slug && { slug: values.slug }),
        is_active: values.is_active,
        ...(values.note && { note: values.note }),
      };
      try {
        await dispatch(createCategory(payload)).unwrap();
        toast.success('Category created successfully');
        setCreateOpen(false);
      } catch (err) {
        toast.error((err as string) || 'Failed to create category');
      }
    },
    [dispatch]
  );

  const handleUpdate = useCallback(
    async (values: CategoryFormValues) => {
      if (!editTarget) return;
      const updates: UpdateCategoryPayload = {
        name: values.name,
        description: values.description || undefined,
        slug: values.slug || undefined,
        is_active: values.is_active,
        note: values.note || undefined,
      };
      try {
        await dispatch(updateCategory({ category_id: editTarget.id, updates })).unwrap();
        toast.success('Category updated successfully');
        setEditTarget(null);
      } catch (err) {
        toast.error((err as string) || 'Failed to update category');
      }
    },
    [dispatch, editTarget]
  );

  const handleToggleStatus = useCallback(
    async (cat: Category) => {
      try {
        await dispatch(
          updateCategory({ category_id: cat.id, updates: { is_active: !cat.is_active } })
        ).unwrap();
        toast.success(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    },
    [dispatch]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteCategory(deleteTarget.id)).unwrap();
      toast.success('Category deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      toast.error((err as string) || 'Failed to delete category');
    }
  }, [dispatch, deleteTarget]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalActive = categories.filter((c) => c.is_active).length;
  const totalInactive = categories.length - totalActive;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Layers className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground">Manage product categories for your business</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="refresh-categories"
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchCategories({}))}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              id="open-create-category"
              onClick={() => setCreateOpen(true)}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* ── Error Banner ──────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-destructive/70 hover:text-destructive"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Stats Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Total Categories',
              value: categories.length,
              icon: Layers,
              color: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
            },
            {
              label: 'Active',
              value: totalActive,
              icon: CheckCircle2,
              color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Inactive',
              value: totalInactive,
              icon: XCircle,
              color: 'from-slate-400/20 to-slate-400/5 border-slate-400/20 text-slate-500',
            },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border shrink-0', s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{isLoading ? '—' : s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Search & Filter ───────────────────────────────────────────────── */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search-categories"
                  placeholder="Search by name, slug, or description..."
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

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>
                  {filtered.length} {filtered.length === 1 ? 'category' : 'categories'} found
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                Page {currentPage} of {totalPages || 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="font-semibold w-12">#</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Note</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Tag className="h-8 w-8 opacity-30" />
                        <p className="font-medium">No categories found</p>
                        <p className="text-sm">
                          {search || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter.'
                            : 'Create your first category to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((cat, idx) => (
                    <TableRow key={cat.id} className="group">
                      {/* # */}
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {startIndex + idx + 1}
                      </TableCell>

                      {/* Category name + slug */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{cat.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {cat.description || <span className="italic opacity-50">No description</span>}
                        </p>
                      </TableCell>

                      {/* Status badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-medium gap-1',
                            cat.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {cat.is_active
                            ? <><CheckCircle2 className="h-3 w-3" />Active</>
                            : <><XCircle className="h-3 w-3" />Inactive</>
                          }
                        </Badge>
                      </TableCell>

                      {/* Note */}
                      <TableCell className="max-w-[160px]">
                        {cat.note ? (
                          <div className="flex items-center gap-1.5">
                            <StickyNote className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{cat.note}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic opacity-40">—</span>
                        )}
                      </TableCell>

                      {/* Created date */}
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(cat.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </TableCell>

                      {/* Actions — inline pill buttons */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button
                                id={`edit-cat-${cat.id}`}
                                onClick={() => setEditTarget(cat)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
                          </Tooltip>

                          {/* Toggle status */}
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button
                                id={`toggle-cat-${cat.id}`}
                                onClick={() => handleToggleStatus(cat)}
                                className={cn(
                                  'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95',
                                  cat.is_active
                                    ? 'text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500'
                                    : 'text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500'
                                )}
                              >
                                {cat.is_active
                                  ? <PowerOff className="h-3.5 w-3.5" />
                                  : <Power className="h-3.5 w-3.5" />}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {cat.is_active ? 'Deactivate' : 'Activate'}
                            </TooltipContent>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button
                                id={`delete-cat-${cat.id}`}
                                onClick={() => setDeleteTarget(cat)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:scale-105 active:scale-95"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* ── Pagination ─────────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of{' '}
                  {filtered.length} {filtered.length === 1 ? 'category' : 'categories'}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Create Dialog ──────────────────────────────────────────────────────── */}
      <CategoryFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        mode="create"
      />

      {/* ── Edit Dialog ────────────────────────────────────────────────────────── */}
      <CategoryFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        initialValues={
          editTarget
            ? {
                name: editTarget.name,
                description: editTarget.description ?? '',
                slug: editTarget.slug,
                is_active: editTarget.is_active,
                note: editTarget.note ?? '',
              }
            : undefined
        }
        isSubmitting={isUpdating}
        mode="edit"
      />

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-7 w-7 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">Delete Category?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-delete-category"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting…</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" />Yes, Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
