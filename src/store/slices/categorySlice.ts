import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

// ─────────────────────────── Types ────────────────────────────────────────────

export interface Category {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  slug: string;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  slug?: string;
  is_active?: boolean;
  note?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  slug?: string;
  is_active?: boolean;
  note?: string;
}

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// ─────────────────────── Initial State ────────────────────────────────────────

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// ─────────────────────── Async Thunks ─────────────────────────────────────────

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async ({ skip = 0, limit = 100 }: { skip?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/products/categories', {
        params: { skip, limit },
      });
      return response.data as Category[];
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to fetch categories');
      }
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (category_id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products/categories/${category_id}`);
      return response.data as Category;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Category not found');
      }
      return rejectWithValue('Category not found');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/products/categories', payload);
      return response.data as Category;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to create category');
      }
      return rejectWithValue('Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async (
    { category_id, updates }: { category_id: number; updates: UpdateCategoryPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        `/api/v1/products/categories/${category_id}`,
        updates
      );
      return response.data as Category;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to update category');
      }
      return rejectWithValue('Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (category_id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/products/categories/${category_id}`);
      return category_id;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to delete category');
      }
      return rejectWithValue('Failed to delete category');
    }
  }
);

// ─────────────────────── Slice ────────────────────────────────────────────────

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All ──────────────────────────────────────────────────────────
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── Fetch By ID ────────────────────────────────────────────────────────
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── Create ─────────────────────────────────────────────────────────────
      .addCase(createCategory.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isCreating = false;
        state.categories.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // ── Update ─────────────────────────────────────────────────────────────
      .addCase(updateCategory.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isUpdating = false;
        const idx = state.categories.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.categories[idx] = action.payload;
        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // ── Delete ─────────────────────────────────────────────────────────────
      .addCase(deleteCategory.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
