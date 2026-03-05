import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

// ── Lazy Razorpay instance — created on first request, after dotenv is loaded ─
let _razorpay = null;
function getRazorpay() {
    if (!_razorpay) {
        _razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _razorpay;
}

// ── POST /api/payment/create-order ───────────────────────────────────────────
// Creates a Razorpay order and returns the order_id to the frontend.
// The frontend uses order_id to open the Razorpay checkout modal.
router.post("/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", receipt, notes = {} } = req.body;

        // Validate required fields
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount. Must be a positive number (in paise).",
            });
        }

        if (!receipt) {
            return res.status(400).json({
                success: false,
                message: "Receipt ID is required.",
            });
        }

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const options = {
            amount: Math.round(amount), // already in paise from frontend
            currency,
            receipt,
            notes,
        };

        const order = await getRazorpay().orders.create(options);

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
            },
        });
    } catch (error) {
        console.error("[create-order] Razorpay error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order.",
            error: error.message,
        });
    }
});

// ── POST /api/payment/verify ─────────────────────────────────────────────────
// Verifies Razorpay payment using HMAC-SHA256 signature.
// This is the critical security step — NEVER skip this on the server.
//
// Razorpay-generated signature formula:
//   HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
router.post("/verify", (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // Validate all three fields are present
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification fields.",
            });
        }

        // Build the expected signature using HMAC-SHA256
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        // Constant-time comparison to prevent timing attacks.
        // timingSafeEqual requires both buffers to be the same byte length.
        // If the submitted signature is not a valid 64-char hex string, treat as invalid.
        let isValid = false;
        try {
            const expectedBuf = Buffer.from(expectedSignature, "hex");
            const receivedBuf = Buffer.from(razorpay_signature, "hex");
            if (expectedBuf.length === receivedBuf.length) {
                isValid = crypto.timingSafeEqual(expectedBuf, receivedBuf);
            }
        } catch (_) {
            // Invalid hex — isValid stays false
        }

        if (!isValid) {
            console.warn("[verify] Signature mismatch for order:", razorpay_order_id);
            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Invalid signature.",
            });
        }

        // ✅ Payment is genuine
        // TODO: In production — update your database order status here:
        //   await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: "paid", paymentId: razorpay_payment_id })

        console.log("[verify] Payment verified successfully:", razorpay_payment_id);
        res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            payment: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
            },
        });
    } catch (error) {
        console.error("[verify] Error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed due to server error.",
            error: error.message,
        });
    }
});

export default router;
