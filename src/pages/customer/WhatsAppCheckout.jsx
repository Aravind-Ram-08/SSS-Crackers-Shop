import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HiOutlineChevronLeft, HiOutlineUser, HiOutlinePhone,
    HiOutlineLocationMarker, HiOutlineClipboardCopy,
    HiOutlineCheck, HiOutlineShoppingCart, HiOutlineExclamation,
    HiOutlineDocumentText, HiOutlineShare, HiOutlineCheckCircle,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { useInvoices } from "../../context/InvoiceContext";
import { formatPrice } from "../../utils/helpers";
import { generateOrderMessage, sendOrderViaWhatsApp, buildWhatsAppURL } from "../../utils/whatsapp";
import "./WhatsAppCheckout.css";

export default function WhatsAppCheckout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
    });
    const [errors, setErrors] = useState({});
    const [copied, setCopied] = useState(false);
    const [legalAck, setLegalAck] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState(null);

    const { createInvoice } = useInvoices();

    // Capture cart items before clearing
    const cartItemsRef = useRef(cartItems);
    const cartTotalRef = useRef(cartTotal);

    const delivery = cartTotal >= 999 ? 0 : 99;
    const grandTotal = cartTotal + delivery;

    // Preview message
    const previewMessage = useMemo(() => {
        if (cartItems.length === 0) return "";
        return generateOrderMessage({
            cartItems,
            customer: form,
            delivery,
        });
    }, [cartItems, form, delivery]);

    // Validate form
    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required";
        if (!form.phone.trim()) errs.phone = "Phone number is required";
        else if (!/^[\d]{10}$/.test(form.phone.replace(/[\s\-+]/g, "").slice(-10))) {
            errs.phone = "Enter a valid 10-digit phone number";
        }
        if (!form.address.trim()) errs.address = "Delivery address is required";
        return errs;
    }

    function handleField(key, value) {
        setForm(f => ({ ...f, [key]: value }));
        if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
    }

    function handlePreview() {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setShowPreview(true);
    }

    function handleSendWhatsApp() {
        if (!legalAck) return;

        // Capture current items before clearing
        const savedItems = cartItemsRef.current;
        const savedTotal = cartTotalRef.current;
        const savedDelivery = delivery;
        const savedGrandTotal = grandTotal;

        // Generate invoice
        const inv = createInvoice({
            orderId: `WA-${Date.now()}`,
            customerName: form.name,
            phone: form.phone,
            address: form.address,
            products: savedItems,
            subtotal: savedTotal,
            delivery: savedDelivery,
            totalAmount: savedGrandTotal,
            paymentMethod: "whatsapp",
        });
        setCreatedInvoice(inv);

        // Send WhatsApp order message
        sendOrderViaWhatsApp({
            cartItems: savedItems,
            customer: form,
            delivery: savedDelivery,
        });

        setOrderPlaced(true);
        clearCart();
    }

    function handleCopy() {
        navigator.clipboard.writeText(previewMessage).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    // Empty cart (but not after placing order)
    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <div className="wa-empty">
                <div className="wa-empty-inner">
                    <span className="wa-empty-icon">🛒</span>
                    <h2>Your Cart is Empty</h2>
                    <p>Add some products to your cart before placing a WhatsApp order.</p>
                    <Link to="/products" className="btn btn-primary btn-lg">
                        <HiOutlineShoppingCart /> Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    // Order placed — success screen with invoice
    if (orderPlaced && createdInvoice) {
        const shareMsg = `🧾 *Invoice from SSS Crackers*\n\n` +
            `Invoice: ${createdInvoice.invoiceId}\n` +
            `Order: ${createdInvoice.orderId}\n` +
            `Date: ${new Date(createdInvoice.date).toLocaleDateString("en-IN")}\n` +
            `Amount: ${formatPrice(createdInvoice.totalAmount)}\n\n` +
            `Your invoice has been generated.\nThank you for choosing SSS Crackers! 🎆`;

        return (
            <div className="wa-checkout">
                <div className="checkout-success-screen">
                    <div className="checkout-success-card">
                        <div className="checkout-success-icon-wrap">
                            <HiOutlineCheckCircle className="checkout-success-icon" />
                        </div>
                        <h1 className="checkout-success-title">Order Sent! 🎉</h1>
                        <p className="checkout-success-subtitle">
                            Your order has been sent via WhatsApp. We'll confirm your order shortly.
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
                                <span>Amount</span>
                                <strong className="checkout-success-amount">
                                    {formatPrice(createdInvoice.totalAmount)}
                                </strong>
                            </div>
                        </div>

                        <div className="checkout-success-actions">
                            <Link
                                to={`/invoice/${createdInvoice.invoiceId}`}
                                className="checkout-success-btn checkout-success-invoice"
                            >
                                <HiOutlineDocumentText /> View & Download Invoice
                            </Link>
                            <button
                                className="checkout-success-btn checkout-success-whatsapp"
                                onClick={() => window.open(buildWhatsAppURL(shareMsg), "_blank", "noopener,noreferrer")}
                            >
                                <HiOutlineShare /> Share Invoice
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
        <div className="wa-checkout">
            {/* Header */}
            <div className="wa-header">
                <div className="wa-header-container">
                    <Link to="/cart" className="breadcrumb-back">
                        <HiOutlineChevronLeft /> Back to Cart
                    </Link>
                    <h1 className="wa-title">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="#25d366" className="wa-title-icon">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Order via WhatsApp
                    </h1>
                </div>
            </div>

            <div className="wa-layout">
                {/* ── Left: Form + Preview ──────────────────────────────── */}
                <div className="wa-form-section">
                    {!showPreview ? (
                        <>
                            {/* Customer Info Form */}
                            <div className="wa-card">
                                <h3 className="wa-card-title">
                                    <HiOutlineUser className="wa-card-icon" />
                                    Customer Details
                                </h3>
                                <p className="wa-card-desc">
                                    Enter your details. These will be included in the WhatsApp order message.
                                </p>

                                <div className="wa-form-grid">
                                    <div className="wa-field">
                                        <label className="wa-label">Full Name *</label>
                                        <div className="wa-input-wrap">
                                            <HiOutlineUser className="wa-input-icon" />
                                            <input
                                                type="text"
                                                className={`wa-input ${errors.name ? "wa-input-err" : ""}`}
                                                placeholder="Your full name"
                                                value={form.name}
                                                onChange={e => handleField("name", e.target.value)}
                                                id="wa-name"
                                            />
                                        </div>
                                        {errors.name && <p className="wa-err">{errors.name}</p>}
                                    </div>

                                    <div className="wa-field">
                                        <label className="wa-label">Phone Number *</label>
                                        <div className="wa-input-wrap">
                                            <HiOutlinePhone className="wa-input-icon" />
                                            <input
                                                type="tel"
                                                className={`wa-input ${errors.phone ? "wa-input-err" : ""}`}
                                                placeholder="9876543210"
                                                value={form.phone}
                                                onChange={e => handleField("phone", e.target.value)}
                                                id="wa-phone"
                                            />
                                        </div>
                                        {errors.phone && <p className="wa-err">{errors.phone}</p>}
                                    </div>

                                    <div className="wa-field wa-field-full">
                                        <label className="wa-label">Delivery Address *</label>
                                        <div className="wa-input-wrap wa-textarea-wrap">
                                            <HiOutlineLocationMarker className="wa-input-icon" />
                                            <textarea
                                                className={`wa-input wa-textarea ${errors.address ? "wa-input-err" : ""}`}
                                                placeholder="Door no, Street, Area, City, State, Pincode"
                                                rows={3}
                                                value={form.address}
                                                onChange={e => handleField("address", e.target.value)}
                                                id="wa-address"
                                            />
                                        </div>
                                        {errors.address && <p className="wa-err">{errors.address}</p>}
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg wa-preview-btn"
                                    onClick={handlePreview}
                                    id="wa-preview-btn"
                                >
                                    Preview Order Message
                                </button>
                            </div>

                            {/* Order items */}
                            <div className="wa-card">
                                <h3 className="wa-card-title">
                                    <HiOutlineShoppingCart className="wa-card-icon" />
                                    Your Items ({cartItems.length})
                                </h3>
                                <div className="wa-items-list">
                                    {cartItems.map((item, i) => (
                                        <div className="wa-item-row" key={item.id}>
                                            <span className="wa-item-index">{i + 1}.</span>
                                            <div className="wa-item-info">
                                                <span className="wa-item-name">{item.name}</span>
                                                <span className="wa-item-meta">
                                                    {item.boxContent} • Qty: {item.quantity}
                                                </span>
                                            </div>
                                            <span className="wa-item-price">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Preview State ────────────────────────────────────── */
                        <div className="wa-card">
                            <div className="wa-preview-header">
                                <h3 className="wa-card-title">📋 Order Message Preview</h3>
                                <button
                                    className="wa-back-btn"
                                    onClick={() => setShowPreview(false)}
                                >
                                    ← Edit Details
                                </button>
                            </div>

                            <div className="wa-preview-box">
                                <pre className="wa-preview-text">{previewMessage}</pre>
                            </div>

                            <div className="wa-preview-actions">
                                <button
                                    className={`wa-copy-btn ${copied ? "wa-copied" : ""}`}
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <><HiOutlineCheck /> Copied!</>
                                    ) : (
                                        <><HiOutlineClipboardCopy /> Copy Message</>
                                    )}
                                </button>
                            </div>

                            {/* Legal compliance */}
                            <div className="wa-legal-box">
                                <HiOutlineExclamation className="wa-legal-icon" />
                                <div className="wa-legal-content">
                                    <p className="wa-legal-text">
                                        As per the 2018 Supreme Court order, online sale of firecrackers through
                                        e-commerce platforms is restricted. This website collects enquiries and orders
                                        are processed through <strong>licensed retail channels</strong>.
                                    </p>
                                    <label className="wa-legal-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={legalAck}
                                            onChange={e => setLegalAck(e.target.checked)}
                                            id="wa-legal-ack"
                                        />
                                        <span>I understand and agree to proceed</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                className="wa-send-btn"
                                onClick={handleSendWhatsApp}
                                disabled={!legalAck}
                                id="wa-send-btn"
                            >
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Send Order via WhatsApp
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Right: Summary Sidebar ────────────────────────────── */}
                <div className="wa-sidebar">
                    <div className="wa-summary-card">
                        <h3 className="wa-summary-title">Order Summary</h3>

                        <div className="wa-summary-rows">
                            <div className="wa-summary-row">
                                <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="wa-summary-row">
                                <span>Delivery</span>
                                <span className={delivery === 0 ? "wa-free" : ""}>
                                    {delivery === 0 ? "FREE" : formatPrice(delivery)}
                                </span>
                            </div>
                        </div>

                        <div className="wa-summary-total">
                            <span>Total</span>
                            <span className="wa-total-amount">{formatPrice(grandTotal)}</span>
                        </div>

                        {cartTotal < 999 && (
                            <div className="wa-delivery-hint">
                                🚚 Add {formatPrice(999 - cartTotal)} more for FREE delivery!
                            </div>
                        )}

                        {/* How it works */}
                        <div className="wa-how-it-works">
                            <h4 className="wa-how-title">How it works</h4>
                            <div className="wa-step">
                                <span className="wa-step-num">1</span>
                                <span>Fill in your details above</span>
                            </div>
                            <div className="wa-step">
                                <span className="wa-step-num">2</span>
                                <span>Preview your order message</span>
                            </div>
                            <div className="wa-step">
                                <span className="wa-step-num">3</span>
                                <span>Send via WhatsApp with one tap</span>
                            </div>
                            <div className="wa-step">
                                <span className="wa-step-num">4</span>
                                <span>We confirm availability & payment</span>
                            </div>
                        </div>

                        <div className="wa-trust-badges">
                            <span>🔒 Secure</span>
                            <span>📱 Instant</span>
                            <span>✅ Licensed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
