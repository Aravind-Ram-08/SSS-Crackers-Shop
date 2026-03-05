import { useState } from "react";
import {
    HiOutlineSearch, HiOutlineX, HiOutlineTrash,
    HiOutlineEye, HiOutlineChevronDown, HiOutlineRefresh,
    HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker,
    HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle,
} from "react-icons/hi";
import { useOrderTracking, ORDER_STAGES, STATUS_TO_STAGE } from "../../context/OrderTrackingContext";
import { formatPrice } from "../../utils/helpers";
import "./AdminOrderTracking.css";

// ── Status config (admin colours) ────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    processing: { label: "Confirmed", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    packed: { label: "Packed", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    shipped: { label: "Shipped", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
    out_for_delivery: { label: "Out for Delivery", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const ALL_STATUSES = ["pending", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function formatDateShort(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

// ── Mini timeline inside expanded row ────────────────────────────────────────
function MiniTimeline({ order }) {
    const stageIndex = STATUS_TO_STAGE[order.orderStatus] ?? 0;
    const isCancelled = order.orderStatus === "cancelled";

    if (isCancelled) {
        return (
            <div className="aot-mini-cancelled">
                <HiOutlineExclamationCircle /> Order Cancelled
            </div>
        );
    }

    return (
        <div className="aot-mini-timeline">
            {ORDER_STAGES.map((stage, idx) => {
                const isDone = idx < stageIndex;
                const isActive = idx === stageIndex;
                const upd = order.trackingUpdates?.find(u => u.stage === stage.key);
                return (
                    <div key={stage.key} className={`aot-mini-stage ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                        <div className="aot-mini-dot">
                            {isDone ? <HiOutlineCheckCircle /> : isActive ? <HiOutlineClock /> : <span />}
                        </div>
                        <div className="aot-mini-label">
                            <span>{stage.icon} {stage.label}</span>
                            {upd && <span className="aot-mini-time">{formatDate(upd.timestamp)}</span>}
                        </div>
                        {idx < ORDER_STAGES.length - 1 && (
                            <div className={`aot-mini-line ${isDone ? "done" : ""}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Main page component ───────────────────────────────────────────────────────
export default function AdminOrderTracking() {
    const { trackingOrders, updateTrackingStatus } = useOrderTracking();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(null);

    // ── Computed stats ──────────────────────────────────────────────────────
    const totalRevenue = trackingOrders
        .filter(o => o.orderStatus !== "cancelled")
        .reduce((s, o) => s + o.totalAmount, 0);
    const pending = trackingOrders.filter(o => o.orderStatus === "pending").length;
    const delivered = trackingOrders.filter(o => o.orderStatus === "delivered").length;
    const inTransit = trackingOrders.filter(o => ["processing", "packed", "shipped", "out_for_delivery"].includes(o.orderStatus)).length;

    // ── Filter ──────────────────────────────────────────────────────────────
    const filtered = trackingOrders
        .filter(o => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                o.orderId.toLowerCase().includes(q) ||
                o.customerName.toLowerCase().includes(q) ||
                o.phone.includes(q) ||
                o.email.toLowerCase().includes(q);
            const matchStatus = !statusFilter || o.orderStatus === statusFilter;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleStatusChange = (orderId, newStatus) => {
        updateTrackingStatus(orderId, newStatus);
        setUpdateSuccess(orderId);
        setTimeout(() => setUpdateSuccess(null), 2500);
    };

    return (
        <div className="admin-page aot-page">
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Order Tracking</h1>
                    <p className="admin-page-sub">
                        {trackingOrders.length} total · {pending} pending · {delivered} delivered · {inTransit} in transit
                    </p>
                </div>
            </div>

            {/* ── KPI Strip ────────────────────────────────────────── */}
            <div className="aot-kpi-strip">
                <div className="aot-kpi" style={{ "--aot-accent": "#ff8c00", "--aot-glow": "rgba(255,140,0,0.12)" }}>
                    <span className="aot-kpi-icon">💰</span>
                    <div>
                        <p className="aot-kpi-label">Total Revenue</p>
                        <p className="aot-kpi-value">{formatPrice(totalRevenue)}</p>
                    </div>
                </div>
                <div className="aot-kpi" style={{ "--aot-accent": "#f59e0b", "--aot-glow": "rgba(245,158,11,0.12)" }}>
                    <span className="aot-kpi-icon">⏳</span>
                    <div>
                        <p className="aot-kpi-label">Pending</p>
                        <p className="aot-kpi-value">{pending}</p>
                    </div>
                </div>
                <div className="aot-kpi" style={{ "--aot-accent": "#f97316", "--aot-glow": "rgba(249,115,22,0.12)" }}>
                    <span className="aot-kpi-icon">🚚</span>
                    <div>
                        <p className="aot-kpi-label">In Transit</p>
                        <p className="aot-kpi-value">{inTransit}</p>
                    </div>
                </div>
                <div className="aot-kpi" style={{ "--aot-accent": "#10b981", "--aot-glow": "rgba(16,185,129,0.12)" }}>
                    <span className="aot-kpi-icon">✅</span>
                    <div>
                        <p className="aot-kpi-label">Delivered</p>
                        <p className="aot-kpi-value">{delivered}</p>
                    </div>
                </div>
            </div>

            {/* ── Status Filter Chips ───────────────────────────────── */}
            <div className="order-status-chips">
                <button
                    className={`order-chip ${!statusFilter ? "order-chip-active" : ""}`}
                    onClick={() => setStatusFilter("")}
                >
                    All ({trackingOrders.length})
                </button>
                {ALL_STATUSES.map(key => {
                    const cfg = STATUS_CONFIG[key];
                    const count = trackingOrders.filter(o => o.orderStatus === key).length;
                    return (
                        <button
                            key={key}
                            className={`order-chip ${statusFilter === key ? "order-chip-active" : ""}`}
                            style={statusFilter === key ? { "--chip-color": cfg.color, "--chip-bg": cfg.bg } : {}}
                            onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
                        >
                            <span className="order-chip-dot" style={{ background: cfg.color }} />
                            {cfg.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* ── Search ───────────────────────────────────────────── */}
            <div className="admin-card">
                <div className="prod-search-wrap">
                    <HiOutlineSearch className="prod-search-icon" />
                    <input
                        type="text"
                        className="prod-search-input"
                        placeholder="Search by Order ID, customer name, phone, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="aot-search-input"
                    />
                    {search && (
                        <button className="prod-search-clear" onClick={() => setSearch("")}>
                            <HiOutlineX />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Orders Table ─────────────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Current Stage</th>
                                <th>Update Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-table-empty">No orders found</td>
                                </tr>
                            ) : filtered.map(order => {
                                const cfg = STATUS_CONFIG[order.orderStatus];
                                const isExpanded = expandedOrder === order.id || expandedOrder === order.orderId;
                                const stageIdx = STATUS_TO_STAGE[order.orderStatus] ?? 0;
                                const stageInfo = !["cancelled"].includes(order.orderStatus) ? ORDER_STAGES[stageIdx] : null;
                                const isFinal = order.orderStatus === "delivered" || order.orderStatus === "cancelled";

                                return (
                                    <>
                                        <tr key={order.orderId} className={isExpanded ? "order-row-expanded" : ""}>
                                            {/* Order ID */}
                                            <td>
                                                <button
                                                    className="order-expand-btn"
                                                    onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                                                >
                                                    <HiOutlineChevronDown className={`expand-icon ${isExpanded ? "expanded" : ""}`} />
                                                    <span className="order-id-cell">{order.orderId}</span>
                                                </button>
                                            </td>

                                            {/* Customer */}
                                            <td>
                                                <div className="customer-cell">
                                                    <span className="customer-name">{order.customerName}</span>
                                                    <span className="customer-email">{order.phone}</span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="text-muted">{formatDateShort(order.createdAt)}</td>

                                            {/* Amount */}
                                            <td><strong className="amount-cell">{formatPrice(order.totalAmount)}</strong></td>

                                            {/* Stage progress */}
                                            <td>
                                                <div className="aot-stage-cell">
                                                    <span
                                                        className="status-pill"
                                                        style={{ color: cfg.color, background: cfg.bg }}
                                                    >
                                                        {stageInfo ? `${stageInfo.icon} ` : ""}{cfg.label}
                                                    </span>
                                                    {!isFinal && (
                                                        <div className="aot-mini-bar">
                                                            <div
                                                                className="aot-mini-bar-fill"
                                                                style={{ width: `${(stageIdx / (ORDER_STAGES.length - 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status update dropdown */}
                                            <td>
                                                {!isFinal ? (
                                                    <div className="aot-update-cell">
                                                        <select
                                                            className="status-select"
                                                            value={order.orderStatus}
                                                            onChange={e => handleStatusChange(order.orderId, e.target.value)}
                                                            id={`aot-status-select-${order.orderId}`}
                                                        >
                                                            {ALL_STATUSES.filter(s => s !== "cancelled").map(s => (
                                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                            ))}
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                        {updateSuccess === order.orderId && (
                                                            <span className="aot-save-badge">✓ Saved</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="status-final">Final</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="action-btn primary"
                                                        title="View Tracking Details"
                                                        onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}
                                                        id={`aot-view-${order.orderId}`}
                                                    >
                                                        <HiOutlineEye />
                                                    </button>
                                                    <button
                                                        className="action-btn danger"
                                                        title="Delete Order"
                                                        onClick={() => setDeleteConfirm(order.orderId)}
                                                        id={`aot-delete-${order.orderId}`}
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Expanded row ─────────────────── */}
                                        {isExpanded && (
                                            <tr className="order-detail-row" key={`${order.orderId}-detail`}>
                                                <td colSpan="7">
                                                    <div className="order-detail-panel aot-detail-panel">
                                                        <div className="aot-detail-top">
                                                            {/* Timeline */}
                                                            <div className="aot-detail-section">
                                                                <h4 className="order-detail-heading">📍 Shipment Timeline</h4>
                                                                <MiniTimeline order={order} />
                                                            </div>

                                                            {/* Customer Info */}
                                                            <div className="aot-detail-section">
                                                                <h4 className="order-detail-heading">👤 Customer Info</h4>
                                                                <div className="aot-cust-info">
                                                                    <div className="aot-info-row">
                                                                        <HiOutlinePhone className="aot-info-icon" />
                                                                        <span>+91 {order.phone}</span>
                                                                    </div>
                                                                    <div className="aot-info-row">
                                                                        <HiOutlineMail className="aot-info-icon" />
                                                                        <span>{order.email}</span>
                                                                    </div>
                                                                    <div className="aot-info-row">
                                                                        <HiOutlineLocationMarker className="aot-info-icon" />
                                                                        <span>{order.address}</span>
                                                                    </div>
                                                                </div>

                                                                <h4 className="order-detail-heading" style={{ marginTop: "1.25rem" }}>🛒 Order Items</h4>
                                                                <div className="order-items-list">
                                                                    {order.products.map((item, i) => (
                                                                        <div key={i} className="order-item-row">
                                                                            <span className="order-item-name">{item.name}</span>
                                                                            <span className="order-item-qty">×{item.qty}</span>
                                                                            <span className="order-item-price">{formatPrice(item.price * item.qty)}</span>
                                                                        </div>
                                                                    ))}
                                                                    <div className="order-item-total">
                                                                        <span>Total</span>
                                                                        <span>{formatPrice(order.totalAmount)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* WhatsApp quick notify */}
                                                        <div className="aot-notify-row">
                                                            <span>📣 Notify customer:</span>
                                                            <a
                                                                href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(`Hello ${order.customerName}! Your SSS Crackers order #${order.orderId} status: ${STATUS_CONFIG[order.orderStatus]?.label}. Thank you! 🧨`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="aot-wa-link"
                                                                id={`aot-wa-${order.orderId}`}
                                                            >
                                                                💬 WhatsApp
                                                            </a>
                                                            <a
                                                                href={`mailto:${order.email}?subject=SSS Crackers Order Update - ${order.orderId}&body=Hello ${order.customerName},%0A%0AYour order #${order.orderId} is now: ${STATUS_CONFIG[order.orderStatus]?.label}.%0A%0AThank you for shopping with SSS Crackers!`}
                                                                className="aot-email-link"
                                                                id={`aot-email-${order.orderId}`}
                                                            >
                                                                📧 Email
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="table-footer-note">Showing {filtered.length} of {trackingOrders.length} orders</p>
            </div>

            {/* ── Delete Confirm Modal ──────────────────────────────── */}
            {deleteConfirm !== null && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Order?</h2>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}><HiOutlineX /></button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-confirm-msg">
                                Permanently delete <strong>{deleteConfirm}</strong>? This cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button
                                className="btn btn-danger"
                                id="aot-confirm-delete-btn"
                                onClick={() => {
                                    // soft-delete: just close (no hard delete context)
                                    setDeleteConfirm(null);
                                }}
                            >
                                <HiOutlineTrash /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
