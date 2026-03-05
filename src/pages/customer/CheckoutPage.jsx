import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HiOutlineChevronLeft,
    HiOutlineLockClosed,
    HiOutlineTruck,
    HiOutlineShieldCheck,
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineOfficeBuilding,
    HiOutlineMap,
    HiOutlineTag,
    HiOutlineX,
    HiOutlineDocumentText,
    HiOutlineShare,
    HiOutlineCheckCircle,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { useCoupons } from "../../context/CouponContext";
import { useInvoices } from "../../context/InvoiceContext";
import { formatPrice } from "../../utils/helpers";
import { initRazorpayPayment } from "../../utils/razorpay";
import { buildWhatsAppURL } from "../../utils/whatsapp";
import { toast } from "react-toastify";
import "./CheckoutPage.css";

const initialForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
};

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const {
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        recalculateDiscount,
    } = useCoupons();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // null | "success" | "failed"
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [createdInvoice, setCreatedInvoice] = useState(null);

    const { createInvoice } = useInvoices();

    // We need to capture cart items before they're cleared
    const cartItemsRef = useRef(cartItems);
    const cartTotalRef = useRef(cartTotal);
    const deliveryRef = useRef(delivery);
    const couponRef = useRef({ appliedCoupon, couponDiscount });

    useEffect(() => {
        if (cartItems.length > 0) {
            cartItemsRef.current = cartItems;
            cartTotalRef.current = cartTotal;
            deliveryRef.current = delivery;
            couponRef.current = { appliedCoupon, couponDiscount };
        }
    }, [cartItems, cartTotal, delivery, appliedCoupon, couponDiscount]);

    // Coupon input state for checkout page
    const [couponCode, setCouponCode] = useState("");
    const [couponMessage, setCouponMessage] = useState(null);

    const delivery = cartTotal >= 999 ? 0 : 99;
    const grandTotal = cartTotal + delivery - couponDiscount;

    // Recalculate coupon discount when cart changes
    useEffect(() => {
        recalculateDiscount(cartItems, cartTotal);
    }, [cartItems, cartTotal]);

    // Auto-clear coupon message
    useEffect(() => {
        if (couponMessage) {
            const t = setTimeout(() => setCouponMessage(null), 5000);
            return () => clearTimeout(t);
        }
    }, [couponMessage]);

    // ── Redirect if cart empty ──────────────────────────────────────────────
    if (cartItems.length === 0 && paymentStatus !== "success") {
        return (
            <div className="checkout-empty">
                <div className="checkout-empty-inner">
                    <span className="checkout-empty-icon">🛒</span>
                    <h2>Your cart is empty</h2>
                    <p>Add some products before checking out.</p>
                    <Link to="/products" className="btn btn-primary btn-lg">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // ── Success screen ──────────────────────────────────────────────────────
    if (paymentStatus === "success") {
        return (
            <div className="checkout-success">
                <div className="checkout-success-inner">
                    <div className="success-animation">
                        <div className="success-ring" />
                        <span className="success-icon-emoji">🎉</span>
                    </div>
                    <h1 className="success-title">Payment Successful!</h1>
                    <p className="success-subtitle">
                        Your order has been placed. Get ready for a spectacular celebration! 🧨
                    </p>
                    {paymentDetails && (
                        <div className="success-details">
                            <div className="success-detail-row">
                                <span>Order ID</span>
                                <span className="success-detail-value">{paymentDetails.orderId}</span>
                            </div>
                            <div className="success-detail-row">
                                <span>Payment ID</span>
                                <span className="success-detail-value">{paymentDetails.paymentId}</span>
                            </div>
                            <div className="success-detail-row">
                                <span>Amount Paid</span>
                                <span className="success-detail-value success-amount">{formatPrice(grandTotal)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="success-detail-row">
                                    <span>Coupon Saved</span>
                                    <span className="success-detail-value" style={{ color: "#4ade80" }}>
                                        {formatPrice(couponDiscount)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="success-actions">
                        <Link to="/" className="btn btn-primary btn-lg">
                            Back to Home
                        </Link>
                        <Link to="/products" className="btn btn-outline btn-lg">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Validation ──────────────────────────────────────────────────────────
    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Full name is required.";
        if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
        if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = "Enter a valid 10-digit mobile number.";
        if (!form.address.trim()) errs.address = "Address is required.";
        if (!form.city.trim()) errs.city = "City is required.";
        if (!form.state.trim()) errs.state = "State is required.";
        if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "Enter a valid 6-digit PIN code.";
        return errs;
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // ── Coupon handlers ─────────────────────────────────────────────────────
    function handleApplyCoupon() {
        if (!couponCode.trim()) {
            setCouponMessage({ type: "error", text: "Please enter a coupon code" });
            return;
        }
        const result = applyCoupon(couponCode.trim(), cartItems, cartTotal);
        if (result.valid) {
            setCouponMessage({
                type: "success",
                text: `🎉 Coupon applied! You saved ${formatPrice(result.discount)}`,
            });
            setCouponCode("");
        } else {
            setCouponMessage({ type: "error", text: result.message });
        }
    }

    function handleRemoveCoupon() {
        removeCoupon();
        setCouponMessage(null);
        setCouponCode("");
    }

    // ── Pay button handler ──────────────────────────────────────────────────
    async function handlePay(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            // Scroll to first error
            const firstErr = document.querySelector(".field-error");
            firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setIsProcessing(true);
        setPaymentStatus(null);

        const receipt = `rcpt_${Date.now()}`;

        try {
            const result = await initRazorpayPayment({
                amountInPaise: grandTotal * 100,
                receipt,
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                notes: {
                    address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
                    coupon: appliedCoupon?.couponCode || "None",
                    couponDiscount: couponDiscount,
                },
                onSuccess: (details) => {
                    setPaymentDetails(details);

                    // Generate invoice
                    const savedItems = cartItemsRef.current;
                    const savedTotal = cartTotalRef.current;
                    const savedDelivery = deliveryRef.current;
                    const savedCoupon = couponRef.current;
                    const gTotal = savedTotal + savedDelivery - (savedCoupon.couponDiscount || 0);

                    const inv = createInvoice({
                        orderId: details.razorpay_order_id || `ORD-${Date.now()}`,
                        paymentId: details.razorpay_payment_id || "",
                        customerName: form.name,
                        phone: form.phone,
                        email: form.email,
                        address: form.address,
                        city: form.city,
                        state: form.state,
                        pincode: form.pincode,
                        products: savedItems,
                        subtotal: savedTotal,
                        delivery: savedDelivery,
                        couponCode: savedCoupon.appliedCoupon?.couponCode || "",
                        couponDiscount: savedCoupon.couponDiscount || 0,
                        totalAmount: gTotal,
                        paymentMethod: "online",
                    });
                    setCreatedInvoice(inv);

                    setPaymentStatus("success");
                    clearCart();
                    removeCoupon();
                    toast.success("🎉 Payment successful! Your order is confirmed.");
                },
                onFailure: (msg) => {
                    setPaymentStatus("failed");
                    if (msg !== "Payment cancelled by user.") {
                        toast.error("❌ " + msg);
                    }
                    console.error("Payment failed:", msg);
                },
            });

            if (result) {
                setPaymentDetails(result);
                setPaymentStatus("success");
                clearCart();
                removeCoupon();
            }
        } catch (err) {
            if (err.message !== "Payment cancelled.") {
                setPaymentStatus("failed");
            }
        } finally {
            setIsProcessing(false);
        }
    }

    // ── Success Screen ───────────────────────────────────────────────────
    if (paymentStatus === "success" && createdInvoice) {
        const shareMsg = `🧾 *Invoice from SSS Crackers*\n\n` +
            `Invoice: ${createdInvoice.invoiceId}\n` +
            `Order: ${createdInvoice.orderId}\n` +
            `Date: ${new Date(createdInvoice.date).toLocaleDateString("en-IN")}\n` +
            `Amount: ${formatPrice(createdInvoice.totalAmount)}\n\n` +
            `Your invoice has been generated.\nThank you for choosing SSS Crackers! 🎆`;

        return (
            <div className="checkout-page">
                <div className="checkout-success-screen">
                    <div className="checkout-success-card">
                        <div className="checkout-success-icon-wrap">
                            <HiOutlineCheckCircle className="checkout-success-icon" />
                        </div>
                        <h1 className="checkout-success-title">Order Confirmed! 🎉</h1>
                        <p className="checkout-success-subtitle">
                            Thank you for your purchase. Your order has been placed successfully.
                        </p>

                        <div className="checkout-success-details">
                            <div className="checkout-success-row">
                                <span>Invoice No.</span>
                                <strong>{createdInvoice.invoiceId}</strong>
                            </div>
                            <div className="checkout-success-row">
                                <span>Order ID</span>
                                <strong>{createdInvoice.orderId}</strong>
                            </div>
                            <div className="checkout-success-row">
                                <span>Payment Mode</span>
                                <strong>💵 Cash on Delivery</strong>
                            </div>
                            <div className="checkout-success-row">
                                <span>Amount Paid</span>
                                <strong className="checkout-success-amount">
                                    {formatPrice(createdInvoice.totalAmount)}
                                </strong>
                            </div>
                        </div>

                        <div className="checkout-success-actions">
                            <Link
                                to={`/invoice/${createdInvoice.invoiceId}`}
                                className="checkout-success-btn checkout-success-invoice"
                                id="view-invoice-btn"
                            >
                                <HiOutlineDocumentText /> View & Download Invoice
                            </Link>
                            <button
                                className="checkout-success-btn checkout-success-whatsapp"
                                onClick={() => window.open(buildWhatsAppURL(shareMsg), "_blank", "noopener,noreferrer")}
                                id="share-invoice-wa-btn"
                            >
                                <HiOutlineShare /> Share via WhatsApp
                            </button>
                        </div>

                        <Link to="/products" className="checkout-success-continue">
                            Continue Shopping →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Header */}
            <div className="checkout-header">
                <div className="checkout-header-container">
                    <Link to="/cart" className="breadcrumb-back">
                        <HiOutlineChevronLeft /> Back to Cart
                    </Link>
                    <h1 className="checkout-title">
                        <HiOutlineLockClosed className="checkout-title-icon" />
                        Secure Checkout
                    </h1>
                </div>
            </div>

            <div className="checkout-layout">
                {/* ── LEFT: Address Form ─────────────────────────────────── */}
                <form className="checkout-form" onSubmit={handlePay} noValidate>
                    <div className="form-section">
                        <h2 className="form-section-title">
                            <HiOutlineUser className="form-section-icon" />
                            Contact Information
                        </h2>

                        <div className="form-grid">
                            {/* Full Name */}
                            <div className="form-field">
                                <label htmlFor="name" className="form-label">
                                    Full Name
                                </label>
                                <div className={`input-wrapper ${errors.name ? "input-error" : ""}`}>
                                    <HiOutlineUser className="input-icon" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Ravi Kumar"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="form-input"
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && <p className="field-error">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="form-field">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <div className={`input-wrapper ${errors.email ? "input-error" : ""}`}>
                                    <HiOutlineMail className="input-icon" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ravi@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && <p className="field-error">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="form-field">
                                <label htmlFor="phone" className="form-label">
                                    Mobile Number
                                </label>
                                <div className={`input-wrapper ${errors.phone ? "input-error" : ""}`}>
                                    <HiOutlinePhone className="input-icon" />
                                    <span className="input-prefix">+91</span>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="form-input input-with-prefix"
                                        maxLength={10}
                                        autoComplete="tel"
                                    />
                                </div>
                                {errors.phone && <p className="field-error">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2 className="form-section-title">
                            <HiOutlineLocationMarker className="form-section-icon" />
                            Delivery Address
                        </h2>

                        <div className="form-grid">
                            {/* Street Address */}
                            <div className="form-field form-field-full">
                                <label htmlFor="address" className="form-label">
                                    Street Address
                                </label>
                                <div className={`input-wrapper ${errors.address ? "input-error" : ""}`}>
                                    <HiOutlineLocationMarker className="input-icon" />
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        placeholder="House No., Street, Area"
                                        value={form.address}
                                        onChange={handleChange}
                                        className="form-input"
                                        autoComplete="street-address"
                                    />
                                </div>
                                {errors.address && <p className="field-error">{errors.address}</p>}
                            </div>

                            {/* City */}
                            <div className="form-field">
                                <label htmlFor="city" className="form-label">
                                    City
                                </label>
                                <div className={`input-wrapper ${errors.city ? "input-error" : ""}`}>
                                    <HiOutlineOfficeBuilding className="input-icon" />
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        placeholder="Chennai"
                                        value={form.city}
                                        onChange={handleChange}
                                        className="form-input"
                                        autoComplete="address-level2"
                                    />
                                </div>
                                {errors.city && <p className="field-error">{errors.city}</p>}
                            </div>

                            {/* State */}
                            <div className="form-field">
                                <label htmlFor="state" className="form-label">
                                    State
                                </label>
                                <div className={`input-wrapper ${errors.state ? "input-error" : ""}`}>
                                    <HiOutlineMap className="input-icon" />
                                    <select
                                        id="state"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        className="form-input form-select"
                                        autoComplete="address-level1"
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.state && <p className="field-error">{errors.state}</p>}
                            </div>

                            {/* Pincode */}
                            <div className="form-field">
                                <label htmlFor="pincode" className="form-label">
                                    PIN Code
                                </label>
                                <div className={`input-wrapper ${errors.pincode ? "input-error" : ""}`}>
                                    <HiOutlineLocationMarker className="input-icon" />
                                    <input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        placeholder="600001"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        className="form-input"
                                        maxLength={6}
                                        autoComplete="postal-code"
                                    />
                                </div>
                                {errors.pincode && <p className="field-error">{errors.pincode}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Order error banner */}
                    {paymentStatus === "failed" && (
                        <div className="payment-error-banner">
                            ❌ Order could not be placed. Please try again.
                        </div>
                    )}

                    {/* Place Order button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg checkout-pay-btn"
                        id="pay-now-btn"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <span className="pay-spinner" />
                                Placing Order...
                            </>
                        ) : (
                            <>
                                <HiOutlineLockClosed />
                                Place Order — {formatPrice(grandTotal)}
                            </>
                        )}
                    </button>

                    <p className="checkout-razorpay-note">
                        💵 Cash on Delivery — Pay when your order arrives at your doorstep
                    </p>
                </form>

                {/* ── RIGHT: Order Summary ───────────────────────────────── */}
                <aside className="checkout-summary">
                    <div className="checkout-summary-card">
                        <h3 className="checkout-summary-title">Order Summary</h3>

                        {/* Items */}
                        <div className="checkout-items">
                            {cartItems.map((item) => (
                                <div className="checkout-item" key={item.id}>
                                    <div className="checkout-item-name">
                                        <span className="checkout-item-qty-badge">{item.quantity}×</span>
                                        {item.name}
                                    </div>
                                    <span className="checkout-item-price">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="checkout-summary-divider" />

                        {/* ── Coupon Section ─── */}
                        <div className="checkout-coupon-section" id="checkout-coupon-section">
                            {appliedCoupon ? (
                                <div className="checkout-coupon-applied" id="checkout-coupon-applied">
                                    <div className="checkout-coupon-applied-left">
                                        <HiOutlineTag className="checkout-coupon-tag-icon" />
                                        <div>
                                            <span className="checkout-coupon-code">{appliedCoupon.couponCode}</span>
                                            <span className="checkout-coupon-savings">
                                                Saving {formatPrice(couponDiscount)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="checkout-coupon-remove"
                                        onClick={handleRemoveCoupon}
                                        aria-label="Remove coupon"
                                        id="checkout-remove-coupon"
                                    >
                                        <HiOutlineX />
                                    </button>
                                </div>
                            ) : (
                                <div className="checkout-coupon-input-row">
                                    <div className="checkout-coupon-input-wrap">
                                        <HiOutlineTag className="checkout-coupon-input-icon" />
                                        <input
                                            type="text"
                                            className="checkout-coupon-input"
                                            placeholder="Coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                                            id="checkout-coupon-field"
                                        />
                                    </div>
                                    <button
                                        className="checkout-coupon-apply"
                                        onClick={handleApplyCoupon}
                                        type="button"
                                        id="checkout-apply-coupon"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}

                            {couponMessage && (
                                <div
                                    className={`checkout-coupon-msg checkout-coupon-msg-${couponMessage.type}`}
                                    id="checkout-coupon-message"
                                >
                                    {couponMessage.text}
                                </div>
                            )}
                        </div>

                        <div className="checkout-summary-divider" />

                        {/* Totals */}
                        <div className="checkout-summary-rows">
                            <div className="checkout-summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="checkout-summary-row">
                                <span>Delivery</span>
                                <span className={delivery === 0 ? "free-delivery" : ""}>
                                    {delivery === 0 ? "FREE" : formatPrice(delivery)}
                                </span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="checkout-summary-row savings">
                                    <span>Coupon ({appliedCoupon?.couponCode})</span>
                                    <span>−{formatPrice(couponDiscount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="checkout-summary-divider" />

                        <div className="checkout-total-row">
                            <span>Grand Total</span>
                            <span className="checkout-total-amount">{formatPrice(grandTotal)}</span>
                        </div>

                        {couponDiscount > 0 && (
                            <div className="checkout-savings-badge">
                                🎉 You saved {formatPrice(couponDiscount)} on this order!
                            </div>
                        )}

                        {/* Trust signals */}
                        <div className="checkout-trust">
                            <div className="checkout-trust-item">
                                <HiOutlineShieldCheck className="checkout-trust-icon" />
                                <span>100% Secure Payment</span>
                            </div>
                            <div className="checkout-trust-item">
                                <HiOutlineTruck className="checkout-trust-icon" />
                                <span>Fast Delivery from Sivakasi</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

// Full list of Indian states & UTs
const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
];
