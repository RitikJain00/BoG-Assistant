import { Box, Typography, Button } from '@mui/material'; // MUI components for UI styling
import React from 'react';
import CustomizedInput from '../components/shared/CustomizedInput'; // Custom input component
import { IoIosLogIn } from "react-icons/io"; // Login icon from react-icons
import { toast } from 'react-hot-toast'; // Toast notifications for user feedback
import { useAuth } from '../context/AuthContext'; // Authentication context for login

const Login = () => {
    const auth = useAuth(); // Getting authentication methods from context

    // Function to handle form submission for login
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent page reload
        const formData = new FormData(e.currentTarget); // Extract form data
        const email = formData.get('email') as string; // Get email input
        const password = formData.get('password') as string; // Get password input

        try {
            toast.loading("Signing In", { id: "login" }); // Show loading toast
            await auth?.login(email, password); // Call login function from AuthContext
            toast.success("logged In", { id: "login" }); // Show success message
        } catch (error) {
            console.log(error);
            toast.error("log-in Failed", { id: "login" }); // Show error message
        }

        console.log(email, password); // Debugging log
    };

    return (
        <Box width={"100%"} height={"100%"} display="flex" flex={1}>
            {/* Left Section - MNNIT Logo (Visible on medium and larger screens) */}
            <Box padding={8} mt={8} display={{ md: "flex", sm: "none", xs: "none" }}>
                <img 
                    src="MNNIT_Logo.png" 
                    alt="MNNIT" 
                    style={{ width: '400px' }} 
                />
            </Box>

            {/* Right Section - Login Form */}
            <Box 
                display={'flex'} 
                flex={{ xs: 1, md: 0.5 }} 
                justifyContent={'center'} 
                alignItems={"center"} 
                padding={2} 
                ml={"auto"} 
                mt={16}
            >
                <form 
                    onSubmit={handleSubmit} 
                    style={{
                        margin: 'auto', 
                        padding: '30px', 
                        boxShadow: "10px 10px 20px #000",
                        borderRadius: "10px", 
                        border: "none"
                    }}
                >
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center'
                        }}
                    >
                        {/* Login Header */}
                        <Typography 
                            variant="h4" 
                            textAlign="center" 
                            padding={2} 
                            fontWeight={600}
                        >
                            Login
                        </Typography>

                        {/* Input Fields */}
                        <CustomizedInput type="email" name='email' label="Email" />
                        <CustomizedInput type='password' name='password' label='Password' />

                        {/* Login Button */}
                        <Button 
                            type='submit' 
                            sx={{
                                px: 2, 
                                py: 1, 
                                mt: 2, 
                                width: '400px', 
                                borderRadius: '5', 
                                bgcolor: '#00fffc',
                                ":hover": { bgcolor: 'white', color: 'black' }
                            }} 
                            endIcon={<IoIosLogIn />}
                        >
                            Login
                        </Button>
                    </Box> 
                </form>
            </Box>
        </Box>
    );
};

export default Login;
