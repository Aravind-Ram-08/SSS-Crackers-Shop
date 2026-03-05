import { HiOutlineBell, HiOutlineTag, HiOutlineLightningBolt, HiOutlineShoppingBag, HiOutlineStar, HiOutlineCheck } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AccountPages.css";

const TYPE_META = {
    offer: { icon: HiOutlineTag, color: "#ff8c00", bg: "rgba(255,140,0,0.12)" },
    flash: { icon: HiOutlineLightningBolt, color: "#f87171", bg: "rgba(239,68,68,0.1)" },
    order: { icon: HiOutlineShoppingBag, color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
    loyalty: { icon: HiOutlineStar, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    default: { icon: HiOutlineBell, color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
};

function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AccountNotifications() {
    const { user, markNotificationRead, markAllRead, unreadCount } = useAuth();
    const notifications = [...(user?.notifications || [])].reverse();

    return (
        <div className="acc-sub-page">
            <div className="acc-page-header">
                <h2 className="acc-page-title">
                    Notifications
                    {unreadCount > 0 && <span className="acc-count-badge">{unreadCount} new</span>}
                </h2>
                {unreadCount > 0 && (
                    <button className="acc-btn-outline" onClick={markAllRead}>
                        <HiOutlineCheck /> Mark All Read
                    </button>
                )}
            </div>

            {notifications.length === 0 && (
                <div className="acc-empty-state">
                    <span className="acc-empty-icon">🔔</span>
                    <h3>No notifications yet</h3>
                    <p>We'll notify you about offers, flash sales, and order updates.</p>
                </div>
            )}

            <div className="notif-list">
                {notifications.map(n => {
                    const meta = TYPE_META[n.type] || TYPE_META.default;
                    const Icon = meta.icon;
                    return (
                        <div
                            key={n.id}
                            className={`notif-card ${n.read ? "" : "notif-unread"}`}
                            onClick={() => !n.read && markNotificationRead(n.id)}
                        >
                            <div className="notif-icon-wrap" style={{ background: meta.bg, color: meta.color }}>
                                <Icon />
                            </div>
                            <div className="notif-body">
                                <p className="notif-title">{n.title}</p>
                                <p className="notif-msg">{n.message}</p>
                                <p className="notif-time">{timeAgo(n.time)}</p>
                            </div>
                            {!n.read && <span className="notif-dot" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
