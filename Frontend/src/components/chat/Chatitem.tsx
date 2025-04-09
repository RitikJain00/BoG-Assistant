import { Box, Avatar, Typography } from '@mui/material';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Chatitem = ({ content, role }: { content: string; role: 'user' | 'assistant' }) => {
    const auth = useAuth();

    return role === 'assistant' ? (
        // Assistant's message (icon on left)
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
            <Avatar sx={{ width: 30, height: 30 }}>
                <img src="openai.png" width="30px" alt="AI" />
            </Avatar>
            <Box
                sx={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    backgroundColor: '#f1f0f0', // Light gray background
                    borderTopLeftRadius: '0px',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
                }}
            >
                <Typography fontSize="16px" color="black">{content}</Typography>
            </Box>
        </Box>
    ) : (
        // User's message (icon on right)
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, my: 1 }}>
            <Box
                sx={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    backgroundColor: 'white', // White background for user
                    borderTopRightRadius: '0px',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
                }}
            >
                <Typography fontSize="16px" color="black">{content}</Typography> {/* Set text color to black */}
            </Box>
            <Avatar sx={{ width: 30, height: 30, bgcolor: 'black', color: 'white' }}>
                {auth?.User?.name[0]}
                {auth?.User?.name.split(' ')[1]?.[0] || ''}
            </Avatar>
        </Box>
    );
};

export default Chatitem;
