import { useState } from "react";
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX,
    HiOutlineCheck, HiOutlineClock, HiOutlineLightningBolt,
    HiOutlineCalendar, HiOutlineTag, HiOutlineFire,
} from "react-icons/hi";
import { useFestival, isOfferLive } from "../../context/FestivalContext";
import "./AdminFestivalOffers.css";

// ── Badge options ──────────────────────────────────────────────────────────
const BADGE_OPTIONS = [
    { value: "🔥 Festival Offer", type: "festival" },
    { value: "🎆 Diwali Special", type: "diwali" },
    { value: "⚡ Flash Sale", type: "flash" },
    { value: "🚀 Category Deal", type: "category" },
    { value: "✨ Family Deal", type: "festival" },
    { value: "💥 Mega Deal", type: "festival" },
];

const SCOPE_OPTIONS = [
    { value: "all", label: "All Products" },
    { value: "category", label: "Specific Category" },
    { value: "product", label: "Specific Products" },
];

const CATEGORY_SLUGS = [
    "one-sound-crackers", "deluxe-crackers", "giant-chorsa", "bijili-crackers",
    "ground-chakkar", "flower-pots", "garland-bang-crackers", "pencil", "bombs",
    "twinkling-star", "stone-cartoon", "rockets", "aerial-fancy", "special-fountain",
    "repeating-cake", "fancy-items", "sparklers", "musical-shot", "special-items",
];

const EMPTY_OFFER = {
    title: "", badge: "🔥 Festival Offer", badgeType: "festival",
    discountType: "percent", discountValue: 10,
    scope: "all", scopeValue: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    isActive: true, flashSale: false, flashDurationHours: 24, flashStartTime: "",
    description: "", urgencyText: "Limited time offer!", limitedStock: false, sellingFast: false,
};

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

// ── Countdown display (mini) ─────────────────────────────────────────────
function MiniCountdown({ countdown }) {
    const { days, hours, minutes, seconds, isOver } = countdown;
    if (isOver) return <span className="afo-live-pill">🎆 Festival is NOW!</span>;
    return (
        <div className="afo-mini-clock">
            {[["D", days], ["H", hours], ["M", minutes], ["S", seconds]].map(([u, v], i, arr) => (
                <span key={u} className="afo-clock-block">
                    <strong>{String(v).padStart(2, "0")}</strong>
                    <small>{u}</small>
                    {i < arr.length - 1 && <span className="afo-clock-sep">:</span>}
                </span>
            ))}
        </div>
    );
}

