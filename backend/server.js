import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import vehicleRoutes from "./src/routes/vehicleRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import newsRoutes from "./src/routes/newsRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
// Controllers
import { handleSepayWebhook } from "./src/controllers/paymentController.js"; 
import { autoCancelExpiredBookings } from './src/controllers/bookingController.js';

const app = express();

// Kết nối Database
connectDB();

// Middlewares
app.use(cors({
    origin: [
        'https://ford-admin-mu.vercel.app', 
        'http://localhost:3000',
        'http://localhost:8081',
        /\.vercel\.app$/ 
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
    credentials: true 
}));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/api/chat', aiRoutes);
// --- WEBHOOK SEPAY ---
app.post("/api/sepay-webhook", handleSepayWebhook);

// --- CÁC API ROUTES ---
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/bookings", bookingRoutes); 
app.use('/api/news', newsRoutes);
app.use('/api/ai-chat', aiRoutes);
// --- TỰ ĐỘNG HÓA ---
setInterval(autoCancelExpiredBookings, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`🤖 AI Chat API: http://localhost:${PORT}/api/ai-chat`);
});