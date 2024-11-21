import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchGenerationDetail = createAsyncThunk(
  'generationDetail/fetchGenerationDetail',
  async (id) => {

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/generation/${id}`); 
      return response.data;  
    } catch (error) {
      throw Error(error.response ? error.response.data : error.message); 
    }
  }
);

const generationDetailSlice = createSlice({
  name: 'generationDetail',
  initialState: {
    detail: [],  
    status: 'idle',
    error: null,   
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGenerationDetail.pending, (state) => {
        state.status = 'loading';  
      })
      .addCase(fetchGenerationDetail.fulfilled, (state, action) => {
        state.status = 'succeeded';  
        state.detail = action.payload;
      })
      .addCase(fetchGenerationDetail.rejected, (state, action) => {
        state.status = 'failed';  
        state.error = action.error.message;
      });
  },
});

export default generationDetailSlice.reducer;
