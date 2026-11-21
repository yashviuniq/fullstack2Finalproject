import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi, LoginParams, RegisterParams } from '../../api/auth';
import { setStoredToken } from '../../api/client';
import { AuthResponse, Role, User } from '../../types';

const USER_STORAGE_KEY = 'student_mgmt_user_profile';

const storeUserLocal = async (user: User | null) => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      return;
    }
    if (user) {
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('User storage error:', err);
  }
};

const getUserLocal = async (): Promise<User | null> => {
  try {
    let userJson: string | null = null;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        userJson = window.localStorage.getItem(USER_STORAGE_KEY);
      }
    } else {
      userJson = await SecureStore.getItemAsync(USER_STORAGE_KEY);
    }
    return userJson ? (JSON.parse(userJson) as User) : null;
  } catch (err) {
    console.warn('User read error:', err);
    return null;
  }
};

const getTokenLocal = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('student_mgmt_jwt_token');
      }
      return null;
    }
    return await SecureStore.getItemAsync('student_mgmt_jwt_token');
  } catch (err) {
    console.warn('Token read error:', err);
    return null;
  }
};

export interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isRestoringSession: true,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<AuthResponse, LoginParams, { rejectValue: string }>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      await setStoredToken(response.token);
      await storeUserLocal(response.user);
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterParams, { rejectValue: string }>(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      await setStoredToken(response.token);
      await storeUserLocal(response.user);
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      return rejectWithValue(msg);
    }
  }
);

export const restoreSession = createAsyncThunk<
  { user: User; token: string } | null,
  void,
  { rejectValue: string }
>('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const token = await getTokenLocal();
    const user = await getUserLocal();
    if (token && user) {
      await setStoredToken(token);
      return { user, token };
    }
    return null;
  } catch (err: any) {
    return rejectWithValue('Failed to restore session');
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await setStoredToken(null);
  await storeUserLocal(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Registration failed';
    });

    // Restore Session
    builder.addCase(restoreSession.pending, (state) => {
      state.isRestoringSession = true;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.isRestoringSession = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.token = action.payload.token;
      }
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.isRestoringSession = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
