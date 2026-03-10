import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineEye, HiOutlineEyeOff, HiOutlineShieldCheck } from "react-icons/hi";
import "./SecureAdminLogin.css";

// Hardcoded admin credentials (in production this would use Supabase Auth with role=admin)
const ADMIN_CREDENTIALS = [
    { email: "admin@ssscrackers.com", password: "Admin@SSS2026", name: "Super Admin", role: "admin" },
    { email: "owner@ssscrackers.com", password: "Owner@SSS2026", name: "Store Owner", role: "owner" },
];

const ADMIN_SESSION_KEY = "sss_admin_session";

export function getAdminSession() {
    try {
        return JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || "null");
    } catch { return null; }
}

export function setAdminSession(admin) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
}

export function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export default function SecureAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        setTimeout(() => {
            const found = ADMIN_CREDENTIALS.find(
                c => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
            );
            if (!found) {
                setError("Invalid credentials. Access denied.");
                setLoading(false);
                return;
            }
            setAdminSession({ email: found.email, name: found.name, role: found.role, loginAt: new Date().toISOString() });
            navigate("/admin");
        }, 700);
    }

    return (
        <div className="secure-login-bg">
            {/* Glow orbs */}
            <div className="secure-orb secure-orb-1" />
            <div className="secure-orb secure-orb-2" />
            <div className="secure-orb secure-orb-3" />

            <div className="secure-login-card">
                {/* Header */}
                <div className="secure-login-header">
                    <div className="secure-shield-icon">
                        <HiOutlineShieldCheck />
                    </div>
                    <div className="secure-lock-badge">🔒 RESTRICTED ACCESS</div>
                    <h1 className="secure-login-title">Admin Portal</h1>
                    <p className="secure-login-sub">SSS Crackers — Owner Dashboard</p>
                </div>

                {/* Warning */}
                <div className="secure-warning">
                    <HiOutlineShieldCheck className="secure-warning-icon" />
                    <span>This area is restricted to authorized administrators only. Unauthorized access attempts are logged and may result in legal action.</span>
                </div>

                {/* Form */}
                <form className="secure-login-form" onSubmit={handleLogin} id="secure-admin-login-form">
                    <div className="secure-form-field">
                        <label className="secure-form-label">Admin Email</label>
                        <div className="secure-input-wrap">
                            <HiOutlineMail className="secure-input-icon" />
                            <input
                                type="email"
                                className="secure-input"
                                placeholder="admin@ssscrackers.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="username"
                                id="admin-email-input"
                            />
                        </div>
                    </div>

                    <div className="secure-form-field">
                        <label className="secure-form-label">Admin Password</label>
                        <div className="secure-input-wrap">
                            <HiOutlineLockClosed className="secure-input-icon" />
                            <input
                                type={showPwd ? "text" : "password"}
                                className="secure-input"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                id="admin-password-input"
                            />
                            <button
                                type="button"
                                className="secure-pwd-toggle"
                                onClick={() => setShowPwd(v => !v)}
                                tabIndex={-1}
                            >
                                {showPwd ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="secure-error" id="secure-login-error">
                            <HiOutlineLockClosed /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="secure-login-btn"
                        disabled={loading}
                        id="secure-login-submit"
                    >
                        {loading ? (
                            <span className="secure-spinner" />
                        ) : (
                            <>
                                <HiOutlineShieldCheck /> Access Dashboard
                            </>
                        )}
                    </button>
                </form>

                {/* Demo credentials */}
                <div className="secure-demo-creds">
                    <p className="secure-demo-title">Demo Credentials</p>
                    <div className="secure-demo-row">
                        <span className="secure-demo-label">Email:</span>
                        <code className="secure-demo-val">admin@ssscrackers.com</code>
                    </div>
                    <div className="secure-demo-row">
                        <span className="secure-demo-label">Password:</span>
                        <code className="secure-demo-val">Admin@SSS2026</code>
                    </div>
                </div>

                <Link to="/" className="secure-back-link">← Back to Store</Link>
            </div>
        </div>
    );
}
