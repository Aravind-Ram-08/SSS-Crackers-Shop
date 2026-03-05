import { useState } from "react";
import {
    HiOutlineTag,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineSearch,
    HiOutlineCheck,
    HiOutlineBan,
    HiOutlineCalendar,
    HiOutlineCurrencyRupee,
    HiOutlineShoppingCart,
    HiOutlineClipboardCopy,
} from "react-icons/hi";
import { useCoupons } from "../../context/CouponContext";
import { categories } from "../../data/products";
import "./AdminCoupons.css";

const EMPTY_FORM = {
    couponCode: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrder: "",
    expiryDate: "",
    usageLimit: "",
    category: "",
    description: "",
    isActive: true,
};

export default function AdminCoupons() {
    const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCoupon } = useCoupons();

    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    // ── Filtering ──────────────────────────────────────────────────────
    const filtered = coupons.filter((c) => {
        const matchesSearch =
            c.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filterType === "all" ||
            (filterType === "active" && c.isActive) ||
            (filterType === "inactive" && !c.isActive) ||
            (filterType === "expired" && c.expiryDate && c.expiryDate < new Date().toISOString().split("T")[0]);

        return matchesSearch && matchesFilter;
    });

    // ── Open modal ─────────────────────────────────────────────────────
    function openCreate() {
        setEditingCoupon(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setShowModal(true);
    }

    function openEdit(coupon) {
        setEditingCoupon(coupon);
        setForm({
            couponCode: coupon.couponCode,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrder: coupon.minimumOrder || "",
            expiryDate: coupon.expiryDate || "",
            usageLimit: coupon.usageLimit || "",
            category: coupon.category || "",
            description: coupon.description || "",
            isActive: coupon.isActive,
        });
        setErrors({});
        setShowModal(true);
    }

    // ── Validation ─────────────────────────────────────────────────────
    function validate() {
        const errs = {};
        if (!form.couponCode.trim()) errs.couponCode = "Coupon code is required";
        else if (form.couponCode.length < 3) errs.couponCode = "Minimum 3 characters";
        else if (
            !editingCoupon &&
            coupons.some(
                (c) => c.couponCode.toLowerCase() === form.couponCode.trim().toLowerCase()
            )
        )
            errs.couponCode = "This coupon code already exists";

        if (!form.discountValue || Number(form.discountValue) <= 0)
            errs.discountValue = "Enter a valid discount value";
        if (form.discountType === "percentage" && Number(form.discountValue) > 100)
            errs.discountValue = "Percentage cannot exceed 100%";

        return errs;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        const data = {
            couponCode: form.couponCode.trim().toUpperCase(),
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            minimumOrder: Number(form.minimumOrder) || 0,
            expiryDate: form.expiryDate || "",
            usageLimit: Number(form.usageLimit) || 0,
            category: form.category || "",
            description: form.description.trim(),
            isActive: form.isActive,
        };

        if (editingCoupon) {
            updateCoupon(editingCoupon.id, data);
        } else {
            addCoupon(data);
        }

        setShowModal(false);
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    function handleDelete(id) {
        deleteCoupon(id);
        setDeleteConfirm(null);
    }

    function handleCopy(code) {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    }

    // Stats
    const totalActive = coupons.filter((c) => c.isActive).length;
    const totalInactive = coupons.filter((c) => !c.isActive).length;
    const totalUsage = coupons.reduce((s, c) => s + c.usedCount, 0);

    return (
        <div className="admin-coupons">
            {/* ── Stats ──── */}
            <div className="ac-stats-row">
                <div className="ac-stat-card">
                    <div className="ac-stat-icon" style={{ background: "rgba(255, 140, 0, 0.12)", color: "#ff8c00" }}>
                        <HiOutlineTag />
                    </div>
                    <div>
                        <p className="ac-stat-value">{coupons.length}</p>
                        <p className="ac-stat-label">Total Coupons</p>
                    </div>
                </div>
                <div className="ac-stat-card">
                    <div className="ac-stat-icon" style={{ background: "rgba(74, 222, 128, 0.12)", color: "#4ade80" }}>
                        <HiOutlineCheck />
                    </div>
                    <div>
                        <p className="ac-stat-value">{totalActive}</p>
                        <p className="ac-stat-label">Active</p>
                    </div>
                </div>
                <div className="ac-stat-card">
                    <div className="ac-stat-icon" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
                        <HiOutlineBan />
                    </div>
                    <div>
                        <p className="ac-stat-value">{totalInactive}</p>
                        <p className="ac-stat-label">Inactive</p>
                    </div>
                </div>
                <div className="ac-stat-card">
                    <div className="ac-stat-icon" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}>
                        <HiOutlineShoppingCart />
                    </div>
                    <div>
                        <p className="ac-stat-value">{totalUsage}</p>
                        <p className="ac-stat-label">Times Used</p>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ──── */}
            <div className="ac-toolbar">
                <div className="ac-search-wrap">
                    <HiOutlineSearch className="ac-search-icon" />
                    <input
                        type="text"
                        className="ac-search"
                        placeholder="Search coupons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="coupon-search"
                    />
                </div>

                <div className="ac-toolbar-right">
                    <select
                        className="ac-filter-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        id="coupon-filter"
                    >
                        <option value="all">All Coupons</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                        <option value="expired">Expired</option>
                    </select>

                    <button className="btn btn-primary ac-create-btn" onClick={openCreate} id="create-coupon-btn">
                        <HiOutlinePlus /> New Coupon
                    </button>
                </div>
            </div>

            {/* ── Coupons Table ──── */}
            <div className="ac-table-wrap">
                {filtered.length === 0 ? (
                    <div className="ac-empty">
                        <span className="ac-empty-icon">🎫</span>
                        <p>No coupons found</p>
                    </div>
                ) : (
                    <table className="ac-table" id="coupons-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Min Order</th>
                                <th>Category</th>
                                <th>Usage</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((coupon) => {
                                const isExpired =
                                    coupon.expiryDate &&
                                    coupon.expiryDate < new Date().toISOString().split("T")[0];
                                return (
                                    <tr key={coupon.id} className={!coupon.isActive || isExpired ? "ac-row-inactive" : ""}>
                                        <td>
                                            <div className="ac-code-cell">
                                                <span className="ac-code-badge">{coupon.couponCode}</span>
                                                <button
                                                    className="ac-copy-btn"
                                                    onClick={() => handleCopy(coupon.couponCode)}
                                                    title="Copy code"
                                                >
                                                    {copiedCode === coupon.couponCode ? (
                                                        <HiOutlineCheck />
                                                    ) : (
                                                        <HiOutlineClipboardCopy />
                                                    )}
                                                </button>
                                            </div>
                                            {coupon.description && (
                                                <span className="ac-code-desc">{coupon.description}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`ac-type-badge ac-type-${coupon.discountType}`}>
                                                {coupon.discountType === "percentage" ? "%" : "₹"}
                                            </span>
                                        </td>
                                        <td className="ac-value-cell">
                                            {coupon.discountType === "percentage"
                                                ? `${coupon.discountValue}%`
                                                : `₹${coupon.discountValue}`}
                                        </td>
                                        <td>
                                            {coupon.minimumOrder > 0 ? `₹${coupon.minimumOrder}` : "—"}
                                        </td>
                                        <td>
                                            {coupon.category ? (
                                                <span className="ac-category-chip">
                                                    {coupon.category.replace(/-/g, " ")}
                                                </span>
                                            ) : (
                                                <span className="ac-all-cat">All</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="ac-usage">
                                                {coupon.usedCount}
                                                {coupon.usageLimit > 0 && (
                                                    <span className="ac-usage-limit">/{coupon.usageLimit}</span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            {coupon.expiryDate ? (
                                                <span className={`ac-expiry ${isExpired ? "ac-expired" : ""}`}>
                                                    <HiOutlineCalendar />
                                                    {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            ) : (
                                                "No expiry"
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={`ac-status-toggle ${coupon.isActive ? "ac-active" : "ac-inactive"}`}
                                                onClick={() => toggleCoupon(coupon.id)}
                                                title={coupon.isActive ? "Disable" : "Enable"}
                                                id={`toggle-coupon-${coupon.id}`}
                                            >
                                                <span className="ac-toggle-knob" />
                                            </button>
                                        </td>
                                        <td>
                                            <div className="ac-actions">
                                                <button
                                                    className="ac-action-btn ac-edit"
                                                    onClick={() => openEdit(coupon)}
                                                    title="Edit"
                                                    id={`edit-coupon-${coupon.id}`}
                                                >
                                                    <HiOutlinePencil />
                                                </button>
                                                {deleteConfirm === coupon.id ? (
                                                    <div className="ac-delete-confirm">
                                                        <button
                                                            className="ac-action-btn ac-delete-yes"
                                                            onClick={() => handleDelete(coupon.id)}
                                                        >
                                                            <HiOutlineCheck />
                                                        </button>
                                                        <button
                                                            className="ac-action-btn ac-delete-no"
                                                            onClick={() => setDeleteConfirm(null)}
                                                        >
                                                            <HiOutlineX />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="ac-action-btn ac-delete"
                                                        onClick={() => setDeleteConfirm(coupon.id)}
                                                        title="Delete"
                                                        id={`delete-coupon-${coupon.id}`}
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Create / Edit Modal ──── */}
            {showModal && (
                <div className="ac-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ac-modal-header">
                            <h2>
                                <HiOutlineTag />
                                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                            </h2>
                            <button className="ac-modal-close" onClick={() => setShowModal(false)}>
                                <HiOutlineX />
                            </button>
                        </div>

                        <form className="ac-modal-form" onSubmit={handleSubmit}>
                            {/* Coupon Code */}
                            <div className="ac-form-group">
                                <label>Coupon Code *</label>
                                <input
                                    name="couponCode"
                                    value={form.couponCode}
                                    onChange={handleChange}
                                    placeholder="e.g. DIWALI20"
                                    className={`ac-input ${errors.couponCode ? "ac-input-error" : ""}`}
                                    style={{ textTransform: "uppercase" }}
                                    id="coupon-code-input"
                                />
                                {errors.couponCode && <span className="ac-field-error">{errors.couponCode}</span>}
                            </div>

                            {/* Description */}
                            <div className="ac-form-group">
                                <label>Description</label>
                                <input
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="e.g. Get 20% OFF on all orders"
                                    className="ac-input"
                                    id="coupon-description-input"
                                />
                            </div>

                            <div className="ac-form-row">
                                {/* Discount Type */}
                                <div className="ac-form-group">
                                    <label>Discount Type *</label>
                                    <select
                                        name="discountType"
                                        value={form.discountType}
                                        onChange={handleChange}
                                        className="ac-input"
                                        id="discount-type-select"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount (₹)</option>
                                    </select>
                                </div>

                                {/* Discount Value */}
                                <div className="ac-form-group">
                                    <label>Discount Value *</label>
                                    <div className="ac-input-with-prefix">
                                        <span className="ac-prefix">
                                            {form.discountType === "percentage" ? "%" : "₹"}
                                        </span>
                                        <input
                                            name="discountValue"
                                            type="number"
                                            value={form.discountValue}
                                            onChange={handleChange}
                                            placeholder={form.discountType === "percentage" ? "20" : "100"}
                                            className={`ac-input ac-input-prefix ${errors.discountValue ? "ac-input-error" : ""}`}
                                            min="0"
                                            id="discount-value-input"
                                        />
                                    </div>
                                    {errors.discountValue && (
                                        <span className="ac-field-error">{errors.discountValue}</span>
                                    )}
                                </div>
                            </div>

                            <div className="ac-form-row">
                                {/* Minimum Order */}
                                <div className="ac-form-group">
                                    <label>Minimum Order (₹)</label>
                                    <div className="ac-input-with-prefix">
                                        <span className="ac-prefix">
                                            <HiOutlineCurrencyRupee />
                                        </span>
                                        <input
                                            name="minimumOrder"
                                            type="number"
                                            value={form.minimumOrder}
                                            onChange={handleChange}
                                            placeholder="0"
                                            className="ac-input ac-input-prefix"
                                            min="0"
                                            id="min-order-input"
                                        />
                                    </div>
                                </div>

                                {/* Usage Limit */}
                                <div className="ac-form-group">
                                    <label>Usage Limit</label>
                                    <input
                                        name="usageLimit"
                                        type="number"
                                        value={form.usageLimit}
                                        onChange={handleChange}
                                        placeholder="0 = Unlimited"
                                        className="ac-input"
                                        min="0"
                                        id="usage-limit-input"
                                    />
                                </div>
                            </div>

                            <div className="ac-form-row">
                                {/* Expiry Date */}
                                <div className="ac-form-group">
                                    <label>Expiry Date</label>
                                    <input
                                        name="expiryDate"
                                        type="date"
                                        value={form.expiryDate}
                                        onChange={handleChange}
                                        className="ac-input"
                                        id="expiry-date-input"
                                    />
                                </div>

                                {/* Category */}
                                <div className="ac-form-group">
                                    <label>Category (optional)</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="ac-input"
                                        id="category-select"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.slug} value={cat.slug}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active */}
                            <div className="ac-form-group ac-checkbox-group">
                                <label className="ac-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={handleChange}
                                        className="ac-checkbox"
                                        id="is-active-checkbox"
                                    />
                                    <span className="ac-checkbox-custom" />
                                    Enable this coupon
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="ac-modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline ac-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" id="save-coupon-btn">
                                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
