import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AuthPages.css";

export default function LoginPage() {
    const { login, authError, setAuthError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/account";

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setAuthError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 500)); // small UX delay
        const ok = login(form);
        setLoading(false);
        if (ok) navigate(from, { replace: true });
    };

    return (
        <div className="auth-page">
            <div className="auth-glow auth-glow-1" />
            <div className="auth-glow auth-glow-2" />

            <div className="auth-card" id="login-card">
                {/* Brand */}
                <div className="auth-brand">
                    <span className="auth-brand-icon">🧨</span>
                    <span className="auth-brand-name">SSS <strong>Crackers</strong></span>
                </div>

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account to continue</p>

                {authError && (
                    <div className="auth-error" role="alert">⚠️ {authError}</div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="auth-field">
                        <label htmlFor="login-email">Email Address</label>
                        <div className="auth-input-wrap">
                            <HiOutlineMail className="auth-input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => set("email", e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <div className="auth-label-row">
                            <label htmlFor="login-password">Password</label>
                            <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
                        </div>
                        <div className="auth-input-wrap">
                            <HiOutlineLockClosed className="auth-input-icon" />
                            <input
                                id="login-password"
                                type={showPwd ? "text" : "password"}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => set("password", e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" className="auth-eye" onClick={() => setShowPwd(s => !s)} aria-label="Toggle password">
                                {showPwd ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" id="login-submit-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : "Sign In"}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/signup" state={{ from }} className="auth-switch-link">Create account</Link>
                </p>
            </div>
        </div>
    );
}
