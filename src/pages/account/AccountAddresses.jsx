import { useState } from "react";
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineCheck, HiOutlineHome, HiOutlineOfficeBuilding, HiOutlineLocationMarker } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AccountPages.css";

const EMPTY_ADDR = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

const ADDR_ICONS = { Home: HiOutlineHome, Work: HiOutlineOfficeBuilding, Other: HiOutlineLocationMarker };

export default function AccountAddresses() {
    const { user, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_ADDR);

    const addresses = user?.addresses || [];
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => { setForm(EMPTY_ADDR); setEditId(null); setShowForm(true); };
    const openEdit = (addr) => { setForm({ ...addr }); setEditId(addr.id); setShowForm(true); };

    const handleSave = () => {
        if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) return;
        if (editId) updateAddress(editId, form);
        else addAddress(form);
        setShowForm(false); setEditId(null);
    };

    return (
        <div className="acc-sub-page">
            <div className="acc-page-header">
                <h2 className="acc-page-title">Addresses</h2>
                <button className="acc-btn-primary" onClick={openNew}>
                    <HiOutlinePlus /> Add New Address
                </button>
            </div>

            {/* Add / Edit form */}
            {showForm && (
                <div className="addr-form-card acc-section-card">
                    <h3 className="acc-section-title">{editId ? "Edit Address" : "Add New Address"}</h3>
                    {/* Label */}
                    <div className="addr-label-row">
                        {["Home", "Work", "Other"].map(l => (
                            <button key={l} type="button"
                                className={`addr-label-chip ${form.label === l ? "active" : ""}`}
                                onClick={() => set("label", l)}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <div className="profile-form-grid">
                        {[
                            { label: "Full Name *", key: "name", placeholder: "Recipient name" },
                            { label: "Phone *", key: "phone", placeholder: "+91 9876543210" },
                            { label: "Address Line 1 *", key: "line1", placeholder: "House / Flat / Street" },
                            { label: "Address Line 2", key: "line2", placeholder: "Area / Landmark" },
                            { label: "City *", key: "city", placeholder: "City" },
                            { label: "State", key: "state", placeholder: "State" },
                            { label: "Pincode *", key: "pincode", placeholder: "600001" },
                        ].map(({ label, key, placeholder }) => (
                            <div className="profile-field" key={key}>
                                <label>{label}</label>
                                <input className="acc-input" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
                            </div>
                        ))}
                    </div>
                    <div className="profile-edit-actions">
                        <button className="acc-btn-primary" onClick={handleSave}><HiOutlineCheck /> Save Address</button>
                        <button className="acc-btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {!addresses.length && !showForm && (
                <div className="acc-empty-state">
                    <span className="acc-empty-icon">📍</span>
                    <h3>No addresses saved</h3>
                    <p>Add a delivery address to speed up checkout.</p>
                </div>
            )}

            <div className="addr-list">
                {addresses.map(addr => {
                    const Icon = ADDR_ICONS[addr.label] || HiOutlineLocationMarker;
                    return (
                        <div key={addr.id} className={`addr-card acc-section-card ${addr.isDefault ? "addr-card-default" : ""}`}>
                            <div className="addr-card-top">
                                <div className="addr-label-badge">
                                    <Icon /> {addr.label}
                                </div>
                                {addr.isDefault && <span className="addr-default-pill">✓ Default</span>}
                            </div>
                            <p className="addr-name">{addr.name} · {addr.phone}</p>
                            <p className="addr-line">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                            <p className="addr-line">{addr.city}{addr.state ? `, ${addr.state}` : ""} — {addr.pincode}</p>
                            <div className="addr-actions">
                                {!addr.isDefault && (
                                    <button className="acc-btn-outline acc-btn-sm" onClick={() => setDefaultAddress(addr.id)}>Set Default</button>
                                )}
                                <button className="acc-btn-outline acc-btn-sm" onClick={() => openEdit(addr)}><HiOutlinePencil /> Edit</button>
                                <button className="acc-btn-outline acc-btn-sm acc-btn-danger" onClick={() => deleteAddress(addr.id)}><HiOutlineTrash /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
