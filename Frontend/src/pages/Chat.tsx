import { Avatar, Box, Typography, Button, IconButton } from '@mui/material'; // MUI components for UI
import React, { useRef, useState } from 'react'; // React hooks for component logic
import { useAuth } from '../context/AuthContext'; // Authentication context to manage user state
import { red } from '@mui/material/colors'; // Importing MUI color for styling
import Chatitem from '../components/chat/Chatitem'; // Chat item component to display messages
import { IoMdSend } from 'react-icons/io'; // Importing send icon from react-icons
import toast from 'react-hot-toast'; // Toast notifications for feedback

// Type definition for a chat message
type Message = {
    role: "user" | "assistant"; // Role can be either user or assistant
    content: string; // Message content as a string
};

// Predefined responses for the assistant
const predefinedResponses: { [key: string]: string } = {
    "hello": "Hi there! How can I assist you today?",
    "how are you": "I'm just a chatbot, but thanks for asking!",
    "what is your name": "I'm MNNIT Chatbot, here to help you!",
    "bye": "Goodbye! Have a great day!",
    "help": "Sure! Let me know what you need help with."
};

// Function to get a predefined response based on the user's message
const getBotResponse = (message: string): string => {
    const lowerCaseMessage = message.toLowerCase();
    return predefinedResponses[lowerCaseMessage] || "I'm not sure how to respond to that.";
};

const Chat = () => {
    const inputRef = useRef<HTMLInputElement | null>(null); // Ref for input field
    const auth = useAuth(); // Getting authentication details from AuthContext
    const [chatMessages, setChatMessages] = useState<Message[]>([]); // State for storing chat messages

    // Function to handle sending messages
    const handleSubmit = async () => {
        const content = inputRef.current?.value as string; // Getting input value

        if (!content.trim()) return; // Ignore empty messages

        // Clearing input field after sending
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        // Creating a new user message object
        const newMessage: Message = { role: "user", content };

        // Adding the new message to chat state
        setChatMessages((prev) => [...prev, newMessage]);

        // Get assistant response from predefined answers
        const response = getBotResponse(content);

        // Add assistant response to chat
        setTimeout(() => {
            setChatMessages((prev) => [...prev, { content: response, role: "assistant" }]);
        }, 500);
    };

    // Function to handle deleting chat history
    const handleDeleteChats = async () => {
        try {
            toast.loading("Deleting Chats", { id: "deletechats" });
            // await deleteUserChats(); // API call to delete user chats (commented out)
            setChatMessages([]); // Clearing chat messages from state
            toast.success("Deleted Chats", { id: "deletechats" });
        } catch (error) {
            console.log(error);
            toast.error("Deletion failed", { id: "deletechats" });
        }
    };

    return (
        <Box sx={{ display: 'flex', flex: 1, width: '100%', height: '100%', mt: 3, gap: 3 }}>
            {/* Sidebar (Visible only on larger screens) */}
            <Box sx={{ display: { md: 'flex', xs: 'none', sm: 'none' }, flex: 0.2, flexDirection: 'column', borderColor:'black' }}>
                <Box sx={{ display: 'flex', width: '100%', height: '60vh', bgcolor: "rgb(244, 247, 249)", borderRadius: 5, flexDirection: 'column', mx: 3 }}>
                    {/* Avatar displaying user initials */}
                    <Avatar sx={{ mx: 'auto', my: 2, backgroundColor:"skyblue",color:"black", fontWeight: 700 }}>
                        {auth?.User?.name[0]}       
                        {auth?.User?.name.split(" ")[1][0]}
                    </Avatar>
                    <Typography sx={{ mx: 'auto', fontFamily: 'work sans',color:"black" }}> I am MNNIT Chatbot </Typography>
                    <Typography sx={{ mx: 'auto', fontFamily: 'work sans',color:"black", my: 4, p: 3 }}>
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
                <Typography sx={{ textAlign: 'center', fontSize: '40px', color: ' rgb(65, 134, 161)', mb: 2, mx: 'auto', fontWeight: 600 }}>
                    MNNIT - Prayagraj
                </Typography>

                {/* Chat messages container */}
                <Box 
                    sx={{
                        width: "100%", height: "60vh", borderRadius: 3, mx: 'auto',
                        display: 'flex', flexDirection: 'column',gap:2,overflowy:'auto',
                        overflowX: 'hidden', overflowY: 'auto', scrollBehavior: 'smooth'
                    }}>
                    {chatMessages.map((chat, index) => (
                        <Chatitem content={chat.content} role={chat.role} key={index} />
                    ))}
                </Box>

                {/* Input field and send button */}
                <div 
                    style={{
                        width: "100%", borderRadius: 8, backgroundColor: "rgb(251, 252, 252)",
                        display: 'flex', margin: 'auto', borderColor:'black'
                    }}>
                    <input
                        ref={inputRef}
                        type="text"
                        style={{
                            width: "100%", backgroundColor: "transparent",
                            padding: '30px',borderRadius: 8,border: "none",outline: "none",
                            color: "black", fontSize: '20px'
                        }}
                    />
                    <IconButton onClick={handleSubmit} sx={{ ml: "auto", color: "rgb(65, 134, 161)", mx: 1 }}>
                        <IoMdSend /> {/* Send icon */}
                    </IconButton>
                </div>
            </Box>
        </Box>
    );
};

export default Chat;
