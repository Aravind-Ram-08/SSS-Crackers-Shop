import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRouter from "./routes/payment.js";

// ── Load environment variables ────────────────────────────────────────────────
dotenv.config();

// ── Validate required env vars at startup ────────────────────────────────────
const requiredEnv = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌  Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

// ── Create Express app ────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger (development) ─────────────────────────────────────────────
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.json({
        status: "ok",
        message: "SSS Crackers API is running 🧨",
        version: "1.0.0",
    });
});

app.get("/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Mount payment routes
app.use("/api/payment", paymentRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("[server error]", err);
    res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀  SSS Crackers backend running at http://localhost:${PORT}`);
    console.log(`   POST  /api/payment/create-order`);
    console.log(`   POST  /api/payment/verify\n`);
});
