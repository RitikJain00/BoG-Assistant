import { Avatar, Box, Typography, Button, IconButton } from '@mui/material'; // MUI components for UI
import React, { useLayoutEffect, useRef, useState } from 'react'; // React hooks for component logic
import { useAuth } from '../context/AuthContext'; // Authentication context to manage user state
import { red } from '@mui/material/colors'; // Importing MUI color for styling
import Logo from '../components/shared/Logo'; // Logo component (not used in this file)
import Chatitem from '../components/chat/Chatitem'; // Chat item component to display messages
import { IoMdSend } from 'react-icons/io'; // Importing send icon from react-icons
import { getUserChats, sendChatRequest, deleteUserChats } from '../helpers/api-communicator'; // API functions for chat operations
import toast from 'react-hot-toast'; // Toast notifications for feedback

// Type definition for a chat message
type Message = {
    role: "user" | "assistant"; // Role can be either user or assistant
    content: string; // Message content as a string
};

const Chat = () => {
    const inputRef = useRef<HTMLInputElement | null>(null); // Ref for input field
    const auth = useAuth(); // Getting authentication details from AuthContext
    const [chatMessages, setChatMessages] = useState<Message[]>([]); // State for storing chat messages

    // Function to handle sending messages
    const handleSubmit = async () => {
        const content = inputRef.current?.value as string; // Getting input value

        // Clearing input field after sending
        if (inputRef && inputRef.current) {
            inputRef.current.value = "";
        }

        // Creating a new user message object
        const newMessage: Message = { role: "user", content };

        // Adding the new message to chat state
        setChatMessages((prev) => [...prev, newMessage]);

        // Sending the message to backend and updating chat state
        const chatData = await sendChatRequest(content);
        setChatMessages([...chatData.chats]);
    };

    // Function to handle deleting chat history
    const handleDeleteChats = async () => {
        try {
            toast.loading("Deleting Chats", { id: "deletechats" });
            await deleteUserChats(); // API call to delete user chats
            setChatMessages([]); // Clearing chat messages from state
            toast.success("Deleted Chats", { id: "deletechats" });
        } catch (error) {
            console.log(error);
            toast.error("Deletion failed", { id: "deletechats" });
        }
    };

    // Fetching user chat history when component mounts and user is logged in
    useLayoutEffect(() => {
        if (auth?.isLoggedIn && auth.User) {
            toast.loading("Loading Chats", { id: "loadchats" });
            getUserChats()
                .then((data) => {
                    setChatMessages([...data.chats]);
                    toast.success("Chats Loaded", { id: "loadchats" });
                })
                .catch((error) => {
                    console.log(error);
                    toast.error("Unable to load chats", { id: "loadchats" });
                });
        }
    }, [auth]);

    return (
        <Box sx={{ display: 'flex', flex: 1, width: '100%', height: '100%', mt: 3, gap: 3 }}>
            {/* Sidebar (Visible only on larger screens) */}
            <Box sx={{ display: { md: 'flex', xs: 'none', sm: 'none' }, flex: 0.2, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', width: '100%', height: '60vh', bgcolor: "rgb(17,29,39)", borderRadius: 5, flexDirection: 'column', mx: 3 }}>
                    {/* Avatar displaying user initials */}
                    <Avatar sx={{ mx: 'auto', my: 2, bgcolor: 'white', color: 'black', fontWeight: 700 }}>
                        {auth?.User?.name[0]}       
                        {auth?.User?.name.split(" ")[1][0]}
                    </Avatar>
                    <Typography sx={{ mx: 'auto', fontFamily: 'work sans' }}> I am MNNIT Chatbot </Typography>
                    <Typography sx={{ mx: 'auto', fontFamily: 'work sans', my: 4, p: 3 }}>
                        You can know all about MNNIT, faculty, departments, programmes... <br />
                        Only students can log in
                    </Typography>
                    {/* Button to clear chat history */}
                    <Button 
                        onClick={handleDeleteChats}
                        sx={{
                            width: '200px', my: 'auto', color: 'white', fontWeight: '700', borderRadius: 3, mx: 'auto', bgcolor: red[300],
                            ":hover": { bgcolor: red[400] }
                        }}>
                        Clear Conversation
                    </Button>
                </Box>
            </Box>

            {/* Main Chat Window */}
            <Box sx={{ display: 'flex', flex: { md: 0.8, xs: 1, sm: 1 }, flexDirection: 'column', px: 3 }}>
                <Typography sx={{ textAlign: 'center', fontSize: '40px', color: 'white', mb: 2, mx: 'auto', fontWeight: 600 }}>
                    MNNIT - Prayagraj
                </Typography>

                {/* Chat messages container */}
                <Box 
                    sx={{
                        width: "100%", height: "60vh", borderRadius: 3, mx: 'auto',
                        display: 'flex', flexDirection: 'column', overflow: 'scroll',
                        overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth'
                    }}>
                    {chatMessages.map((chat, index) => (
                        // @ts-ignore -> Ignoring TypeScript warning for now
                        <Chatitem content={chat.content} role={chat.role} key={index} />
                    ))}
                </Box>

                {/* Input field and send button */}
                <div 
                    style={{
                        width: "100%", borderRadius: 8, backgroundColor: "rgb(17,27,39)",
                        display: 'flex', margin: 'auto'
                    }}>
                    {" "}
                    <input
                        ref={inputRef}
                        type="text"
                        style={{
                            width: "100%", backgroundColor: "transparent",
                            padding: '30px', border: 'none', outline: 'none',
                            color: 'white', fontSize: '20px'
                        }}
                    />
                    <IconButton onClick={handleSubmit} sx={{ ml: "auto", color: "white", mx: 1 }}>
                        <IoMdSend /> {/* Send icon */}
                    </IconButton>
                </div>
            </Box>
        </Box>
    );
};

export default Chat;
