import { useState } from "react";
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineSearch, HiOutlineX, HiOutlineCheck,
} from "react-icons/hi";
import { useAdminData } from "../../context/AdminDataContext";
import { formatPrice } from "../../utils/helpers";
import { categories } from "../../data/products";
import "./AdminProducts.css";

const EMPTY_FORM = {
    name: "", slug: "", description: "", price: "", boxContent: "",
    category: "", categorySlug: "", stock: "", rating: 4.5, numReviews: 0,
};

const CATEGORY_EMOJIS = {
    "one-sound-crackers": "💥",
    "deluxe-crackers": "🎆",
    "giant-chorsa": "⚡",
    "bijili-crackers": "🔥",
    "ground-chakkar": "🌀",
    "flower-pots": "🌸",
    "garland-bang-crackers": "🧨",
    "pencil": "✏️",
    "bombs": "💣",
    "twinkling-star": "⭐",
    "stone-cartoon": "🎭",
    "rockets": "🚀",
    "aerial-fancy": "🎇",
    "special-fountain": "⛲",
    "repeating-cake": "🎂",
    "fancy-items": "🎁",
    "sparklers": "✨",
    "musical-shot": "🎵",
    "special-items": "📦",
};

const COLORS = [
    ["#ff6a00", "#ee0979"], ["#f7971e", "#ffd200"], ["#00c6ff", "#0072ff"],
    ["#11998e", "#38ef7d"], ["#fc5c7d", "#6a82fb"], ["#f953c6", "#b91d73"],
    ["#9b59b6", "#3498db"], ["#e44d26", "#f16529"],
];
const getGradient = id => {
    const [a, b] = COLORS[id % COLORS.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
};

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct } = useAdminData();

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const matchCat = !categoryFilter || p.categorySlug === categoryFilter;
        return matchSearch && matchCat;
    });

    // ── Handlers ─────────────────────────────────────────────────────────────
    function openAdd() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormErrors({});
        setShowModal(true);
    }

    function openEdit(product) {
        setEditingId(product.id);
        setForm({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            boxContent: product.boxContent || "",
            category: product.category,
            categorySlug: product.categorySlug,
            stock: product.stock,
            rating: product.rating,
            numReviews: product.numReviews,
        });
        setFormErrors({});
        setShowModal(true);
    }

    function handleCategorySelect(e) {
        const cat = categories.find(c => c.slug === e.target.value);
        if (cat) {
            setForm(f => ({ ...f, category: cat.name, categorySlug: cat.slug }));
        }
    }

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required";
        if (!form.description.trim()) errs.description = "Description is required";
        if (!form.price || Number(form.price) <= 0) errs.price = "Valid price required";
        if (!form.categorySlug) errs.categorySlug = "Select a category";
        if (!form.stock || Number(form.stock) < 0) errs.stock = "Valid stock required";
        return errs;
    }

    function handleSave() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

        const payload = {
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
            rating: Number(form.rating),
            numReviews: Number(form.numReviews),
            slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        };

        if (editingId !== null) {
            updateProduct(editingId, payload);
        } else {
            addProduct(payload);
        }
        setShowModal(false);
    }

    function handleDeleteConfirmed() {
        deleteProduct(deleteConfirm);
        setDeleteConfirm(null);
    }

    const fieldChange = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        if (formErrors[k]) setFormErrors(e => ({ ...e, [k]: "" }));
    };

    return (
        <div className="admin-page">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Products</h1>
                    <p className="admin-page-sub">{products.length} products in catalogue</p>
                </div>
                <button className="btn btn-primary" id="add-product-btn" onClick={openAdd}>
                    <HiOutlinePlus /> Add Product
                </button>
            </div>

            {/* ── Filters ─────────────────────────────────────────── */}
            <div className="admin-card prod-filters">
                <div className="prod-search-wrap">
                    <HiOutlineSearch className="prod-search-icon" />
                    <input
                        type="text"
                        className="prod-search-input"
                        placeholder="Search by name or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="product-search"
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
                    onChange={e => setCategoryFilter(e.target.value)}
                    id="category-filter"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                    ))}
                </select>
            </div>

            {/* ── Products Table ───────────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Box Content</th>
                                <th>Stock</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-table-empty">
                                        No products found
                                    </td>
                                </tr>
                            ) : filtered.map(p => {
                                const emoji = CATEGORY_EMOJIS[p.categorySlug] || "🧨";
                                return (
                                    <tr key={p.id} id={`product-row-${p.id}`}>
                                        <td>
                                            <div className="prod-cell">
                                                <div className="prod-thumb" style={{ background: getGradient(p.id) }}>
                                                    <span>{emoji}</span>
                                                </div>
                                                <div>
                                                    <p className="prod-name">{p.name}</p>
                                                    <p className="prod-slug">/{p.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="prod-cat-pill">{p.category}</span>
                                        </td>
                                        <td>
                                            <span className="prod-sale-price">{formatPrice(p.price)}</span>
                                        </td>
                                        <td>
                                            <span className="prod-box-content">{p.boxContent}</span>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${p.stock > 50 ? "high" : p.stock > 10 ? "mid" : "low"}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="rating-cell">⭐ {p.rating}</span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="action-btn primary"
                                                    title="Edit"
                                                    onClick={() => openEdit(p)}
                                                    id={`edit-product-${p.id}`}
                                                >
                                                    <HiOutlinePencil />
                                                </button>
                                                <button
                                                    className="action-btn danger"
                                                    title="Delete"
                                                    onClick={() => setDeleteConfirm(p.id)}
                                                    id={`delete-product-${p.id}`}
                                                >
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="table-footer-note">Showing {filtered.length} of {products.length} products</p>
            </div>

            {/* ── Add/Edit Modal ───────────────────────────────────── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingId !== null ? "Edit Product" : "Add New Product"}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-grid">
                                {/* Name */}
                                <div className="modal-field modal-field-full">
                                    <label className="modal-label">Product Name *</label>
                                    <input className={`modal-input ${formErrors.name ? "modal-input-err" : ""}`}
                                        value={form.name} onChange={e => fieldChange("name", e.target.value)}
                                        placeholder="5&quot; Jallikattu" />
                                    {formErrors.name && <p className="modal-err">{formErrors.name}</p>}
                                </div>

                                {/* Category */}
                                <div className="modal-field">
                                    <label className="modal-label">Category *</label>
                                    <select className={`modal-input modal-select ${formErrors.categorySlug ? "modal-input-err" : ""}`}
                                        value={form.categorySlug} onChange={handleCategorySelect}>
                                        <option value="">Select category</option>
                                        {categories.map(c => (
                                            <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.categorySlug && <p className="modal-err">{formErrors.categorySlug}</p>}
                                </div>

                                {/* Stock */}
                                <div className="modal-field">
                                    <label className="modal-label">Stock *</label>
                                    <input type="number" className={`modal-input ${formErrors.stock ? "modal-input-err" : ""}`}
                                        value={form.stock} onChange={e => fieldChange("stock", e.target.value)}
                                        placeholder="100" min="0" />
                                    {formErrors.stock && <p className="modal-err">{formErrors.stock}</p>}
                                </div>

                                {/* Price */}
                                <div className="modal-field">
                                    <label className="modal-label">Price (₹) *</label>
                                    <input type="number" className={`modal-input ${formErrors.price ? "modal-input-err" : ""}`}
                                        value={form.price} onChange={e => fieldChange("price", e.target.value)}
                                        placeholder="160" min="1" />
                                    {formErrors.price && <p className="modal-err">{formErrors.price}</p>}
                                </div>

                                {/* Box Content */}
                                <div className="modal-field">
                                    <label className="modal-label">Box Content</label>
                                    <input className="modal-input"
                                        value={form.boxContent} onChange={e => fieldChange("boxContent", e.target.value)}
                                        placeholder="1 PKT / 1 BOX" />
                                </div>

                                {/* Rating */}
                                <div className="modal-field">
                                    <label className="modal-label">Rating (1–5)</label>
                                    <input type="number" className="modal-input"
                                        value={form.rating} onChange={e => fieldChange("rating", e.target.value)}
                                        placeholder="4.5" min="1" max="5" step="0.1" />
                                </div>

                                {/* Description */}
                                <div className="modal-field modal-field-full">
                                    <label className="modal-label">Description *</label>
                                    <textarea className={`modal-input modal-textarea ${formErrors.description ? "modal-input-err" : ""}`}
                                        value={form.description} onChange={e => fieldChange("description", e.target.value)}
                                        placeholder="Describe the product..." rows={3} />
                                    {formErrors.description && <p className="modal-err">{formErrors.description}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" id="save-product-btn" onClick={handleSave}>
                                <HiOutlineCheck /> {editingId !== null ? "Save Changes" : "Add Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ─────────────────────────────── */}
            {deleteConfirm !== null && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Product?</h2>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-confirm-msg">
                                Are you sure you want to delete <strong>
                                    {products.find(p => p.id === deleteConfirm)?.name}
                                </strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" id="confirm-delete-btn" onClick={handleDeleteConfirmed}>
                                <HiOutlineTrash /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
