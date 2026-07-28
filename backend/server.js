require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174",
];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        if (origin && origin.endsWith(".netlify.app")) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

const studentRoutes = require('./routes/student');
const authRoutes = require("./routes/auth");
const feedbackRoutes = require("./routes/feedback");
const leaveRoutes = require("./routes/leave");
const roomRoutes = require("./routes/room");
const allocationRoutes = require('./routes/allocation');
const rulesRoutes = require('./routes/rules'); 
const menuRoutes = require("./routes/menu"); 
const announcementRoutes = require("./routes/announcements");

app.use('/api/student', studentRoutes); 
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/allocation", allocationRoutes);
app.use('/api/rules', rulesRoutes);
app.use("/api/menu", menuRoutes); 
app.use("/api/announcements", announcementRoutes);

app.get("/", (req, res) => res.send("Backend Running"));

app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));