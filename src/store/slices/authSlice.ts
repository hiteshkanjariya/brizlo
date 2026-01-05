import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  business_code: string;
  business_name: string;
  name: string; // For backward compatibility
  email: string; // For backward compatibility
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ business_code, password }: { business_code: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/signin', { business_code, password });
      const data = response.data;

      // Since the signin API doesn't return user details, we'll create a minimal user object
      const user: User = {
        id: business_code,
        business_code: business_code,
        business_name: '', // We don't have this from signin
        name: business_code,
        email: business_code,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      return { user, token: data.access_token };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data.message || 'Invalid business code or password');
      }
      return rejectWithValue('An error occurred during login');
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ business_code, password, business_name }: { business_code: string; password: string; business_name: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/signup', { business_code, password, business_name });
      const data = response.data;

      const user: User = {
        id: business_code,
        business_code: business_code,
        business_name: business_name,
        name: business_name,
        email: business_code,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      return { user, token: data.access_token };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        return rejectWithValue(error.response.data.message || 'Sign up failed');
      }
      return rejectWithValue('An error occurred during sign up');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      // Mock for now as no API provided for forgot password
      await new Promise((resolve) => setTimeout(resolve, 800));
      return true;
    } catch (error) {
      return rejectWithValue('An error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('auth_token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('auth_token', action.payload.token);
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;


