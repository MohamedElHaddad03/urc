import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';  // Keep useHistory for React Router v5
import { useSelector } from 'react-redux';
import User, { RootState } from '../store/types';
import { fetchUsers } from '../store/usersSlice';
import { useAppDispatch } from '../store/store';
import { Typography, List, CircularProgress, Alert, Box, Button } from '@mui/material';
import ListItem from '@mui/material/ListItem';

import RoomsList from './ListRooms';
import { logOut } from '../user/loginApi';
import { CustomError } from '../model/CustomError';

const UsersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useHistory();  // useHistory for React Router v5

  const users = useSelector((state: RootState) => state.users.data);
  const status = useSelector((state: RootState) => state.users.status);
  const error = useSelector((state: RootState) => state.users.error);
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSelectUser = (user: User) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
    navigate.push(`/conversation/user/${user.user_id}`);  // use .push() with useHistory()
    sessionStorage.setItem("ContactUserName", user.username);
    sessionStorage.setItem("ContactUserId", user.user_id);
  };

  const handleLogout = () => {
    logOut((error) => {
      console.error("Logout error:", error.message);  // Log error message
      alert("There was an issue logging out. Please try again.");  // Show error alert
    });
    navigate.push("/login");
  };

  return (
    <div>
      <Box sx={{ padding: 3, backgroundColor: '#fafafa', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ marginBottom: 2 }}>
          Liste des utilisateurs
          <Button 
          style={{"right":"0"}}
            variant="contained" 
            color="secondary" 
            onClick={handleLogout} 
            sx={{ padding: '6px 16px', borderRadius: 2 }}
          >
            LogOut
          </Button>
        </Typography>
        
        

        {status === 'loading' && (
          <Box display="flex" justifyContent="center" sx={{ marginBottom: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            Erreur: {error}
          </Alert>
        )}

        <List>
          {users.length > 0 && status !== 'loading' ? (
            users
              .filter((user) => user.username !== username)
              .map((user) => (
                <ListItem
                  key={user.user_id}
                  onClick={() => handleSelectUser(user)}
                  sx={{
                    borderBottom: '1px solid #ddd',
                    '&:hover': { backgroundColor: '#f4f4f4', cursor: 'pointer' },
                    padding: '10px 15px',
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
      
      <RoomsList />
    </div>
  );
};

export default UsersList;
