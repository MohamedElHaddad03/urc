import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './usersSlice'
import messagesReducer from './messagesSlice'
import roomsReducer from "./roomsSlice";
import  roomMessagesReducer  from "./messagesRoomsSlice";
import { useDispatch } from 'react-redux';



export const store = configureStore({
  reducer: {
   // counter: counterReducer,
    users :  usersReducer,
    messages : messagesReducer,
    rooms : roomsReducer,
    roomMessages: roomMessagesReducer,

  },
});

export  type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
