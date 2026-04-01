import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

// ─────────────────────────── Types ────────────────────────────────────────────

export type DiscountMode = 'percent' | 'netAmount';
export type PaymentMode = 'cash' | 'online' | 'card';
export type BillStatus = 'pending' | 'paid';

export interface Bill {
  id: number;
  customer_id: number;
  bill_amount: number;
  total_discount: number;
  discount_mode: DiscountMode;
  is_discount: boolean;
  net_amount: number;
  tax_amount: number;
  tax_percent: number;
  tax_type: string;
  text_amount: string;
  payment_mode: PaymentMode;
  status: BillStatus;
  note?: string;
  created_at: string;
}

export interface CreateBillPayload {
  customer_id: number;
  product_ids: number[];
  bill_amount: number;
  total_discount: number;
  discount_mode: DiscountMode;
  is_discount: boolean;
  net_amount: number;
  text_amount: string;
  payment_mode: PaymentMode;
  status: BillStatus;
  note?: string;
}

export interface UpdateBillPayload {
  customer_id?: number;
  bill_amount?: number;
  total_discount?: number;
  discount_mode?: DiscountMode;
  is_discount?: boolean;
  net_amount?: number;
  tax_amount?: number;
  tax_percent?: number;
  tax_type?: string;
  text_amount?: string;
  payment_mode?: PaymentMode;
  status?: BillStatus;
  note?: string;
}

interface BillingState {
  bills: Bill[];
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

const initialState: BillingState = {
  bills: [],
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

export const fetchBills = createAsyncThunk(
  'billing/fetchAll',
  async ({ page = 1, limit = 10, customer_id }: { page?: number; limit?: number; customer_id?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/billing/', {
        params: { page, limit, customer_id },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to fetch bills');
      }
      return rejectWithValue('Failed to fetch bills');
    }
  }
);

export const createBill = createAsyncThunk(
  'billing/create',
  async (payload: CreateBillPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/billing/', payload);
      return response.data as Bill;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to create bill');
      }
      return rejectWithValue('Failed to create bill');
    }
  }
);

export const updateBill = createAsyncThunk(
  'billing/update',
  async (
    { id, updates }: { id: number; updates: UpdateBillPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`/api/v1/billing/${id}`, updates);
      return response.data as Bill;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to update bill');
      }
      return rejectWithValue('Failed to update bill');
    }
  }
);

export const deleteBill = createAsyncThunk(
  'billing/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/billing/${id}`);
      return id;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data?.detail || 'Failed to delete bill');
      }
      return rejectWithValue('Failed to delete bill');
    }
  }
);

// ─────────────────────── Slice ────────────────────────────────────────────────

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchBills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bills = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.total_pages;
        state.currentPage = action.payload.current_page;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createBill.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.isCreating = false;
        state.bills.unshift(action.payload);
      })
      .addCase(createBill.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateBill.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.isUpdating = false;
        const idx = state.bills.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.bills[idx] = action.payload;
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteBill.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.bills = state.bills.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = billingSlice.actions;
export default billingSlice.reducer;
