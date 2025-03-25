import { Box, Avatar, Typography } from "@mui/material";
import React from "react";
import { useAuth } from "../../context/AuthContext";

// Define the type for role (can be reused)
type RoleType = "user" | "assistant";

const ChatItem = ({ content, role }: { content: string; role: RoleType }) => {
  const auth = useAuth();
  
  // Extract user initials safely
  const userName = auth?.User?.name || "User";
  const nameParts = userName.split(" ");
  const initials = nameParts[0][0] + (nameParts[1]?.[0] || ""); // Avoids errors if no last name

  return role === "assistant" ? (
    <Box sx={{ display: "flex", p: 2, bgcolor: "#004d5612", my: 2, gap: 3, borderRadius: 2 }}>
      <Avatar sx={{ ml: "0" }}>
        <img src="openai.png" width={"30px"} alt="OpenAI Logo" />
      </Avatar>
      <Box>
        <Typography fontSize={"20px"}>{content}</Typography>
      </Box>
    </Box>
  ) : (
    <Box sx={{ display: "flex", p: 2, bgcolor: "#004d56", gap: 3, borderRadius: 2 }}>
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {initials.toUpperCase()} 
      </Avatar>
      <Box>
        <Typography fontSize={"20px"}>{content}</Typography>
      </Box>
    </Box>
  );
};

export default ChatItem;
