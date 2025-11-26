// server.js
const express = require("express");
const app = express();
const PORT = 5500;

// Serve static files (index.html, chatbot.js, etc.)
app.use(express.static(__dirname));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Chatbot running at: http://localhost:${PORT}`);
});