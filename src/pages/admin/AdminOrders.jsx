import { useState } from "react";
import {
    HiOutlineSearch, HiOutlineX, HiOutlineTrash,
    HiOutlineEye, HiOutlineChevronDown,
} from "react-icons/hi";
import { useAdminData } from "../../context/AdminDataContext";
import { formatPrice } from "../../utils/helpers";
import "./AdminOrders.css";

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    processing: { label: "Processing", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    shipped: { label: "Shipped", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"];

export default function AdminOrders() {
    const { orders, updateOrderStatus, deleteOrder, stats } = useAdminData();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ── Filter ──────────────────────────────────────────────────────────────
    const filtered = orders
        .filter(o => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                o.id.toLowerCase().includes(q) ||
                o.customer.name.toLowerCase().includes(q) ||
                o.customer.email.toLowerCase().includes(q);
            const matchStatus = !statusFilter || o.status === statusFilter;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="admin-page">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Orders</h1>
                    <p className="admin-page-sub">
                        {stats.totalOrders} total · {stats.pendingOrders} pending · {stats.deliveredOrders} delivered
                    </p>
                </div>
            </div>

            {/* ── Status Summary Chips ─────────────────────────────── */}
            <div className="order-status-chips">
                <button
                    className={`order-chip ${!statusFilter ? "order-chip-active" : ""}`}
                    onClick={() => setStatusFilter("")}
                >
                    All ({orders.length})
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = orders.filter(o => o.status === key).length;
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

            {/* ── Search ──────────────────────────────────────────── */}
            <div className="admin-card">
                <div className="prod-search-wrap">
                    <HiOutlineSearch className="prod-search-icon" />
                    <input
                        type="text"
                        className="prod-search-input"
                        placeholder="Search by order ID, customer name, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="order-search"
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
                                <th>Status</th>
                                <th>Update Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-table-empty">
                                        No orders found
                                    </td>
                                </tr>
                            ) : filtered.map(order => {
                                const cfg = STATUS_CONFIG[order.status];
                                const isExpanded = expandedOrder === order.id;
                                return (
                                    <>
                                        <tr key={order.id} id={`order-row-${order.id}`}
                                            className={isExpanded ? "order-row-expanded" : ""}>
                                            <td>
                                                <button
                                                    className="order-expand-btn"
                                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                    title="View details"
                                                >
                                                    <HiOutlineChevronDown className={`expand-icon ${isExpanded ? "expanded" : ""}`} />
                                                    <span className="order-id-cell">{order.id}</span>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="customer-cell">
                                                    <span className="customer-name">{order.customer.name}</span>
                                                    <span className="customer-email">{order.customer.email}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted">{order.date}</td>
                                            <td><strong className="amount-cell">{formatPrice(order.total)}</strong></td>
                                            <td>
                                                <span className="status-pill"
                                                    style={{ color: cfg.color, background: cfg.bg }}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td>
                                                {order.status !== "cancelled" && order.status !== "delivered" ? (
                                                    <select
                                                        className="status-select"
                                                        value={order.status}
                                                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                        id={`status-select-${order.id}`}
                                                    >
                                                        {STATUS_FLOW.map(s => (
                                                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                        ))}
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                ) : (
                                                    <span className="status-final">Final</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="action-btn primary"
                                                        title="View Details"
                                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                    >
                                                        <HiOutlineEye />
                                                    </button>
                                                    <button
                                                        className="action-btn danger"
                                                        title="Delete Order"
                                                        onClick={() => setDeleteConfirm(order.id)}
                                                        id={`delete-order-${order.id}`}
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Expanded Row Details ─────────────── */}
                                        {isExpanded && (
                                            <tr className="order-detail-row" key={`${order.id}-detail`}>
                                                <td colSpan="7">
                                                    <div className="order-detail-panel">
                                                        <div className="order-detail-grid">
                                                            {/* Items */}
                                                            <div className="order-detail-section">
                                                                <h4 className="order-detail-heading">Items Ordered</h4>
                                                                <div className="order-items-list">
                                                                    {order.items.map(item => (
                                                                        <div className="order-item-row" key={item.id}>
                                                                            <span className="order-item-name">{item.name}</span>
                                                                            <span className="order-item-qty">×{item.qty}</span>
                                                                            <span className="order-item-price">{formatPrice(item.price * item.qty)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="order-item-total">
                                                                    <span>Total</span>
                                                                    <span>{formatPrice(order.total)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Customer & Shipping */}
                                                            <div className="order-detail-section">
                                                                <h4 className="order-detail-heading">Customer Info</h4>
                                                                <div className="order-detail-info">
                                                                    <div className="detail-info-row">
                                                                        <span>Name</span>
                                                                        <span>{order.customer.name}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Email</span>
                                                                        <span>{order.customer.email}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Phone</span>
                                                                        <span>+91 {order.customer.phone}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Address</span>
                                                                        <span>{order.address}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Payment ID</span>
                                                                        <span className="mono-text">{order.paymentId}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
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
                <p className="table-footer-note">Showing {filtered.length} of {orders.length} orders</p>
            </div>

            {/* ── Delete Confirm Modal ─────────────────────────────── */}
            {deleteConfirm !== null && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Order?</h2>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-confirm-msg">
                                Are you sure you want to permanently delete order <strong>{deleteConfirm}</strong>?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" id="confirm-delete-order-btn"
                                onClick={() => { deleteOrder(deleteConfirm); setDeleteConfirm(null); }}>
                                <HiOutlineTrash /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
