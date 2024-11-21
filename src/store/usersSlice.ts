import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import User from './types'; 

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers', 
  async () => {
    const token = sessionStorage.getItem('token'); 
    
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return await response.json(); 
  }
);

interface UsersState {
  data: User[]; 
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
  error: string | null; 
}

const initialState: UsersState = {
  data: [], 
  status: 'idle', 
  error: null, 
};

const usersSlice = createSlice({
  name: 'users', 
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded'; 
        state.data = action.payload; 
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.error.message || 'Something went wrong'; 
      });
  },
});

export default usersSlice.reducer;
