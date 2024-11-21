import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Message from './types'; 

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages', 
  async (id: string) => {
    const token = sessionStorage.getItem('token'); 
    
    const response = await fetch(`/api/messages?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': `Bearer ${token}`, 
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return await response.json(); 
  }
);

interface MessagesState {
  data: Message[]; 
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
  error: string | null; 
}

const initialState: MessagesState = {
  data: [], 
  status: 'idle', 
  error: null, 
};

const messagesSlice = createSlice({
  name: 'messages', 
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.status = 'succeeded'; 
        state.data = action.payload; 
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.error.message || 'Something went wrong'; 
      });
  },
});

export default messagesSlice.reducer;
