import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    HiOutlineDocumentText,
    HiOutlineSearch,
    HiOutlineDownload,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineCalendar,
    HiOutlineCurrencyRupee,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineClipboardCopy,
} from "react-icons/hi";
import { useInvoices } from "../../context/InvoiceContext";
import { formatPrice } from "../../utils/helpers";
import "./AdminInvoices.css";

export default function AdminInvoices() {
    const { invoices, deleteInvoice } = useInvoices();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // ── Filtering ──────────────────────────────────────────────────────
    const filteredInvoices = useMemo(() => {
        let result = [...invoices];

        // Search by invoiceId, orderId, customer name, phone
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (inv) =>
                    inv.invoiceId.toLowerCase().includes(q) ||
                    inv.orderId.toLowerCase().includes(q) ||
                    inv.customer.name.toLowerCase().includes(q) ||
                    inv.customer.phone.includes(q)
            );
        }

        // Period filter
        if (filterPeriod !== "all") {
            const now = new Date();
            result = result.filter((inv) => {
                const d = new Date(inv.date);
                switch (filterPeriod) {
                    case "today":
                        return d.toDateString() === now.toDateString();
                    case "week": {
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return d >= weekAgo;
                    }
                    case "month": {
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }
                    default:
                        return true;
                }
            });
        }

        return result;
    }, [invoices, searchQuery, filterPeriod]);

    // ── Stats ──────────────────────────────────────────────────────────
    const totalRevenue = invoices.reduce((s, inv) => s + inv.totalAmount, 0);
    const todayInvoices = invoices.filter(
        (inv) => new Date(inv.date).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todayInvoices.reduce((s, inv) => s + inv.totalAmount, 0);

    // ── Handlers ───────────────────────────────────────────────────────
    function handleView(invoiceId) {
        window.open(`/invoice/${invoiceId}`, "_blank");
    }

    function handleDelete(invoiceId) {
        deleteInvoice(invoiceId);
        setDeleteConfirm(null);
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function handleExportCSV() {
        const headers = ["Invoice ID", "Order ID", "Date", "Customer", "Phone", "Products", "Total", "Payment"];
        const rows = filteredInvoices.map((inv) => [
            inv.invoiceId,
            inv.orderId,
            new Date(inv.date).toLocaleDateString("en-IN"),
            inv.customer.name,
            inv.customer.phone,
            inv.products.length,
            inv.totalAmount,
            inv.paymentMethod,
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SSS-Crackers-Invoices-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="admin-invoices">
            {/* Stats */}
            <div className="ai-stats-row">
                <div className="ai-stat-card">
                    <div className="ai-stat-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
                        <HiOutlineDocumentText />
                    </div>
                    <div>
                        <p className="ai-stat-value">{invoices.length}</p>
                        <p className="ai-stat-label">Total Invoices</p>
                    </div>
                </div>
                <div className="ai-stat-card">
                    <div className="ai-stat-icon" style={{ background: "rgba(74, 222, 128, 0.12)", color: "#4ade80" }}>
                        <HiOutlineCurrencyRupee />
                    </div>
                    <div>
                        <p className="ai-stat-value">{formatPrice(totalRevenue)}</p>
                        <p className="ai-stat-label">Total Revenue</p>
                    </div>
                </div>
                <div className="ai-stat-card">
                    <div className="ai-stat-icon" style={{ background: "rgba(255, 140, 0, 0.12)", color: "#ff8c00" }}>
                        <HiOutlineCalendar />
                    </div>
                    <div>
                        <p className="ai-stat-value">{todayInvoices.length}</p>
                        <p className="ai-stat-label">Today's Invoices</p>
                    </div>
                </div>
                <div className="ai-stat-card">
                    <div className="ai-stat-icon" style={{ background: "rgba(236, 72, 153, 0.12)", color: "#ec4899" }}>
                        <HiOutlineCurrencyRupee />
                    </div>
                    <div>
                        <p className="ai-stat-value">{formatPrice(todayRevenue)}</p>
                        <p className="ai-stat-label">Today's Revenue</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="ai-toolbar">
                <div className="ai-search-wrap">
                    <HiOutlineSearch className="ai-search-icon" />
                    <input
                        type="text"
                        className="ai-search"
                        placeholder="Search by invoice ID, order ID, name, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="invoice-search"
                    />
                </div>

                <div className="ai-toolbar-right">
                    <select
                        className="ai-filter-select"
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        id="invoice-period-filter"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    <button
                        className="btn btn-primary ai-export-btn"
                        onClick={handleExportCSV}
                        id="export-invoices-btn"
                    >
                        <HiOutlineDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="ai-table-wrap">
                {filteredInvoices.length === 0 ? (
                    <div className="ai-empty">
                        <span className="ai-empty-icon">🧾</span>
                        <p>No invoices found</p>
                    </div>
                ) : (
                    <table className="ai-table" id="invoices-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Order</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.invoiceId}>
                                    <td>
                                        <div className="ai-id-cell">
                                            <span className="ai-invoice-badge">{inv.invoiceId}</span>
                                            <button
                                                className="ai-copy-btn"
                                                onClick={() => handleCopy(inv.invoiceId)}
                                                title="Copy"
                                            >
                                                {copiedId === inv.invoiceId ? (
                                                    <HiOutlineCheck />
                                                ) : (
                                                    <HiOutlineClipboardCopy />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ai-order-id">{inv.orderId}</span>
                                    </td>
                                    <td>
                                        <div className="ai-date-cell">
                                            <span className="ai-date">
                                                {new Date(inv.date).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <span className="ai-time">
                                                {new Date(inv.date).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ai-customer-cell">
                                            <span className="ai-customer-name">{inv.customer.name}</span>
                                            <span className="ai-customer-phone">{inv.customer.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ai-items-count">
                                            {inv.products.reduce((s, p) => s + p.quantity, 0)} items
                                        </span>
                                    </td>
                                    <td>
                                        <span className="ai-amount">{formatPrice(inv.totalAmount)}</span>
                                        {inv.couponDiscount > 0 && (
                                            <span className="ai-discount-note">
                                                −{formatPrice(inv.couponDiscount)}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`ai-method-badge ai-method-${inv.paymentMethod}`}>
                                            {inv.paymentMethod === "online" ? "💳 Online" : "📱 WhatsApp"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ai-actions">
                                            <button
                                                className="ai-action-btn ai-view"
                                                onClick={() => handleView(inv.invoiceId)}
                                                title="View Invoice"
                                                id={`view-invoice-${inv.invoiceId}`}
                                            >
                                                <HiOutlineEye />
                                            </button>
                                            {deleteConfirm === inv.invoiceId ? (
                                                <div className="ai-delete-confirm">
                                                    <button
                                                        className="ai-action-btn ai-delete-yes"
                                                        onClick={() => handleDelete(inv.invoiceId)}
                                                    >
                                                        <HiOutlineCheck />
                                                    </button>
                                                    <button
                                                        className="ai-action-btn ai-delete-no"
                                                        onClick={() => setDeleteConfirm(null)}
                                                    >
                                                        <HiOutlineX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="ai-action-btn ai-delete"
                                                    onClick={() => setDeleteConfirm(inv.invoiceId)}
                                                    title="Delete"
                                                    id={`delete-invoice-${inv.invoiceId}`}
                                                >
                                                    <HiOutlineTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
