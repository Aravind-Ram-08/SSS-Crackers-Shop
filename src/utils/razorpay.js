/**
 * useRazorpay — Custom React hook for Razorpay payment integration
 *
 * Flow:
 *  1. Dynamically loads the Razorpay checkout.js SDK script
 *  2. Calls our backend POST /api/payment/create-order → gets order_id
 *  3. Opens the Razorpay payment modal with order details
 *  4. On payment success, sends payment details to POST /api/payment/verify
 *  5. Returns { success, paymentId } or throws on failure
 */

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
        document.head.appendChild(script);
    });
}

/**
 * initRazorpayPayment
 *
 * @param {object} options
 * @param {number}  options.amountInPaise   - Total in paise (₹ × 100)
 * @param {string}  options.receipt         - Unique receipt ID (e.g. "order_123")
 * @param {object}  options.prefill         - { name, email, contact }
 * @param {object}  options.notes           - Arbitrary key-value notes
 * @param {string}  options.keyId           - Razorpay key_id from env
 * @param {function} options.onSuccess      - Called with { orderId, paymentId }
 * @param {function} options.onFailure      - Called with error message string
 */
export async function initRazorpayPayment({
    amountInPaise,
    receipt,
    prefill = {},
    notes = {},
    keyId,
    onSuccess,
    onFailure,
}) {
    try {
        // ── Step 1: Load SDK ──────────────────────────────────────────────────
        await loadRazorpayScript();

        // ── Step 2: Create order on our backend ──────────────────────────────
        const createRes = await fetch(`${API_BASE}/api/payment/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: "INR",
                receipt,
                notes,
            }),
        });

        const createData = await createRes.json();

        if (!createRes.ok || !createData.success) {
            throw new Error(createData.message || "Failed to create payment order.");
        }

        const { order } = createData;

        // ── Step 3: Open Razorpay modal ───────────────────────────────────────
        return new Promise((resolve, reject) => {
            const options = {
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: "SSS Crackers",
                description: "Premium Crackers for Your Celebration 🧨",
                image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧨</text></svg>",
                order_id: order.id,
                prefill: {
                    name: prefill.name || "",
                    email: prefill.email || "",
                    contact: prefill.contact || "",
                },
                notes,
                theme: {
                    color: "#ff6a00",
                    backdrop_color: "rgba(11,11,26,0.75)",
                    hide_topbar: false,
                },
                modal: {
                    confirm_close: true,
                    animation: true,
                    ondismiss: () => {
                        onFailure?.("Payment cancelled by user.");
                        reject(new Error("Payment cancelled."));
                    },
                },
                // ── Step 4: On payment success → verify on backend ───────────
                handler: async (response) => {
                    try {
                        const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            const result = {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                            };
                            onSuccess?.(result);
                            resolve(result);
                        } else {
                            throw new Error(verifyData.message || "Payment verification failed.");
                        }
                    } catch (err) {
                        onFailure?.(err.message);
                        reject(err);
                    }
                },
            };

            const rzp = new window.Razorpay(options);

            // Handle modal dismiss / payment errors from Razorpay side
            rzp.on("payment.failed", (response) => {
                const msg = response.error?.description || "Payment failed.";
                onFailure?.(msg);
                reject(new Error(msg));
            });

            rzp.open();
        });
    } catch (err) {
        onFailure?.(err.message);
        throw err;
    }
}
