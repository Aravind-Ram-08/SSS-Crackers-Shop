import { HiOutlineStar, HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
import { useAuth, POINTS_PER_RUPEE, RUPEES_PER_POINT } from "../../context/AuthContext";
import "./AccountPages.css";

export default function AccountLoyalty() {
    const { user } = useAuth();
    const pts = user?.loyaltyPoints || 0;
    const history = [...(user?.loyaltyHistory || [])].reverse();
    const rupeeValue = (pts * RUPEES_PER_POINT).toFixed(2);

    return (
        <div className="acc-sub-page">
            <h2 className="acc-page-title">Loyalty Points</h2>

            {/* Balance card */}
            <div className="loyalty-hero-card">
                <div className="loyalty-hero-left">
                    <HiOutlineStar className="loyalty-star" />
                    <div>
                        <p className="loyalty-pts-label">Your Balance</p>
                        <p className="loyalty-pts-value">{pts.toLocaleString()} pts</p>
                        <p className="loyalty-rupee-val">≈ ₹{rupeeValue} in savings</p>
                    </div>
                </div>
                <div className="loyalty-hero-right">
                    <div className="loyalty-rule">
                        <span className="loyalty-rule-icon">🛒</span>
                        <p>₹100 spent = <strong>10 pts</strong></p>
                    </div>
                    <div className="loyalty-rule">
                        <span className="loyalty-rule-icon">🎁</span>
                        <p>10 pts = <strong>₹5 off</strong></p>
                    </div>
                </div>
            </div>

            {/* Earn more tips */}
            <div className="acc-section-card">
                <h3 className="acc-section-title">🌟 Earn More Points</h3>
                <div className="loyalty-earn-grid">
                    {[
                        { icon: "🛍️", action: "Place an order", pts: "10 pts per ₹100" },
                        { icon: "📣", action: "Refer a friend", pts: "150 pts" },
                        { icon: "🎉", action: "Friend signs up", pts: "100 pts for them" },
                        { icon: "⭐", action: "Write a review", pts: "25 pts" },
                        { icon: "🎂", action: "Birthday bonus", pts: "200 pts" },
                        { icon: "🆕", action: "First order bonus", pts: "50 pts" },
                    ].map(({ icon, action, pts: p }) => (
                        <div className="loyalty-earn-card" key={action}>
                            <span className="loyalty-earn-icon">{icon}</span>
                            <p className="loyalty-earn-action">{action}</p>
                            <span className="loyalty-earn-pts">{p}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            <div className="acc-section-card">
                <h3 className="acc-section-title">📜 Points History</h3>
                {!history.length && <p className="acc-muted">No transactions yet.</p>}
                <div className="loyalty-history-list">
                    {history.map((h, i) => (
                        <div key={i} className="loyalty-history-row">
                            <span className={`loyalty-history-icon ${h.pts > 0 ? "earn" : "spend"}`}>
                                {h.pts > 0 ? <HiOutlineArrowUp /> : <HiOutlineArrowDown />}
                            </span>
                            <div className="loyalty-history-info">
                                <p>{h.reason}</p>
                                <p className="loyalty-history-date">{new Date(h.date).toLocaleDateString("en-IN")}</p>
                            </div>
                            <span className={`loyalty-history-pts ${h.pts > 0 ? "earn" : "spend"}`}>
                                {h.pts > 0 ? `+${h.pts}` : h.pts} pts
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
