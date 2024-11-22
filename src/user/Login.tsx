import {useEffect, useState} from "react";
import {loginUser} from "./loginApi";
import {Session} from "../model/common";
import {CustomError} from "../model/CustomError";
import { TextField, Button, Typography, Box, Snackbar } from '@mui/material';
import { useHistory } from "react-router-dom";
import { Client, TokenProvider } from '@pusher/push-notifications-web';
export function Login() {

  const script = document.createElement('script');
script.src = 'https://js.pusher.com/beams/1.0/push-notifications-cdn.js';
document.head.appendChild(script);

    const navigate = useHistory()
    const [error, setError] = useState({} as CustomError);
    const [session, setSession] = useState({} as Session);
    const [openError, setOpenError] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        loginUser({user_id: -1, username:  data.get('login') as string, password: data.get('password') as string},
            (result: Session) => {
                console.log(result);
                setSession(result);
                form.reset();
                setError(new CustomError(""));
            }, (loginError: CustomError) => {
                console.log(loginError);
                setError(loginError);
                setSession({} as Session);
            });

            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                const beamsClient = new Client({
                  instanceId: '240dc048-764d-4e06-b419-98c933b6b851',
                });
                const beamsTokenProvider = new TokenProvider({
                  url: "/api/beams",
                  headers: {
                      Authentication: "Bearer " + sessionStorage.getItem('token'), 
                  },
              });
              
              beamsClient.start()
                  .then(() => beamsClient.addDeviceInterest('global'))
                  .then(() => beamsClient.setUserId(sessionStorage.getItem('externalid') || '', beamsTokenProvider))
                  .then(() => {
                      beamsClient.getDeviceId().then(deviceId => console.log("Push id : " + deviceId));
                  })
                  .catch(console.error);
            
               
     } });
    };
    useEffect(() => {
      if (session.token) {
        navigate.push('/listUser');  // Navigate to the 'listUser' route when token exists
      }
    }, [session.token, navigate]);

    

    return (
      <>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f4f7fc',
          fontFamily: 'Arial, sans-serif',
        }}
      >      <h1>Login</h1>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            background: '#fff',
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          <TextField
            label="Login"
            name="login"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ width: '100%', mt: 2 }}
          >
            Connexion
          </Button>
        </Box>
  
        
  
        {error.message && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error.message}
          </Typography>
        )}
  
        <Snackbar
          open={openError}
          autoHideDuration={6000}
          onClose={() => setOpenError(false)}
          message={error.message}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </Box>
      </>
    );
}