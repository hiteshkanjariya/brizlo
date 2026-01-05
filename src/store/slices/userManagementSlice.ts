import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authSlice';

export interface ManagedUser extends User {
    status: 'active' | 'inactive' | 'pending';
    lastLogin?: string;
}

interface UserManagementState {
    users: ManagedUser[];
    isLoading: boolean;
    error: string | null;
}

const initialState: UserManagementState = {
    users: [],
    isLoading: false,
    error: null,
};

const initialUsers: ManagedUser[] = [
    {
        id: '1',
        email: 'admin@demo.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: '2024-12-25',
    },
    {
        id: '2',
        email: 'manager@demo.com',
        name: 'Sarah Johnson',
        role: 'manager',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-12-24',
    },
    {
        id: '3',
        email: 'user@demo.com',
        name: 'Michael Chen',
        role: 'user',
        status: 'active',
        createdAt: '2024-02-01',
        lastLogin: '2024-12-23',
    },
    {
        id: '4',
        email: 'emily.davis@demo.com',
        name: 'Emily Davis',
        role: 'user',
        status: 'pending',
        createdAt: '2024-11-20',
    },
    {
        id: '5',
        email: 'james.wilson@demo.com',
        name: 'James Wilson',
        role: 'manager',
        status: 'inactive',
        createdAt: '2024-03-10',
        lastLogin: '2024-10-15',
    },
    {
        id: '6',
        email: 'olivia.brown@demo.com',
        name: 'Olivia Brown',
        role: 'user',
        status: 'active',
        createdAt: '2024-05-22',
        lastLogin: '2024-12-20',
    },
    {
        id: '7',
        email: 'daniel.garcia@demo.com',
        name: 'Daniel Garcia',
        role: 'user',
        status: 'active',
        createdAt: '2024-06-15',
        lastLogin: '2024-12-22',
    },
    {
        id: '8',
        email: 'sophia.martinez@demo.com',
        name: 'Sophia Martinez',
        role: 'manager',
        status: 'active',
        createdAt: '2024-04-08',
        lastLogin: '2024-12-24',
    },
];

export const fetchUsers = createAsyncThunk(
    'userManagement/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return initialUsers;
        } catch (error) {
            return rejectWithValue('Failed to fetch users');
        }
    }
);

export const addUser = createAsyncThunk(
    'userManagement/addUser',
    async (userData: Omit<ManagedUser, 'id' | 'createdAt'>, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { userManagement: UserManagementState };
            await new Promise((resolve) => setTimeout(resolve, 500));

            const existingUser = state.userManagement.users.find(
                (u) => u.email.toLowerCase() === userData.email.toLowerCase()
            );
            if (existingUser) {
                return rejectWithValue('Email already exists');
            }

            const newUser: ManagedUser = {
                ...userData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString().split('T')[0],
            };

            return newUser;
        } catch (error) {
            return rejectWithValue('Failed to add user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'userManagement/updateUser',
    async ({ id, updates }: { id: string; updates: Partial<ManagedUser> }, { rejectWithValue }) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { id, updates };
        } catch (error) {
            return rejectWithValue('Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'userManagement/deleteUser',
    async (id: string, { rejectWithValue }) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return id;
        } catch (error) {
            return rejectWithValue('Failed to delete user');
        }
    }
);

const userManagementSlice = createSlice({
    name: 'userManagement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add User
            .addCase(addUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users.push(action.payload);
            })
            .addCase(addUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update User
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = { ...state.users[index], ...action.payload.updates };
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = state.users.filter((u) => u.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default userManagementSlice.reducer;
