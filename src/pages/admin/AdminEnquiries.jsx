import { useState, useEffect, useCallback } from "react";
import {
    HiOutlineSearch, HiOutlineX, HiOutlineTrash, HiOutlineEye,
    HiOutlineDownload, HiOutlineCog, HiOutlineCheck,
    HiOutlineChevronDown, HiOutlineClock, HiOutlinePhone,
} from "react-icons/hi";
import { formatPrice } from "../../utils/helpers";
import {
    getEnquiries, updateEnquiryStatus, deleteEnquiry,
    downloadEnquiriesCSV, getWhatsAppNumber, setWhatsAppNumber,
} from "../../utils/whatsapp";
import "./AdminEnquiries.css";

const STATUS_CONFIG = {
    new: { label: "New", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    contacted: { label: "Contacted", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    confirmed: { label: "Confirmed", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    completed: { label: "Completed", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function AdminEnquiries() {
    const [enquiries, setEnquiries] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [waNumber, setWaNumber] = useState(getWhatsAppNumber());
    const [numberSaved, setNumberSaved] = useState(false);

    // Load enquiries
    useEffect(() => {
        setEnquiries(getEnquiries());
    }, []);

    // Refresh from localStorage
    const refresh = useCallback(() => {
        setEnquiries(getEnquiries());
    }, []);

    const handleStatusChange = (id, status) => {
        const updated = updateEnquiryStatus(id, status);
        setEnquiries(updated);
    };

    const handleDelete = (id) => {
        const updated = deleteEnquiry(id);
        setEnquiries(updated);
        setDeleteConfirm(null);
    };

    const handleSaveNumber = () => {
        setWhatsAppNumber(waNumber);
        setNumberSaved(true);
        setTimeout(() => setNumberSaved(false), 2000);
    };

    // Filter
    const filtered = enquiries
        .filter(e => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                e.id?.toLowerCase().includes(q) ||
                e.customer?.name?.toLowerCase().includes(q) ||
                e.customer?.phone?.includes(q);
            const matchStatus = !statusFilter || e.status === statusFilter;
            return matchSearch && matchStatus;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Stats
    const stats = {
        total: enquiries.length,
        new: enquiries.filter(e => e.status === "new").length,
        confirmed: enquiries.filter(e => e.status === "confirmed").length,
        totalRevenue: enquiries
            .filter(e => e.status === "confirmed" || e.status === "completed")
            .reduce((s, e) => s + (e.total || 0), 0),
    };

    return (
        <div className="admin-page">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">WhatsApp Enquiries</h1>
                    <p className="admin-page-sub">
                        {stats.total} total · {stats.new} new · {stats.confirmed} confirmed
                    </p>
                </div>
                <div className="enq-header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowSettings(!showSettings)}
                        title="Settings"
                    >
                        <HiOutlineCog /> Settings
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={downloadEnquiriesCSV}
                        disabled={enquiries.length === 0}
                    >
                        <HiOutlineDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* ── Settings Panel ────────────────────────────────────── */}
            {showSettings && (
                <div className="admin-card enq-settings-card">
                    <h3 className="admin-card-title" style={{ padding: "0 16px", paddingTop: "16px" }}>
                        <HiOutlineCog /> WhatsApp Settings
                    </h3>
                    <div className="enq-settings-body">
                        <div className="enq-setting-row">
                            <label className="enq-setting-label">
                                <HiOutlinePhone className="enq-setting-icon" />
                                Store WhatsApp Number
                            </label>
                            <div className="enq-setting-input-row">
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={waNumber}
                                    onChange={e => setWaNumber(e.target.value)}
                                    placeholder="919876543210 (country code + number)"
                                    style={{ maxWidth: 300 }}
                                />
                                <button
                                    className={`btn ${numberSaved ? "btn-outline" : "btn-primary"}`}
                                    onClick={handleSaveNumber}
                                    style={{ minWidth: 100 }}
                                >
                                    {numberSaved ? <><HiOutlineCheck /> Saved!</> : "Save"}
                                </button>
                            </div>
                            <p className="enq-setting-hint">
                                Format: Country code + number, e.g., 919876543210 for +91 98765 43210
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── KPI Cards ────────────────────────────────────────── */}
            <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div className="kpi-card" style={{ "--accent": "#3b82f6", "--glow": "rgba(59,130,246,0.2)" }}>
                    <div className="kpi-body">
                        <p className="kpi-label">Total Enquiries</p>
                        <p className="kpi-value">{stats.total}</p>
                    </div>
                </div>
                <div className="kpi-card" style={{ "--accent": "#ff6a00", "--glow": "rgba(255,106,0,0.2)" }}>
                    <div className="kpi-body">
                        <p className="kpi-label">New (Unhandled)</p>
                        <p className="kpi-value">{stats.new}</p>
                    </div>
                </div>
                <div className="kpi-card" style={{ "--accent": "#10b981", "--glow": "rgba(16,185,129,0.2)" }}>
                    <div className="kpi-body">
                        <p className="kpi-label">Confirmed</p>
                        <p className="kpi-value">{stats.confirmed}</p>
                    </div>
                </div>
                <div className="kpi-card" style={{ "--accent": "#8b5cf6", "--glow": "rgba(139,92,246,0.2)" }}>
                    <div className="kpi-body">
                        <p className="kpi-label">Est. Revenue</p>
                        <p className="kpi-value">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* ── Status Chips ──────────────────────────────────────── */}
            <div className="order-status-chips">
                <button
                    className={`order-chip ${!statusFilter ? "order-chip-active" : ""}`}
                    onClick={() => setStatusFilter("")}
                >
                    All ({enquiries.length})
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = enquiries.filter(e => e.status === key).length;
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

            {/* ── Search ────────────────────────────────────────────── */}
            <div className="admin-card" style={{ marginBottom: "1rem" }}>
                <div className="prod-search-wrap">
                    <HiOutlineSearch className="prod-search-icon" />
                    <input
                        type="text"
                        className="prod-search-input"
                        placeholder="Search by enquiry ID, customer name, or phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="prod-search-clear" onClick={() => setSearch("")}>
                            <HiOutlineX />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Enquiries Table ────────────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Enquiry ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-table-empty">
                                        {enquiries.length === 0
                                            ? "No WhatsApp enquiries yet. They will appear here when customers order via WhatsApp."
                                            : "No enquiries match your search."}
                                    </td>
                                </tr>
                            ) : filtered.map(enq => {
                                const cfg = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
                                const isExpanded = expandedId === enq.id;
                                const itemCount = enq.items?.reduce((s, i) => s + i.quantity, 0) || 0;
                                return (
                                    <>
                                        <tr key={enq.id} className={isExpanded ? "order-row-expanded" : ""}>
                                            <td>
                                                <button
                                                    className="order-expand-btn"
                                                    onClick={() => setExpandedId(isExpanded ? null : enq.id)}
                                                >
                                                    <HiOutlineChevronDown className={`expand-icon ${isExpanded ? "expanded" : ""}`} />
                                                    <span className="order-id-cell">{enq.id}</span>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="customer-cell">
                                                    <span className="customer-name">{enq.customer?.name || "—"}</span>
                                                    <span className="customer-email">{enq.customer?.phone || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted">
                                                {new Date(enq.timestamp).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric",
                                                })}
                                            </td>
                                            <td className="text-muted">{itemCount} items</td>
                                            <td><strong className="amount-cell">{formatPrice(enq.total || 0)}</strong></td>
                                            <td>
                                                <select
                                                    className="status-select"
                                                    value={enq.status}
                                                    onChange={e => handleStatusChange(enq.id, e.target.value)}
                                                    style={{ color: cfg.color }}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                        <option key={k} value={k}>{v.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="action-btn primary"
                                                        title="View Details"
                                                        onClick={() => setExpandedId(isExpanded ? null : enq.id)}
                                                    >
                                                        <HiOutlineEye />
                                                    </button>
                                                    <button
                                                        className="action-btn danger"
                                                        title="Delete"
                                                        onClick={() => setDeleteConfirm(enq.id)}
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <tr className="order-detail-row" key={`${enq.id}-detail`}>
                                                <td colSpan="7">
                                                    <div className="order-detail-panel">
                                                        <div className="order-detail-grid">
                                                            <div className="order-detail-section">
                                                                <h4 className="order-detail-heading">Items Ordered</h4>
                                                                <div className="order-items-list">
                                                                    {enq.items?.map((item, idx) => (
                                                                        <div className="order-item-row" key={idx}>
                                                                            <span className="order-item-name">{item.name}</span>
                                                                            <span className="order-item-qty">×{item.quantity}</span>
                                                                            <span className="order-item-price">
                                                                                {formatPrice(item.price * item.quantity)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="order-item-total">
                                                                    <span>Total</span>
                                                                    <span>{formatPrice(enq.total || 0)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="order-detail-section">
                                                                <h4 className="order-detail-heading">Customer Info</h4>
                                                                <div className="order-detail-info">
                                                                    <div className="detail-info-row">
                                                                        <span>Name</span>
                                                                        <span>{enq.customer?.name || "—"}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Phone</span>
                                                                        <span>{enq.customer?.phone || "—"}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Address</span>
                                                                        <span>{enq.customer?.address || "—"}</span>
                                                                    </div>
                                                                    <div className="detail-info-row">
                                                                        <span>Enquiry Time</span>
                                                                        <span>
                                                                            {new Date(enq.timestamp).toLocaleString("en-IN")}
                                                                        </span>
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
                <p className="table-footer-note">
                    Showing {filtered.length} of {enquiries.length} enquiries
                </p>
            </div>

            {/* ── Delete Confirm Modal ──────────────────────────────── */}
            {deleteConfirm !== null && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Enquiry?</h2>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-confirm-msg">
                                Are you sure you want to delete enquiry <strong>{deleteConfirm}</strong>?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                                <HiOutlineTrash /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