// ── Offer form (modal) ────────────────────────────────────────────────────
function OfferModal({ offer, onSave, onClose }) {
    const [form, setForm] = useState(offer || EMPTY_OFFER);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleBadge = (badgeVal) => {
        const found = BADGE_OPTIONS.find(b => b.value === badgeVal);
        setForm(f => ({ ...f, badge: badgeVal, badgeType: found?.type ?? "festival" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box afo-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{offer ? "Edit Offer" : "Create New Offer"}</h2>
                    <button className="modal-close" onClick={onClose}><HiOutlineX /></button>
                </div>
                <form className="afo-form" onSubmit={handleSubmit}>
                    <div className="afo-form-grid">
                        {/* Title */}
                        <div className="afo-field afo-field-full">
                            <label>Offer Title *</label>
                            <input value={form.title} onChange={e => set("title", e.target.value)}
                                placeholder="e.g. Diwali Flash Sale" required />
                        </div>

                        {/* Description */}
                        <div className="afo-field afo-field-full">
                            <label>Description</label>
                            <input value={form.description} onChange={e => set("description", e.target.value)}
                                placeholder="Short description shown on card" />
                        </div>

                        {/* Badge */}
                        <div className="afo-field">
                            <label>Badge</label>
                            <select value={form.badge} onChange={e => handleBadge(e.target.value)}>
                                {BADGE_OPTIONS.map(b => (
                                    <option key={b.value} value={b.value}>{b.value}</option>
                                ))}
                            </select>
                        </div>

                        {/* Discount */}
                        <div className="afo-field">
                            <label>Discount (%)</label>
                            <input type="number" min="1" max="99"
                                value={form.discountValue}
                                onChange={e => set("discountValue", Number(e.target.value))} />
                        </div>

                        {/* Scope */}
                        <div className="afo-field">
                            <label>Apply To</label>
                            <select value={form.scope} onChange={e => set("scope", e.target.value)}>
                                {SCOPE_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Scope value */}
                        {form.scope === "category" && (
                            <div className="afo-field">
                                <label>Category</label>
                                <select value={form.scopeValue} onChange={e => set("scopeValue", e.target.value)}>
                                    <option value="">-- Select --</option>
                                    {CATEGORY_SLUGS.map(s => (
                                        <option key={s} value={s}>{s.replace(/-/g, " ")}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {form.scope === "product" && (
                            <div className="afo-field">
                                <label>Product IDs (comma-separated)</label>
                                <input value={form.scopeValue}
                                    onChange={e => set("scopeValue", e.target.value)}
                                    placeholder="1, 5, 12" />
                            </div>
                        )}

                        {/* Dates */}
                        <div className="afo-field">
                            <label>Start Date</label>
                            <input type="date" value={form.startDate}
                                onChange={e => set("startDate", e.target.value)} />
                        </div>
                        <div className="afo-field">
                            <label>End Date</label>
                            <input type="date" value={form.endDate}
                                onChange={e => set("endDate", e.target.value)} />
                        </div>

                        {/* Urgency text */}
                        <div className="afo-field afo-field-full">
                            <label>Urgency Text</label>
                            <input value={form.urgencyText}
                                onChange={e => set("urgencyText", e.target.value)}
                                placeholder="e.g. Only 4 hours left!" />
                        </div>

                        {/* Toggles */}
                        <div className="afo-toggles afo-field-full">
                            <label className="afo-toggle-row">
                                <input type="checkbox" checked={form.isActive}
                                    onChange={e => set("isActive", e.target.checked)} />
                                <span>Active</span>
                            </label>
                            <label className="afo-toggle-row">
                                <input type="checkbox" checked={form.limitedStock}
                                    onChange={e => set("limitedStock", e.target.checked)} />
                                <span>Limited Stock</span>
                            </label>
                            <label className="afo-toggle-row">
                                <input type="checkbox" checked={form.sellingFast}
                                    onChange={e => set("sellingFast", e.target.checked)} />
                                <span>Selling Fast</span>
                            </label>
                            <label className="afo-toggle-row">
                                <input type="checkbox" checked={form.flashSale}
                                    onChange={e => set("flashSale", e.target.checked)} />
                                <span>Flash Sale</span>
                            </label>
                        </div>

                        {/* Flash sale options */}
                        {form.flashSale && (
                            <>
                                <div className="afo-field">
                                    <label>Flash Duration (hours)</label>
                                    <input type="number" min="1" max="72"
                                        value={form.flashDurationHours}
                                        onChange={e => set("flashDurationHours", Number(e.target.value))} />
                                </div>
                                <div className="afo-field">
                                    <label>Flash Start (local date-time)</label>
                                    <input type="datetime-local" value={form.flashStartTime?.slice(0, 16) ?? ""}
                                        onChange={e => set("flashStartTime", e.target.value + ":00+05:30")} />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary-orange" id="afo-save-offer-btn">
                            <HiOutlineCheck /> {offer ? "Update Offer" : "Create Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AdminFestivalOffers() {
    const { festival, updateFestival, offers, liveOffers, addOffer, updateOffer, deleteOffer, toggleOffer, countdown, now } = useFestival();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editOffer, setEditOffer] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState("offers"); // "offers" | "festival"
    const [festForm, setFestForm] = useState({ ...festival });

    const handleSaveFestival = () => {
        updateFestival(festForm);
    };

    const handleSaveOffer = (form) => {
        if (editOffer) {
            updateOffer(editOffer.id, form);
        } else {
            addOffer(form);
        }
    };

    const totalSales = offers.reduce((s, o) => s + (o.salesCount || 0), 0);

    return (
        <div className="admin-page afo-page">
            {/* ── Header ────────────────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Festival &amp; Offers Engine</h1>
                    <p className="admin-page-sub">
                        {liveOffers.length} live · {offers.filter(o => !isOfferLive(o, now)).length} scheduled/inactive
                    </p>
                </div>
                <button className="afo-add-btn" onClick={() => { setEditOffer(null); setShowAddModal(true); }}
                    id="afo-add-offer-btn">
                    <HiOutlinePlus /> New Offer
                </button>
            </div>

            {/* ── KPI Strip ─────────────────────────────────────── */}
            <div className="afo-kpi-strip">
                <div className="afo-kpi" style={{ "--ac": "#ff8c00" }}>
                    <HiOutlineFire className="afo-kpi-icon" />
                    <div>
                        <p className="afo-kpi-label">Live Offers</p>
                        <p className="afo-kpi-val">{liveOffers.length}</p>
                    </div>
                </div>
                <div className="afo-kpi" style={{ "--ac": "#a855f7" }}>
                    <HiOutlineClock className="afo-kpi-icon" />
                    <div>
                        <p className="afo-kpi-label">Scheduled</p>
                        <p className="afo-kpi-val">{offers.filter(o => o.isActive && !isOfferLive(o, now)).length}</p>
                    </div>
                </div>
                <div className="afo-kpi" style={{ "--ac": "#3b82f6" }}>
                    <HiOutlineTag className="afo-kpi-icon" />
                    <div>
                        <p className="afo-kpi-label">Total Offers</p>
                        <p className="afo-kpi-val">{offers.length}</p>
                    </div>
                </div>
                <div className="afo-kpi" style={{ "--ac": "#10b981" }}>
                    <HiOutlineLightningBolt className="afo-kpi-icon" />
                    <div>
                        <p className="afo-kpi-label">Total Sales via Offers</p>
                        <p className="afo-kpi-val">{totalSales.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────────── */}
            <div className="afo-tabs">
                <button className={`afo-tab ${activeTab === "offers" ? "afo-tab-active" : ""}`}
                    onClick={() => setActiveTab("offers")}>
                    <HiOutlineTag /> Offers Management
                </button>
                <button className={`afo-tab ${activeTab === "festival" ? "afo-tab-active" : ""}`}
                    onClick={() => setActiveTab("festival")}>
                    <HiOutlineCalendar /> Festival Settings
                </button>
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {activeTab === "offers" && (
                <div className="admin-card afo-offers-table-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Offer</th>
                                    <th>Badge</th>
                                    <th>Discount</th>
                                    <th>Scope</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Sales</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.length === 0 ? (
                                    <tr><td colSpan={8} className="admin-table-empty">No offers yet</td></tr>
                                ) : offers.map(offer => {
                                    const live = isOfferLive(offer, now);
                                    return (
                                        <tr key={offer.id}>
                                            <td>
                                                <div className="afo-offer-cell">
                                                    <strong>{offer.title}</strong>
                                                    {offer.flashSale && (
                                                        <span className="afo-flash-chip">⚡ Flash</span>
                                                    )}
                                                    <small>{offer.description}</small>
                                                </div>
                                            </td>
                                            <td><span className={`afo-badge-pill type-${offer.badgeType}`}>{offer.badge}</span></td>
                                            <td><strong className="afo-discount-val">{offer.discountValue}% OFF</strong></td>
                                            <td>
                                                <span className="afo-scope-pill">
                                                    {offer.scope === "all" ? "All Products" :
                                                        offer.scope === "category" ? `🗂 ${offer.scopeValue}` :
                                                            "Products"}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
                                            </td>
                                            <td>
                                                <div className="afo-status-cell">
                                                    {live ? (
                                                        <span className="afo-status-live">● Live</span>
                                                    ) : offer.isActive ? (
                                                        <span className="afo-status-sched">◌ Scheduled</span>
                                                    ) : (
                                                        <span className="afo-status-off">○ Off</span>
                                                    )}
                                                    <button className="afo-toggle-btn" onClick={() => toggleOffer(offer.id)}
                                                        title={offer.isActive ? "Disable" : "Enable"}>
                                                        {offer.isActive ? "Disable" : "Enable"}
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="afo-sales-count">{(offer.salesCount || 0).toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="action-btn primary"
                                                        onClick={() => { setEditOffer(offer); setShowAddModal(true); }}
                                                        title="Edit offer"
                                                        id={`afo-edit-${offer.id}`}>
                                                        <HiOutlinePencil />
                                                    </button>
                                                    <button className="action-btn danger"
                                                        onClick={() => setDeleteConfirm(offer.id)}
                                                        title="Delete offer"
                                                        id={`afo-del-${offer.id}`}>
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
                </div>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {activeTab === "festival" && (
                <div className="afo-festival-tab">

                    {/* ▶ COUNTDOWN MASTER TOGGLE CARD ─────────────────── */}
                    <div className={`afo-toggle-master-card ${festival.countdownEnabled ? "afo-tmc-on" : "afo-tmc-off"}`}
                        id="countdown-toggle-card">
                        <div className="afo-tmc-left">
                            <div className="afo-tmc-icon">{festival.countdownEnabled ? "🪔" : "🌑"}</div>
                            <div className="afo-tmc-info">
                                <h3 className="afo-tmc-title">Festival Countdown Control</h3>
                                <p className="afo-tmc-subtitle">
                                    Controls the countdown timer visible to <strong>all customers</strong> on every page.
                                </p>
                                <span className={`afo-tmc-status-label ${festival.countdownEnabled ? "status-active" : "status-disabled"}`}>
                                    <span className="afo-tmc-dot" />
                                    Festival Countdown Status:&nbsp;
                                    <strong>{festival.countdownEnabled ? "Active" : "Disabled"}</strong>
                                </span>
                            </div>
                        </div>
                        <div className="afo-tmc-right">
                            <span className="afo-tmc-off-label">OFF</span>
                            <button
                                className={`afo-big-toggle ${festival.countdownEnabled ? "afo-big-toggle-on" : ""}`}
                                onClick={() => updateFestival({ countdownEnabled: !festival.countdownEnabled })}
                                id="countdown-master-toggle-btn"
                                aria-label="Toggle festival countdown"
                                role="switch"
                                aria-checked={festival.countdownEnabled}
                            >
                                <span className="afo-big-toggle-thumb" />
                            </button>
                            <span className="afo-tmc-on-label">ON</span>
                        </div>
                    </div>

                    {/* ▶ TWO-COLUMN LAYOUT ─────────────────────────────── */}
                    <div className="afo-festival-panel">

                        {/* LEFT: Live Countdown Preview */}
                        <div className="admin-card afo-countdown-preview">
                            <h3 className="afo-section-heading">🪔 Live Countdown Preview</h3>
                            {festival.countdownEnabled ? (
                                <MiniCountdown countdown={countdown} />
                            ) : (
                                <div className="afo-countdown-off-msg">
                                    <span className="afo-countdown-off-icon">🌑</span>
                                    <p>Countdown is <strong>disabled</strong>.<br />
                                        Toggle ON to show it to customers.</p>
                                </div>
                            )}
                            <p className="afo-countdown-help">
                                {festival.countdownEnabled
                                    ? `Shown as a "${festival.displayStyle ?? "top-bar"}" to all visitors.`
                                    : "Hidden from all customer pages."}
                            </p>
                        </div>

                        {/* RIGHT: Settings form */}
                        <div className="admin-card">
                            <h3 className="afo-section-heading">⚙️ Festival Settings</h3>
                            <div className="afo-fest-form">

                                {/* Festival Name + Emoji */}
                                <div className="afo-field">
                                    <label>Festival Name</label>
                                    <input value={festForm.name}
                                        onChange={e => setFestForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Diwali" />
                                </div>
                                <div className="afo-field">
                                    <label>Festival Emoji</label>
                                    <input value={festForm.emoji}
                                        onChange={e => setFestForm(f => ({ ...f, emoji: e.target.value }))}
                                        placeholder="🪔" />
                                </div>

                                {/* Target Date */}
                                <div className="afo-field afo-field-full">
                                    <label>Festival Target Date &amp; Time</label>
                                    <input value={festForm.targetDate}
                                        onChange={e => setFestForm(f => ({ ...f, targetDate: e.target.value }))}
                                        placeholder="2026-10-19T00:00:00+05:30"
                                        title="ISO 8601 with IST offset (+05:30)" />
                                    <span className="afo-field-hint">Format: YYYY-MM-DDTHH:MM:SS+05:30</span>
                                </div>

                                {/* Sale Live Message */}
                                <div className="afo-field afo-field-full">
                                    <label>Sale Live Message</label>
                                    <input value={festForm.saleLiveMessage}
                                        onChange={e => setFestForm(f => ({ ...f, saleLiveMessage: e.target.value }))}
                                        placeholder="🎆 Diwali Sale is LIVE Now! Up to 40% OFF!" />
                                    <span className="afo-field-hint">Shown when the countdown reaches zero.</span>
                                </div>

                                {/* Display Style */}
                                <div className="afo-field afo-field-full">
                                    <label>Countdown Display Style</label>
                                    <div className="afo-style-picker">
                                        {[
                                            { val: "top-bar", icon: "▬", label: "Top Bar", desc: "Slim strip above header" },
                                            { val: "banner", icon: "🎀", label: "Banner", desc: "Full-width hero banner" },
                                            { val: "popup", icon: "💬", label: "Popup", desc: "Floating bottom-right popup" },
                                        ].map(s => (
                                            <button
                                                key={s.val}
                                                type="button"
                                                className={`afo-style-card ${festForm.displayStyle === s.val ? "afo-style-card-active" : ""}`}
                                                onClick={() => setFestForm(f => ({ ...f, displayStyle: s.val }))}
                                                id={`afo-style-${s.val}`}
                                            >
                                                <span className="afo-style-icon">{s.icon}</span>
                                                <span className="afo-style-label">{s.label}</span>
                                                <span className="afo-style-desc">{s.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save button */}
                                <div className="afo-field-full afo-save-row">
                                    <button className="btn btn-primary-orange" onClick={handleSaveFestival}
                                        id="afo-save-festival-btn">
                                        <HiOutlineCheck /> Save Festival Settings
                                    </button>
                                    <span className="afo-save-hint">
                                        ✓ Settings are saved to your browser and persist across sessions.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Offer modal ───────────────────────────────────── */}
            {showAddModal && (
                <OfferModal
                    offer={editOffer}
                    onSave={handleSaveOffer}
                    onClose={() => { setShowAddModal(false); setEditOffer(null); }}
                />
            )}

            {/* ── Delete confirm ────────────────────────────────── */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Offer?</h2>
                            <button className="modal-close" onClick={() => setDeleteConfirm(null)}><HiOutlineX /></button>
                        </div>
                        <div className="modal-body">
                            <p className="delete-confirm-msg">This offer will be permanently removed and can't be recovered.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" id="afo-confirm-delete-btn"
                                onClick={() => { deleteOffer(deleteConfirm); setDeleteConfirm(null); }}>
                                <HiOutlineTrash /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
