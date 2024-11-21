import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import  { MessageRoom } from './types'; 

export const fetchRoomMessages = createAsyncThunk(
  'roomMessages/fetchRoomMessages', 
  async (id: string) => {
    const token = sessionStorage.getItem('token'); 
    
    const response = await fetch(`/api/roomsmessages?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authentication': `Bearer ${token}`, 
      }
    });

    // Consommer la réponse une seule fois et récupérer les données
    const data = await response.json();

    if (!response.ok) {
      // Si la réponse n'est pas OK, on utilise la variable data pour l'erreur
      throw new Error(data.message || 'Failed to fetch Rooms');
    }

    // Retourner les données de la réponse
    console.log("Response Room Message:", data);
    return data;
  }
);

interface MessageRoomsState {
  data: MessageRoom[]; 
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
  error: string | null; 
}

const initialState: MessageRoomsState = {
  data: [], 
  status: 'idle', 
  error: null, 
};

const roomMessagesSlice = createSlice({
  name: 'roomMessages', 
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomMessages.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action: PayloadAction<MessageRoom[]>) => {
        state.status = 'succeeded'; 
        state.data = action.payload; 
      })
      .addCase(fetchRoomMessages.rejected, (state, action) => {
        state.status = 'failed'; 
        state.error = action.error.message || 'Something went wrong'; 
      });
  },
});

export default roomMessagesSlice.reducer;
