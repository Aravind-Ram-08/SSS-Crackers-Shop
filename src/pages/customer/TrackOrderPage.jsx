import { useState, useRef } from "react";
import { useOrderTracking, ORDER_STAGES, STATUS_TO_STAGE } from "../../context/OrderTrackingContext";
import { formatPrice } from "../../utils/helpers";
import {
    HiOutlineSearch, HiOutlineX, HiOutlineClipboardList,
    HiOutlinePhone, HiOutlineLocationMarker, HiOutlineMail,
    HiOutlineCreditCard, HiOutlineCalendar, HiOutlineCheckCircle,
    HiOutlineClock, HiOutlineExclamationCircle,
} from "react-icons/hi";
import "./TrackOrderPage.css";

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function formatDateShort(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric",
    });
}

export default function TrackOrderPage() {
    const { findOrder } = useOrderTracking();
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [result, setResult] = useState(null); // null | "not_found" | order object
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const resultRef = useRef(null);

    const handleTrack = (e) => {
        e.preventDefault();
        if (!orderId.trim() || !phone.trim()) return;

        setLoading(true);
        // Simulate async lookup
        setTimeout(() => {
            const order = findOrder(orderId, phone);
            setResult(order || "not_found");
            setSearched(true);
            setLoading(false);
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }, 800);
    };

    const handleReset = () => {
        setOrderId("");
        setPhone("");
        setResult(null);
        setSearched(false);
    };

    const order = result && result !== "not_found" ? result : null;
    const stageIndex = order ? (STATUS_TO_STAGE[order.orderStatus] ?? 0) : 0;
    const isCancelled = order?.orderStatus === "cancelled";

    return (
        <div className="track-page">
            {/* ── Hero Banner ──────────────────────────────────────── */}
            <div className="track-hero">
                <div className="track-hero-glow" />
                <div className="track-hero-content">
                    <span className="track-hero-badge">📦 Live Tracking</span>
                    <h1 className="track-hero-title">Track Your Order</h1>
                    <p className="track-hero-sub">
                        Enter your Order ID and phone number to get real-time status updates on your SSS Crackers order.
                    </p>
                </div>
            </div>

            <div className="track-container">
                {/* ── Search Form ──────────────────────────────────── */}
                <div className="track-form-card">
                    <div className="track-form-header">
                        <HiOutlineClipboardList className="track-form-icon" />
                        <div>
                            <h2 className="track-form-title">Order Lookup</h2>
                            <p className="track-form-sub">Enter your details below</p>
                        </div>
                    </div>

                    <form className="track-form" onSubmit={handleTrack} id="track-order-form">
                        <div className="track-field-group">
                            <div className="track-field">
                                <label className="track-label" htmlFor="track-order-id">Order ID</label>
                                <div className="track-input-wrap">
                                    <HiOutlineClipboardList className="track-input-icon" />
                                    <input
                                        id="track-order-id"
                                        type="text"
                                        className="track-input"
                                        placeholder="e.g. ORD-2026-0001"
                                        value={orderId}
                                        onChange={e => setOrderId(e.target.value)}
                                        autoComplete="off"
                                        required
                                    />
                                    {orderId && (
                                        <button type="button" className="track-input-clear" onClick={() => setOrderId("")}>
                                            <HiOutlineX />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="track-field">
                                <label className="track-label" htmlFor="track-phone">Phone Number</label>
                                <div className="track-input-wrap">
                                    <HiOutlinePhone className="track-input-icon" />
                                    <input
                                        id="track-phone"
                                        type="tel"
                                        className="track-input"
                                        placeholder="10-digit mobile number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        maxLength={10}
                                        required
                                    />
                                    {phone && (
                                        <button type="button" className="track-input-clear" onClick={() => setPhone("")}>
                                            <HiOutlineX />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="track-form-actions">
                            <button
                                type="submit"
                                className="track-btn-primary"
                                id="track-order-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="track-spinner" />
                                ) : (
                                    <HiOutlineSearch />
                                )}
                                {loading ? "Tracking…" : "Track Order"}
                            </button>
                            {searched && (
                                <button type="button" className="track-btn-outline" onClick={handleReset} id="track-reset-btn">
                                    <HiOutlineX /> Reset
                                </button>
                            )}
                        </div>

                        <p className="track-hint">
                            💡 Try: <strong>ORD-2026-0001</strong> + phone <strong>9876543210</strong>
                        </p>
                    </form>
                </div>

                {/* ── Result Section ────────────────────────────────── */}
                <div ref={resultRef}>
                    {/* Not Found */}
                    {result === "not_found" && (
                        <div className="track-not-found" id="track-not-found">
                            <HiOutlineExclamationCircle className="track-nf-icon" />
                            <h3>Order Not Found</h3>
                            <p>We couldn't find an order matching <strong>{orderId}</strong> with phone <strong>{phone}</strong>.</p>
                            <p className="track-nf-hint">Please double-check your Order ID and phone number. Contact us on WhatsApp if you need help.</p>
                            <a
                                href="https://wa.me/919876543210?text=Hello%2C%20I%20need%20help%20tracking%20my%20order"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="track-wa-btn"
                            >
                                💬 WhatsApp Support
                            </a>
                        </div>
                    )}

                    {/* Order Found */}
                    {order && (
                        <div className="track-result" id="track-result-panel">
                            {/* ── Order Info Header ───────────── */}
                            <div className="track-order-header">
                                <div className="track-order-meta">
                                    <span className="track-order-id">#{order.orderId}</span>
                                    <span className={`track-status-badge track-status-${order.orderStatus}`}>
                                        {isCancelled ? "❌ Cancelled" : ORDER_STAGES[stageIndex]?.icon + " " + ORDER_STAGES[stageIndex]?.label}
                                    </span>
                                </div>
                                <div className="track-order-info-row">
                                    <span><HiOutlineCalendar />Ordered: {formatDateShort(order.createdAt)}</span>
                                    <span><HiOutlineCreditCard />Payment: {order.paymentId}</span>
                                </div>
                            </div>

                            {/* ── Progress Timeline ────────────── */}
                            {!isCancelled ? (
                                <div className="track-timeline-card">
                                    <h3 className="track-section-title">📍 Shipment Progress</h3>

                                    {/* Progress bar */}
                                    <div className="track-progress-bar-wrap">
                                        <div
                                            className="track-progress-bar-fill"
                                            style={{ width: `${((stageIndex) / (ORDER_STAGES.length - 1)) * 100}%` }}
                                        />
                                    </div>

                                    {/* Stage dots */}
                                    <div className="track-stages">
                                        {ORDER_STAGES.map((stage, idx) => {
                                            const isDone = idx < stageIndex;
                                            const isActive = idx === stageIndex;
                                            const isPending = idx > stageIndex;
                                            const updateEntry = order.trackingUpdates?.find(u => u.stage === stage.key);

                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={`track-stage ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isPending ? "pending" : ""}`}
                                                >
                                                    <div className="track-stage-dot-wrap">
                                                        <div className="track-stage-dot">
                                                            {isDone ? <HiOutlineCheckCircle /> : isActive ? <HiOutlineClock /> : <span />}
                                                        </div>
                                                        {idx < ORDER_STAGES.length - 1 && (
                                                            <div className={`track-stage-line ${isDone ? "done" : ""}`} />
                                                        )}
                                                    </div>
                                                    <div className="track-stage-info">
                                                        <span className="track-stage-icon">{stage.icon}</span>
                                                        <span className="track-stage-label">{stage.label}</span>
                                                        {updateEntry && (
                                                            <span className="track-stage-time">{formatDate(updateEntry.timestamp)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="track-cancelled-banner">
                                    <HiOutlineExclamationCircle />
                                    <div>
                                        <strong>Order Cancelled</strong>
                                        <p>This order has been cancelled. If you have questions, please contact our support team.</p>
                                    </div>
                                </div>
                            )}

                            {/* ── Activity Log ─────────────────── */}
                            {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                                <div className="track-activity-card">
                                    <h3 className="track-section-title">🕐 Activity Log</h3>
                                    <div className="track-activity-list">
                                        {[...order.trackingUpdates].reverse().map((upd, i) => (
                                            <div key={i} className={`track-activity-item ${i === 0 ? "latest" : ""}`}>
                                                <div className="track-activity-dot" />
                                                <div className="track-activity-body">
                                                    <span className="track-activity-label">{upd.label}</span>
                                                    <span className="track-activity-msg">{upd.message}</span>
                                                    <span className="track-activity-time">{formatDate(upd.timestamp)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Order Details Grid ───────────── */}
                            <div className="track-details-grid">
                                {/* Items */}
                                <div className="track-details-card">
                                    <h3 className="track-section-title">🛒 Order Items</h3>
                                    <div className="track-items-list">
                                        {order.products.map((item, i) => (
                                            <div key={i} className="track-item-row">
                                                <span className="track-item-name">{item.name}</span>
                                                <span className="track-item-qty">×{item.qty}</span>
                                                <span className="track-item-price">{formatPrice(item.price * item.qty)}</span>
                                            </div>
                                        ))}
                                        <div className="track-item-total">
                                            <span>Total Amount</span>
                                            <span>{formatPrice(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="track-details-card">
                                    <h3 className="track-section-title">👤 Customer Details</h3>
                                    <div className="track-cust-info">
                                        <div className="track-info-row">
                                            <HiOutlineClipboardList className="track-info-icon" />
                                            <span className="track-info-label">Name</span>
                                            <span className="track-info-val">{order.customerName}</span>
                                        </div>
                                        <div className="track-info-row">
                                            <HiOutlinePhone className="track-info-icon" />
                                            <span className="track-info-label">Phone</span>
                                            <span className="track-info-val">+91 {order.phone}</span>
                                        </div>
                                        <div className="track-info-row">
                                            <HiOutlineMail className="track-info-icon" />
                                            <span className="track-info-label">Email</span>
                                            <span className="track-info-val">{order.email}</span>
                                        </div>
                                        <div className="track-info-row">
                                            <HiOutlineLocationMarker className="track-info-icon" />
                                            <span className="track-info-label">Address</span>
                                            <span className="track-info-val">{order.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Notification Buttons ─────────── */}
                            <div className="track-notify-strip">
                                <p className="track-notify-label">📣 Get notified about your order:</p>
                                <div className="track-notify-btns">
                                    <a
                                        href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(`Hello ${order.customerName}! Your SSS Crackers order #${order.orderId} is currently: ${ORDER_STAGES[Math.max(0, stageIndex)]?.label}. Thank you for shopping with us! 🧨`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="track-notify-btn whatsapp"
                                        id="track-whatsapp-notify-btn"
                                    >
                                        💬 WhatsApp Update
                                    </a>
                                    <a
                                        href={`mailto:${order.email}?subject=SSS Crackers Order Update - ${order.orderId}&body=Hello ${order.customerName},%0A%0AYour order #${order.orderId} is currently in status: ${ORDER_STAGES[Math.max(0, stageIndex)]?.label}.%0A%0AThank you for shopping with SSS Crackers!`}
                                        className="track-notify-btn email"
                                        id="track-email-notify-btn"
                                    >
                                        📧 Email Update
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── How it Works ──────────────────────────────────── */}
                {!searched && (
                    <div className="track-how-section">
                        <h2 className="track-how-title">How Order Tracking Works</h2>
                        <div className="track-how-grid">
                            {[
                                { icon: "🛒", step: "1", title: "Place Order", desc: "Order on our website or via WhatsApp and get your Order ID." },
                                { icon: "📋", step: "2", title: "Enter Details", desc: "Enter your Order ID and phone number in the tracking form above." },
                                { icon: "📍", step: "3", title: "Live Status", desc: "See your order's real-time stage from packing to delivery." },
                                { icon: "🎉", step: "4", title: "Get Delivery", desc: "Receive your premium Sivakasi crackers right at your door!" },
                            ].map(item => (
                                <div key={item.step} className="track-how-card">
                                    <div className="track-how-step">{item.step}</div>
                                    <div className="track-how-icon">{item.icon}</div>
                                    <h4 className="track-how-card-title">{item.title}</h4>
                                    <p className="track-how-card-desc">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
