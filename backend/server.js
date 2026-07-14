require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware - MASTER CORS FIX
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 2. Route Imports
const studentRoutes = require('./routes/student');
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const leaveRoutes = require("./routes/leave");
const roomRoutes = require("./routes/room");
const allocationRoutes = require('./routes/allocation');
const rulesRoutes = require('./routes/rules'); // Path FIXED here (from ./rules/rules to ./routes/rules)
const menuRoutes = require("./routes/menu"); 

// 3. Mounting
app.use('/api/student', studentRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/allocation", allocationRoutes);
app.use('/api/rules', rulesRoutes);
app.use("/api/menu", menuRoutes); 

// Default Route
app.get("/", (req, res) => res.send("Backend Running"));

// 4. Global Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
});

// Port binding fix for Render
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));