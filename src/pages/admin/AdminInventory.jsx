import { useState } from "react";
import {
    HiOutlineSearch, HiOutlineX, HiOutlineExclamationCircle,
    HiOutlineCheckCircle, HiOutlineBan, HiOutlinePencil, HiOutlineCheck,
    HiOutlineCube, HiOutlineFilter,
} from "react-icons/hi";
import { useAdminData } from "../../context/AdminDataContext";
import { formatPrice } from "../../utils/helpers";
import { categories } from "../../data/products";
import "./AdminInventory.css";

const LOW_STOCK = 10;

export default function AdminInventory() {
    const { products, updateProduct } = useAdminData();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [stockFilter, setStockFilter] = useState(""); // "low" | "out" | "in"
    const [editingId, setEditingId] = useState(null);
    const [editStock, setEditStock] = useState("");
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const matchCat = !categoryFilter || p.categorySlug === categoryFilter;
        let matchStock = true;
        if (stockFilter === "out") matchStock = p.stock === 0;
        else if (stockFilter === "low") matchStock = p.stock > 0 && p.stock <= LOW_STOCK;
        else if (stockFilter === "in") matchStock = p.stock > LOW_STOCK;
        return matchSearch && matchCat && matchStock;
    });

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const inStockCount = products.filter(p => p.stock > LOW_STOCK).length;

    function startEdit(p) {
        setEditingId(p.id);
        setEditStock(String(p.stock));
    }

    function saveEdit(id) {
        const v = parseInt(editStock, 10);
        if (!isNaN(v) && v >= 0) {
            updateProduct(id, { stock: v });
        }
        setEditingId(null);
    }

    function getStockStatus(stock) {
        if (stock === 0) return { label: "Out of Stock", cls: "out", icon: HiOutlineBan };
        if (stock <= LOW_STOCK) return { label: "Low Stock", cls: "low", icon: HiOutlineExclamationCircle };
        return { label: "In Stock", cls: "in", icon: HiOutlineCheckCircle };
    }

    return (
        <div className="admin-page">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Inventory Management</h1>
                    <p className="admin-page-sub">
                        {products.length} total products · Low stock threshold: {LOW_STOCK} items
                    </p>
                </div>
            </div>

            {/* ── Stock Summary Cards ────────────────────────────── */}
            <div className="inv-summary-grid">
                <button
                    className={`inv-summary-card ${stockFilter === "in" ? "active-in" : ""}`}
                    onClick={() => { setStockFilter(stockFilter === "in" ? "" : "in"); setPage(1); }}
                    id="filter-in-stock"
                >
                    <HiOutlineCheckCircle className="inv-summary-icon" style={{ color: "#10b981" }} />
                    <div>
                        <p className="inv-summary-value" style={{ color: "#10b981" }}>{inStockCount}</p>
                        <p className="inv-summary-label">In Stock</p>
                    </div>
                </button>
                <button
                    className={`inv-summary-card ${stockFilter === "low" ? "active-low" : ""}`}
                    onClick={() => { setStockFilter(stockFilter === "low" ? "" : "low"); setPage(1); }}
                    id="filter-low-stock"
                >
                    <HiOutlineExclamationCircle className="inv-summary-icon" style={{ color: "#f59e0b" }} />
                    <div>
                        <p className="inv-summary-value" style={{ color: "#f59e0b" }}>{lowStockCount}</p>
                        <p className="inv-summary-label">Low Stock (≤{LOW_STOCK})</p>
                    </div>
                </button>
                <button
                    className={`inv-summary-card ${stockFilter === "out" ? "active-out" : ""}`}
                    onClick={() => { setStockFilter(stockFilter === "out" ? "" : "out"); setPage(1); }}
                    id="filter-out-stock"
                >
                    <HiOutlineBan className="inv-summary-icon" style={{ color: "#ef4444" }} />
                    <div>
                        <p className="inv-summary-value" style={{ color: "#ef4444" }}>{outOfStockCount}</p>
                        <p className="inv-summary-label">Out of Stock</p>
                    </div>
                </button>
                <div className="inv-summary-card">
                    <HiOutlineCube className="inv-summary-icon" style={{ color: "#8b5cf6" }} />
                    <div>
                        <p className="inv-summary-value" style={{ color: "#8b5cf6" }}>
                            {products.reduce((s, p) => s + p.stock, 0).toLocaleString()}
                        </p>
                        <p className="inv-summary-label">Total Units</p>
                    </div>
                </div>
            </div>

            {/* ── Filters ───────────────────────────────────────── */}
            <div className="admin-card prod-filters">
                <div className="prod-search-wrap">
                    <HiOutlineSearch className="prod-search-icon" />
                    <input
                        type="text"
                        className="prod-search-input"
                        placeholder="Search by product name or category..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        id="inventory-search"
                    />
                    {search && (
                        <button className="prod-search-clear" onClick={() => setSearch("")}>
                            <HiOutlineX />
                        </button>
                    )}
                </div>
                <select
                    className="prod-cat-filter"
                    value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    id="inventory-cat-filter"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                    ))}
                </select>
                {(stockFilter || categoryFilter || search) && (
                    <button
                        className="inv-clear-filter-btn"
                        onClick={() => { setStockFilter(""); setCategoryFilter(""); setSearch(""); setPage(1); }}
                    >
                        <HiOutlineFilter /> Clear Filters
                    </button>
                )}
            </div>

            {/* ── Low Stock Alert Banner ─────────────────────────── */}
            {lowStockCount > 0 && !stockFilter && (
                <div className="inv-alert-banner">
                    <HiOutlineExclamationCircle className="inv-alert-icon" />
                    <span>
                        <strong>{lowStockCount} products</strong> are running low on stock. Update inventory before they run out.
                    </span>
                </div>
            )}

            {/* ── Inventory Table ────────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Qty</th>
                                <th>Status</th>
                                <th>Update Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="admin-table-empty">No products found</td>
                                </tr>
                            ) : paged.map(p => {
                                const status = getStockStatus(p.stock);
                                const StatusIcon = status.icon;
                                const isEditing = editingId === p.id;
                                return (
                                    <tr key={p.id} id={`inv-row-${p.id}`}>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontWeight: 600, color: "#e0e0e8" }}>{p.name}</span>
                                                <span style={{ fontSize: "0.74rem", color: "#555588" }}>/{p.slug}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="prod-cat-pill">{p.category}</span>
                                        </td>
                                        <td>
                                            <span className="prod-sale-price">{formatPrice(p.price)}</span>
                                        </td>
                                        <td>
                                            <div className="inv-stock-cell">
                                                <div className="inv-stock-bar-wrap">
                                                    <div
                                                        className="inv-stock-bar-fill"
                                                        style={{
                                                            width: `${Math.min(100, (p.stock / 200) * 100)}%`,
                                                            background: p.stock === 0 ? "#ef4444" : p.stock <= LOW_STOCK ? "#f59e0b" : "#10b981",
                                                        }}
                                                    />
                                                </div>
                                                <span className="inv-stock-num">{p.stock}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`inv-status-badge ${status.cls}`}>
                                                <StatusIcon />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <div className="inv-edit-row">
                                                    <input
                                                        type="number"
                                                        className="inv-stock-input"
                                                        value={editStock}
                                                        onChange={e => setEditStock(e.target.value)}
                                                        min="0"
                                                        autoFocus
                                                        id={`stock-input-${p.id}`}
                                                    />
                                                    <button
                                                        className="action-btn primary"
                                                        onClick={() => saveEdit(p.id)}
                                                        title="Save"
                                                        id={`save-stock-${p.id}`}
                                                    >
                                                        <HiOutlineCheck />
                                                    </button>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => setEditingId(null)}
                                                        title="Cancel"
                                                    >
                                                        <HiOutlineX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="action-btn primary"
                                                    title="Update Stock"
                                                    onClick={() => startEdit(p)}
                                                    id={`edit-stock-${p.id}`}
                                                >
                                                    <HiOutlinePencil /> Update
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="inv-pagination">
                    <span className="inv-page-info">
                        Showing {Math.min(filtered.length, (page - 1) * PER_PAGE + 1)}–{Math.min(filtered.length, page * PER_PAGE)} of {filtered.length} products
                    </span>
                    <div className="inv-page-btns">
                        <button
                            className="inv-page-btn"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            ← Prev
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                            const num = start + i;
                            if (num > totalPages) return null;
                            return (
                                <button
                                    key={num}
                                    className={`inv-page-btn ${page === num ? "active" : ""}`}
                                    onClick={() => setPage(num)}
                                >
                                    {num}
                                </button>
                            );
                        })}
                        <button
                            className="inv-page-btn"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
