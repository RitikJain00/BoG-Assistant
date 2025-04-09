import { Box, Typography, Button } from '@mui/material'; // MUI components for styling
import React from 'react';
import CustomizedInput from '../components/shared/CustomizedInput'; // Custom input field component
import { IoIosLogIn } from "react-icons/io"; // Login icon from react-icons
import { toast } from 'react-hot-toast'; // Toast notifications for user feedback
import { useAuth } from '../context/AuthContext'; // Authentication context

const Signup = () => {
    const auth = useAuth(); // Access authentication functions from context

    // Function to handle signup form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent page reload
        const formData = new FormData(e.currentTarget); // Extract form data

        const name = formData.get('name') as string; // Get name input
        const email = formData.get('email') as string; // Get email input
        const password = formData.get('password') as string; // Get password input

        try {
            toast.loading("Signing up", { id: "signup" }); // Show loading toast
            await auth?.signup(name, email, password); // Call signup function from AuthContext
            toast.success("Signed Up", { id: "signup" }); // Show success message
        } catch (error) {
            console.log(error);
            toast.error("Signup Failed", { id: "signup" }); // Show error message
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

            {/* Right Section - Signup Form */}
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
                        {/* Signup Header */}
                        <Typography 
                            variant="h4" 
                            textAlign="center" 
                            padding={2} 
                            fontWeight={600}
                            color=" rgb(65, 134, 161)"
                        >
                            Sign-Up
                        </Typography>

                        {/* Input Fields */}
                        <CustomizedInput type="text" name='name' label="Name" />
                        <CustomizedInput type="email" name='email' label="Email" />
                        <CustomizedInput type='password' name='password' label='Password' />

                        {/* Signup Button */}
                        <Button 
                            type='submit' 
                            sx={{
                                px: 2, 
                                py: 1, 
                                mt: 2, 
                                width: '400px', 
                                borderRadius: '5', 
                                bgcolor: ' rgb(128, 206, 236)',
                                ":hover": { bgcolor: ' rgb(65, 134, 161)', color: 'white' }
                            }} 
                            endIcon={<IoIosLogIn />}
                        >
                            Sign-up
                        </Button>
                    </Box> 
                </form>
            </Box>
        </Box>
    );
};

export default Signup;
