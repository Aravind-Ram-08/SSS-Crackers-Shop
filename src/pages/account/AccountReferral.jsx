import { useState } from "react";
import { HiOutlineClipboardCopy, HiOutlineShare, HiOutlineCheck } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AccountPages.css";

export default function AccountReferral() {
    const { user } = useAuth();
    const code = user?.referralCode || "—";
    const link = `https://ssscrackers.com/signup?ref=${code}`;
    const [copied, setCopied] = useState(false);

    const copy = async (text) => {
        try { await navigator.clipboard.writeText(text); }
        catch { /* fallback */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWA = () => {
        const msg = encodeURIComponent(`🧨 Join SSS Crackers with my referral code *${code}* and get 100 bonus loyalty points!\n\n${link}`);
        window.open(`https://wa.me/?text=${msg}`, "_blank");
    };

    return (
        <div className="acc-sub-page">
            <h2 className="acc-page-title">Refer &amp; Earn 🎁</h2>

            {/* Hero */}
            <div className="referral-hero acc-section-card">
                <div className="referral-hero-text">
                    <h3>Invite friends, earn rewards!</h3>
                    <p>Share your unique referral code. When a friend signs up using your code:</p>
                    <ul className="referral-benefits">
                        <li>🌟 You earn <strong>150 loyalty points</strong></li>
                        <li>🎉 Your friend gets <strong>100 bonus points</strong></li>
                    </ul>
                </div>
                <span className="referral-firework">🎆</span>
            </div>

            {/* Code */}
            <div className="acc-section-card">
                <h3 className="acc-section-title">Your Referral Code</h3>
                <div className="referral-code-box">
                    <span className="referral-code">{code}</span>
                    <button className="referral-copy-btn" onClick={() => copy(code)}>
                        {copied ? <HiOutlineCheck /> : <HiOutlineClipboardCopy />}
                        {copied ? "Copied!" : "Copy Code"}
                    </button>
                </div>

                <h3 className="acc-section-title" style={{ marginTop: "1.25rem" }}>Your Referral Link</h3>
                <div className="referral-link-box">
                    <span className="referral-link-text">{link}</span>
                    <button className="referral-copy-btn" onClick={() => copy(link)}>
                        {copied ? <HiOutlineCheck /> : <HiOutlineClipboardCopy />}
                        {copied ? "Copied!" : "Copy Link"}
                    </button>
                </div>

                <button className="acc-btn-green referral-wa-btn" onClick={shareWA}>
                    <HiOutlineShare /> Share on WhatsApp
                </button>
            </div>

            {/* Stats */}
            <div className="acc-section-card">
                <h3 className="acc-section-title">Your Referral Stats</h3>
                <div className="referral-stats-grid">
                    {[
                        { label: "Total Referrals", value: user?.loyaltyHistory?.filter(h => h.reason?.includes("Referral:")).length || 0, icon: "👥" },
                        { label: "Points Earned", value: user?.loyaltyHistory?.filter(h => h.reason?.includes("Referral:")).reduce((s, h) => s + h.pts, 0) || 0, icon: "🌟" },
                    ].map(({ label, value, icon }) => (
                        <div className="referral-stat-card" key={label}>
                            <span className="referral-stat-icon">{icon}</span>
                            <p className="referral-stat-value">{value}</p>
                            <p className="referral-stat-label">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
