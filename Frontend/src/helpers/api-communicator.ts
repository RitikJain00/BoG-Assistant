import axios from 'axios';

// Function to login user
export const loginUser = async (email: string, password: string) => {
    try {
        const { data } = await axios.post('/user/login', { email, password });
        return data;
    } catch (error) {
        throw new Error("Unable to login");
    }
};

// Function to signup user
export const signupUser = async (name: string, email: string, password: string) => {
    try {
        const { data } = await axios.post('/user/signup', { name, email, password });
        return data;
    } catch (error) {
        throw new Error("Unable to Signup");
    }
};

// Function to check authentication status
export const checkAuthStatus = async () => {
    try {
        const { data } = await axios.get('/user/auth-status');
        return data;
    } catch (error) {
        throw new Error("Unable to authenticate");
    }
};

// Function to send a chat message
export const sendChatRequest = async (message: string) => {
    try {
        const { data } = await axios.post('/chat/new', { message });
        return data;
    } catch (error) {
        throw new Error("Unable to send chat");
    }
};

// Function to fetch user chats
export const getUserChats = async () => {
    try {
        const { data } = await axios.get('/chat/all-chats');
        return data;
    } catch (error) {
        throw new Error("Unable to fetch chats");
    }
};

// Function to delete user chats
export const deleteUserChats = async () => {
    try {
        const { data } = await axios.delete('/chat/delete');
        return data;
    } catch (error) {
        throw new Error("Unable to delete chats");
    }
};
