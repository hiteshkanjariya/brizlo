import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

// ─────────────────────────── Types ────────────────────────────────────────────

export interface Customer {
  id: number;
  business_id: number;
  name: string;
  mobile: string;
  address: string | null;
  is_active: boolean;
  note?: string;
  created_at: string;
}

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  address?: string;
  is_active?: boolean;
  note?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  mobile?: string;
  address?: string;
  is_active?: boolean;
  note?: string;
}

interface CustomerState {
  customers: Customer[];
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

const initialState: CustomerState = {
  customers: [],
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

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async ({ page, limit, search }: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/customers/', {
        params: { page, limit, search },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to fetch customers');
      }
      return rejectWithValue('Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (customer_id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/customers/${customer_id}`);
      return response.data as Customer;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Customer not found');
      }
      return rejectWithValue('Customer not found');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (payload: CreateCustomerPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/customers/', payload);
      return response.data as Customer;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to create customer');
      }
      return rejectWithValue('Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async (
    { customer_id, updates }: { customer_id: number; updates: UpdateCustomerPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/api/v1/customers/${customer_id}`, updates);
      return response.data as Customer;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to update customer');
      }
      return rejectWithValue('Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (customer_id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/customers/${customer_id}`);
      return customer_id;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to delete customer');
      }
      return rejectWithValue('Failed to delete customer');
    }
  }
);

// ─────────────────────── Slice ────────────────────────────────────────────────

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch All ──────────────────────────────────────────────────────────
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.total_pages || 0;
        state.currentPage = action.payload.current_page || 1;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── Create ─────────────────────────────────────────────────────────────
      .addCase(createCustomer.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isCreating = false;
        state.customers.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })

      // ── Update ─────────────────────────────────────────────────────────────
      .addCase(updateCustomer.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isUpdating = false;
        const idx = state.customers.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.customers[idx] = action.payload;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })

      // ── Delete ─────────────────────────────────────────────────────────────
      .addCase(deleteCustomer.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.customers = state.customers.filter((c) => c.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = customerSlice.actions;
export default customerSlice.reducer;
