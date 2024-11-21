import { useState } from "react";
import { signupUser } from "./signupApi";  
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import { TextField, Button, Typography, Box, Snackbar, CircularProgress } from '@mui/material';

export function Signup() {
    const [error, setError] = useState<CustomError>({} as CustomError);
    const [session, setSession] = useState<Session>({} as Session);
    const [openError, setOpenError] = useState(false);
    const [loading, setLoading] = useState(false); 
    const [email, setEmail] = useState('');
    const [errorMail, setErrorMail] = useState('');

    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const emailValue = event.target.value;
      setEmail(emailValue);
      setErrorMail(emailRegex.test(emailValue)? '':"Email Invalid");  
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);
        const username = data.get('login') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!username || !email || !password) {
            setError(new CustomError("All fields are required"));
            setOpenError(true);
            return;
        }

        setLoading(true);  

        signupUser(
            { user_id: -1, username, email, password },
            (result: Session) => {
                console.log(result);
                setSession(result);
                form.reset();  
                setError(new CustomError(""));  
                setLoading(false);  
            },
            (loginError: CustomError) => {
                console.log(loginError);
                setError(loginError);
                setSession({} as Session);
                setLoading(false);  
                setOpenError(true);  
            }
        );
    };

    return (
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
        >
            <Typography variant="h4" gutterBottom>Sign Up</Typography>

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
                    label="Username"
                    name="login"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    onChange={handleEmailChange}
                    helperText={errorMail ? "Please enter a valid email address" : ""}
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
                    disabled={loading}  
                >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Sign Up"}  
                </Button>
            </Box>

            {session.token && (
                <Typography variant="body2" sx={{ mt: 3 }}>
                    {session.username} : {session.token}
                </Typography>
            )}

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
    );
}
