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
import { autoCancelExpiredBookings } from "./src/controllers/bookingController.js";

const app = express();

// ================= MIDDLEWARE =================

app.use(cors({
  origin: [
    "https://ford-admin-mu.vercel.app",
    "http://localhost:3000",
    "http://localhost:8081",
    /\.vercel\.app$/,
  ],
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Bypass-Tunnel-Reminder",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({
  limit: "10mb",
  extended: true,
}));

// ================= WEBHOOK =================

app.post(
  "/api/sepay-webhook",
  handleSepayWebhook
);

// ================= ROUTES =================

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/users", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/ai", aiRoutes);
// ================= AUTO JOB =================

setInterval(
  autoCancelExpiredBookings,
  60 * 60 * 1000
);

// ================= START SERVER =================

const startServer = async () => {
  try {
    // DATABASE
    await connectDB();

    console.log("📦 MongoDB connected");

    // LOAD AI MODEL
    await loadEmbeddingModel();

    console.log("🧠 Embedding model loaded");

    // BUILD AI BRAIN
    await buildBrain();

    console.log("🧠 AI Brain ready");

    // START SERVER
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${PORT}`
      );

      console.log(
        `🤖 AI API: http://localhost:${PORT}/api/ai`
      );
    });

  } catch (err) {
    console.error(
      "💥 SERVER START ERROR:",
      err
    );

    process.exit(1);
  }
};

startServer();