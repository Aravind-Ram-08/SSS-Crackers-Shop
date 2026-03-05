/**
 * razorpay.js — STUB (Razorpay temporarily disabled)
 *
 * Razorpay payment is currently disabled for deployment.
 * Orders are placed as Cash on Delivery (COD).
 * Replace this file with the real integration when the backend is ready.
 */

/**
 * initRazorpayPayment — COD stub
 *
 * Simulates a successful payment immediately so the rest of the
 * checkout flow (invoice generation, order confirmation) works normally.
 */
export async function initRazorpayPayment({
    receipt,
    onSuccess,
    // eslint-disable-next-line no-unused-vars
    amountInPaise,
    // eslint-disable-next-line no-unused-vars
    prefill,
    // eslint-disable-next-line no-unused-vars
    notes,
    // eslint-disable-next-line no-unused-vars
    keyId,
    // eslint-disable-next-line no-unused-vars
    onFailure,
}) {
    // Simulate a tiny async delay (so UI spinner shows briefly)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = {
        orderId: `ORD-${receipt || Date.now()}`,
        paymentId: `COD-${Date.now()}`,
        razorpay_order_id: `ORD-${receipt || Date.now()}`,
        razorpay_payment_id: `COD-${Date.now()}`,
        razorpay_signature: "cod-stub-signature",
    };

    onSuccess?.(result);
    return result;
}
