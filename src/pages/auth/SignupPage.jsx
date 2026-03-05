import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineTicket } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AuthPages.css";

export default function SignupPage() {
    const { signup, authError, setAuthError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/account";

    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState("");

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setAuthError(""); setLocalError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { setLocalError("Passwords do not match."); return; }
        if (form.password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const ok = signup(form);
        setLoading(false);
        if (ok) navigate(from, { replace: true });
    };

    const error = localError || authError;

    return (
        <div className="auth-page">
            <div className="auth-glow auth-glow-1" />
            <div className="auth-glow auth-glow-2" />

            <div className="auth-card auth-card-signup" id="signup-card">
                <div className="auth-brand">
                    <span className="auth-brand-icon">🧨</span>
                    <span className="auth-brand-name">SSS <strong>Crackers</strong></span>
                </div>

                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join SSS Crackers and enjoy exclusive offers</p>

                {error && <div className="auth-error" role="alert">⚠️ {error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* Name + Phone */}
                    <div className="auth-grid-2">
                        <div className="auth-field">
                            <label htmlFor="su-name">Full Name</label>
                            <div className="auth-input-wrap">
                                <HiOutlineUser className="auth-input-icon" />
                                <input id="su-name" type="text" placeholder="Your name" value={form.name}
                                    onChange={e => set("name", e.target.value)} required autoComplete="name" />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label htmlFor="su-phone">Phone Number</label>
                            <div className="auth-input-wrap">
                                <HiOutlinePhone className="auth-input-icon" />
                                <input id="su-phone" type="tel" placeholder="+91 9876543210" value={form.phone}
                                    onChange={e => set("phone", e.target.value)} required autoComplete="tel" />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                        <label htmlFor="su-email">Email Address</label>
                        <div className="auth-input-wrap">
                            <HiOutlineMail className="auth-input-icon" />
                            <input id="su-email" type="email" placeholder="you@example.com" value={form.email}
                                onChange={e => set("email", e.target.value)} required autoComplete="email" />
                        </div>
                    </div>

                    {/* Password + Confirm */}
                    <div className="auth-grid-2">
                        <div className="auth-field">
                            <label htmlFor="su-password">Password</label>
                            <div className="auth-input-wrap">
                                <HiOutlineLockClosed className="auth-input-icon" />
                                <input id="su-password" type={showPwd ? "text" : "password"} placeholder="Min 6 chars"
                                    value={form.password} onChange={e => set("password", e.target.value)} required />
                                <button type="button" className="auth-eye" onClick={() => setShowPwd(s => !s)}>
                                    {showPwd ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                </button>
                            </div>
                        </div>
                        <div className="auth-field">
                            <label htmlFor="su-confirm">Confirm Password</label>
                            <div className="auth-input-wrap">
                                <HiOutlineLockClosed className="auth-input-icon" />
                                <input id="su-confirm" type={showPwd ? "text" : "password"} placeholder="Repeat password"
                                    value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    {/* Referral code (optional) */}
                    <div className="auth-field">
                        <label htmlFor="su-ref">Referral Code <span className="auth-optional">(optional)</span></label>
                        <div className="auth-input-wrap">
                            <HiOutlineTicket className="auth-input-icon" />
                            <input id="su-ref" type="text" placeholder="e.g. JOHN1234" value={form.referralCode}
                                onChange={e => set("referralCode", e.target.value)} autoComplete="off" />
                        </div>
                        <span className="auth-field-hint">Enter a friend's code to get 100 bonus loyalty points!</span>
                    </div>

                    <button type="submit" className="auth-submit-btn" id="signup-submit-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : "Create Account 🎆"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login" state={{ from }} className="auth-switch-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
