import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import  { Room } from './types'; 

export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms', 
  async () => {
    const token = sessionStorage.getItem('token'); 
    
    const response = await fetch('/api/rooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch rooms');
    }

    return await response.json(); 
  }
);

interface roomsState {
  data: Room[]; 
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
  error: string | null; 
}

const initialState: roomsState = {
  data: [], 
  status: 'idle', 
  error: null, 
};

const roomsSlice = createSlice({
  name: 'rooms', 
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchRooms.fulfilled, (state, action: PayloadAction<Room[]>) => {
        state.status = 'succeeded'; 
        state.data = action.payload; 
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.error.message || 'Something went wrong'; 
      });
  },
});

export default roomsSlice.reducer;
