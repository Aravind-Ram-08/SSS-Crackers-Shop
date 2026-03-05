import { useState, useRef } from "react";
import { HiOutlineCamera, HiOutlineCheck, HiOutlinePencil } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AccountPages.css";

export default function AccountProfile() {
    const { user, updateProfile, changePassword } = useAuth();
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || "" });
    const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileRef = useRef(null);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = () => {
        updateProfile({ name: form.name, phone: form.phone });
        setEdit(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handlePwd = () => {
        setPwdError(""); setPwdSuccess(false);
        if (!pwdForm.current || !pwdForm.next) { setPwdError("Fill all fields."); return; }
        if (pwdForm.next !== pwdForm.confirm) { setPwdError("New passwords don't match."); return; }
        if (pwdForm.next.length < 6) { setPwdError("Min 6 characters."); return; }
        const ok = changePassword({ current: pwdForm.current, next: pwdForm.next });
        if (!ok) { setPwdError("Current password is incorrect."); return; }
        setPwdSuccess(true);
        setPwdForm({ current: "", next: "", confirm: "" });
    };

    const handleAvatar = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => updateProfile({ avatar: ev.target.result });
        reader.readAsDataURL(file);
    };

    const initials = (user.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="acc-sub-page">
            <h2 className="acc-page-title">My Profile</h2>

            {/* Avatar */}
            <div className="acc-section-card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar-lg">
                            {user.avatar
                                ? <img src={user.avatar} alt={user.name} />
                                : <span>{initials}</span>
                            }
                        </div>
                        <button className="profile-avatar-edit-btn" onClick={() => fileRef.current?.click()} title="Change photo">
                            <HiOutlineCamera />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    </div>
                    <div className="profile-avatar-info">
                        <p className="profile-name">{user.name}</p>
                        <p className="profile-email">{user.email}</p>
                        <p className="profile-joined">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                    </div>
                </div>
            </div>

            {/* Personal info */}
            <div className="acc-section-card">
                <div className="acc-section-header">
                    <h3 className="acc-section-title">Personal Information</h3>
                    {!edit && (
                        <button className="acc-edit-btn" onClick={() => setEdit(true)}>
                            <HiOutlinePencil /> Edit
                        </button>
                    )}
                </div>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Full Name</label>
                        {edit ? <input value={form.name} onChange={e => set("name", e.target.value)} className="acc-input" />
                            : <p className="profile-value">{user.name}</p>}
                    </div>
                    <div className="profile-field">
                        <label>Phone Number</label>
                        {edit ? <input value={form.phone} onChange={e => set("phone", e.target.value)} className="acc-input" />
                            : <p className="profile-value">{user.phone || "—"}</p>}
                    </div>
                    <div className="profile-field profile-field-full">
                        <label>Email Address</label>
                        <p className="profile-value">{user.email} <span className="profile-badge">Verified</span></p>
                    </div>
                </div>
                {edit && (
                    <div className="profile-edit-actions">
                        <button className="acc-btn-primary" onClick={handleSave}><HiOutlineCheck /> Save Changes</button>
                        <button className="acc-btn-outline" onClick={() => setEdit(false)}>Cancel</button>
                    </div>
                )}
                {saved && <p className="acc-success-msg">✓ Profile updated successfully!</p>}
            </div>

            {/* Change password */}
            <div className="acc-section-card">
                <h3 className="acc-section-title">Change Password</h3>
                <div className="profile-form-grid">
                    {[
                        { label: "Current Password", key: "current", id: "pwd-current" },
                        { label: "New Password", key: "next", id: "pwd-next" },
                        { label: "Confirm New", key: "confirm", id: "pwd-confirm" },
                    ].map(({ label, key, id }) => (
                        <div className="profile-field" key={key}>
                            <label htmlFor={id}>{label}</label>
                            <input id={id} type="password" className="acc-input" placeholder="••••••••"
                                value={pwdForm[key]}
                                onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))} />
                        </div>
                    ))}
                </div>
                {pwdError && <p className="acc-error-msg">⚠️ {pwdError}</p>}
                {pwdSuccess && <p className="acc-success-msg">✓ Password changed successfully!</p>}
                <button className="acc-btn-primary" style={{ marginTop: "1rem" }} onClick={handlePwd}>
                    Update Password
                </button>
            </div>
        </div>
    );
}
