import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';  
import {  useSelector } from 'react-redux';
import { Room, RootState } from '../store/types';  
import { fetchRooms } from '../store/roomsSlice';
import { useAppDispatch } from '../store/store';
import { Typography, List,  CircularProgress, Alert, Box } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { format } from 'date-fns';



const RoomsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useHistory();  

  const rooms = useSelector((state: RootState) => state.rooms.data);
  const status = useSelector((state: RootState) => state.rooms.status);
  const error = useSelector((state: RootState) => state.rooms.error);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleSelectroom = (room: Room) => {
    dispatch({ type: 'SET_SELECTED_ROOM', payload: room });
    navigate.push(`/conversation/room/${room.room_id}`);  
    sessionStorage.setItem("ContactroomName" , room.name)
    sessionStorage.setItem("ContactroomId" , room.room_id)
    window.location.reload();
  };


  return (
    <div>
      <Box sx={{ padding: 2 , overflowY : "auto"}}>
      <Typography variant="h4" gutterBottom>
        Liste des salons
      </Typography>

      {status === 'loading' && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          Erreur: {error}
        </Alert>
      )}

       
<List>
  {rooms.length > 0 && status !== 'loading' ? (
    rooms.map((room) => {
      const createdOn = room.created_on ? new Date(room.created_on) : null;
      const formattedDate = createdOn && !isNaN(createdOn.getTime()) 
        ? format(createdOn, 'dd/MM/yyyy') 
        : 'Date invalide';  // Fallback text if the date is invalid or undefined

      return (
        <ListItem
          key={room.room_id}
          onClick={() => handleSelectroom(room)}
          sx={{
            borderBottom: '1px solid #ddd',
            '&:hover': { backgroundColor: '#f4f4f4' },
          }}
        >
          <Typography variant="body1">
          </Typography>

          <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {room.name} </Typography>

<Typography variant="body1" sx={{ fontWeight: 300, color: 'grey', marginTop: 5 }}>
 Créé le : {formattedDate}
</Typography>
        </ListItem>
      );
    })
  ) : (
    <Typography variant="h6" color="textSecondary">
      Aucun salon trouvé
    </Typography>
  )}
</List>


      
      
      
    </Box>
    </div>
  );
};

export default RoomsList;
