import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

// ─────────────────────────── Types ────────────────────────────────────────────

export interface Product {
  id: number;
  business_id: number;
  name: string;
  qty: number;
  price: string;
  description: string | null;
  is_active: boolean;
  categories: { id: number; name: string }[];
  created_at: string;
}

export interface CreateProductPayload {
  name: string;
  qty: number;
  price: string;
  description?: string;
  is_active?: boolean;
  category_ids: number[];
}

export interface UpdateProductPayload {
  name?: string;
  qty?: number;
  price?: string;
  description?: string;
  is_active?: boolean;
  category_ids?: number[];
}

interface ProductState {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

// ─────────────────────── Initial State ────────────────────────────────────────

const initialState: ProductState = {
  products: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// ─────────────────────── Async Thunks ─────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/products/', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to fetch products');
      }
      return rejectWithValue('Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (product_id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/products/${product_id}`);
      return response.data as Product;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Product not found');
      }
      return rejectWithValue('Product not found');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/products/', payload);
      return response.data as Product;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to create product');
      }
      return rejectWithValue('Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async (
    { product_id, updates }: { product_id: number; updates: UpdateProductPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/api/v1/products/${product_id}`, updates);
      return response.data as Product;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to update product');
      }
      return rejectWithValue('Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (product_id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/products/${product_id}`);
      return product_id;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to delete product');
      }
      return rejectWithValue('Failed to delete product');
    }
  }
);

// ─────────────────────── Slice ────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All ──────────────────────────────────────────────────────────
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.total_pages;
        state.currentPage = action.payload.current_page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── Create ─────────────────────────────────────────────────────────────
      .addCase(createProduct.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isCreating = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // ── Update ─────────────────────────────────────────────────────────────
      .addCase(updateProduct.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isUpdating = false;
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.products[idx] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // ── Delete ─────────────────────────────────────────────────────────────
      .addCase(deleteProduct.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
