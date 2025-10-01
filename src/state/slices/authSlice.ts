import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import { login as loginApi, register as registerApi } from '../../api/authService';
import { AuthLoginDtoInput, UserCreateDtoInput } from '../../api/types';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  unique_name: string;
  display_name: string;
  photo: string;
  city_id: string;
}

// Define the shape of the auth state
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: AuthLoginDtoInput, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      await storage.setItem('token', response.token);
      await storage.setItem('refreshToken', response.refreshToken);
      
      const decodedToken: User = jwtDecode(response.token);
      const user = {
        id: decodedToken.id,
        unique_name: decodedToken.unique_name,
        display_name: decodedToken.display_name,
        photo: decodedToken.photo,
        city_id: decodedToken.city_id,
      };

      return { ...response, user };
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue('No response from server. Check network and API server status.');
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Async thunk for registration
export const register = createAsyncThunk(
  'auth/register',
  async (userInfo: UserCreateDtoInput, { rejectWithValue }) => {
    try {
      const response = await registerApi(userInfo);
      return response;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue('No response from server. Check network and API server status.');
      } else {
        return rejectWithValue(error.message);
      }
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
      state.refreshToken = null;
      state.isAuthenticated = false;
      storage.deleteItem('token');
      storage.deleteItem('refreshToken');
    },
    setToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      // You might want to decode the token here as well to populate the user
      const decodedToken: User = jwtDecode(action.payload.token);
      state.user = {
        id: decodedToken.id,
        unique_name: decodedToken.unique_name,
        display_name: decodedToken.display_name,
        photo: decodedToken.photo,
        city_id: decodedToken.city_id,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, setToken } = authSlice.actions;

export default authSlice.reducer;
