import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';  
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/types';  
import  User  from '../store/types';  
import { fetchUsers } from '../store/usersSlice';
import { useAppDispatch } from '../store/store';
import { Typography, List,  CircularProgress, Alert, Box } from '@mui/material';
import ListItem from '@mui/material/ListItem';
const UsersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useHistory();  
  const [id,setId]=useState("");

  const users = useSelector((state: RootState) => state.users.data);
  const status = useSelector((state: RootState) => state.users.status);
  const error = useSelector((state: RootState) => state.users.error);
  const username= sessionStorage.getItem("username");
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSelectUser = (user: User) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
    navigate.push(`/conversation/user/${user.user_id}`);  
    sessionStorage.setItem("ContactUserName" , user.username)
    sessionStorage.setItem("ContactUserId" , user.user_id)
    window.location.reload();
  };


  return (
    <div>
      <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Liste des utilisateurs
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
        {users.length > 0 && status!== 'loading'? (
          users
            .filter((user) => user.username !== username) 
            .map((user) => (
              <ListItem
                key={user.user_id}
                onClick={() => handleSelectUser(user)}
                sx={{
                  borderBottom: '1px solid #ddd',
                  '&:hover': { backgroundColor: '#f4f4f4' },
                }}
              >
                <Typography variant="body1">
                  {user.username} - Dernière connexion: {user.last_login}
                </Typography>
              </ListItem>
            ))
        ) : (
          <Typography variant="h6" color="textSecondary">
            Aucun utilisateur trouvé
          </Typography>
        )}
      </List>
      
      
      
    </Box>
    </div>
  );
};

export default UsersList;
