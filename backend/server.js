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
import chatRoutes from "./src/routes/chatRoutes.js";

import { initIntents } from "./ai/intentEngine.js";
import { buildBrain } from "./ai/brainLayer.js";
import { loadBrainToIndex } from "./ai/brainStore.js";

import { handleSepayWebhook } from "./src/controllers/paymentController.js";
import { autoCancelExpiredBookings } from "./src/controllers/bookingController.js";

const app = express();

// ===================== DB =====================
await connectDB();

// ===================== AI BOOTSTRAP (QUAN TRỌNG NHẤT) =====================
await initIntents();

console.log("🧠 Building AI Brain... (this may take a few seconds)");

const brain = await buildBrain();
loadBrainToIndex(brain);

console.log("🧠 AI Brain loaded:", brain.length);

// ===================== MIDDLEWARE =====================
app.use(cors({
    origin: [
        'https://ford-admin-mu.vercel.app',
        'http://localhost:3000',
        'http://localhost:8081',
        /\.vercel\.app$/
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===================== WEBHOOK =====================
app.post("/api/sepay-webhook", handleSepayWebhook);

// ===================== ROUTES =====================
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/ai", chatRoutes);

// ===================== AUTO JOB =====================
setInterval(autoCancelExpiredBookings, 60 * 60 * 1000);

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
    console.log(`🤖 AI Chat: /api/ai/chat`);
});