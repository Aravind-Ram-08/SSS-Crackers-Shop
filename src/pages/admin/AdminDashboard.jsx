import { useAdminData, REVENUE_DATA } from "../../context/AdminDataContext";
import { formatPrice } from "../../utils/helpers";
import {
    HiOutlineCurrencyRupee, HiOutlineShoppingCart,
    HiOutlineClipboardList, HiOutlineTrendingUp,
    HiOutlineExclamationCircle, HiOutlineCheckCircle,
    HiOutlineBan,
} from "react-icons/hi";
import "./AdminDashboard.css";

// ── Tiny SVG Bar Chart ────────────────────────────────────────────────────────
function RevenueChart({ data }) {
    const maxRev = Math.max(...data.map(d => d.revenue));
    const W = 600, H = 180, PAD = 40, BAR_GAP = 12;
    const barW = (W - PAD * 2 - BAR_GAP * (data.length - 1)) / data.length;

    return (
        <svg viewBox={`0 0 ${W} ${H + 30}`} className="revenue-chart-svg" preserveAspectRatio="xMidYMid meet">
            {/* Y grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
                const y = PAD + (1 - t) * H;
                return (
                    <g key={t}>
                        <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <text x={PAD - 6} y={y + 4} fill="#44446a" fontSize="10" textAnchor="end">
                            {t > 0 ? `₹${Math.round(maxRev * t / 1000)}k` : "₹0"}
                        </text>
                    </g>
                );
            })}
            {/* Bars */}
            {data.map((d, i) => {
                const barH = (d.revenue / maxRev) * H;
                const x = PAD + i * (barW + BAR_GAP);
                const y = PAD + H - barH;
                const isLast = i === data.length - 1;
                return (
                    <g key={d.month}>
                        {/* Bar background */}
                        <rect x={x} y={PAD} width={barW} height={H} rx="6" fill="rgba(255,255,255,0.02)" />
                        {/* Bar fill */}
                        <rect x={x} y={y} width={barW} height={barH} rx="6"
                            fill={isLast ? "url(#barGrad)" : "rgba(255,106,0,0.35)"} />
                        {/* Month label */}
                        <text x={x + barW / 2} y={PAD + H + 18} fill={isLast ? "#ff8c00" : "#44446a"}
                            fontSize="11" textAnchor="middle" fontWeight={isLast ? "700" : "400"}>
                            {d.month}
                        </text>
                        {/* Value on hover — always show for last */}
                        {isLast && (
                            <text x={x + barW / 2} y={y - 6} fill="#ff8c00" fontSize="10"
                                textAnchor="middle" fontWeight="700">
                                ₹{Math.round(d.revenue / 1000)}k
                            </text>
                        )}
                    </g>
                );
            })}
            <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6a00" />
                    <stop offset="100%" stopColor="#ee0979" stopOpacity="0.7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    processing: { label: "Processing", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    shipped: { label: "Shipped", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
    delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function AdminDashboard() {
    const { stats, orders } = useAdminData();

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const KPI_CARDS = [
        {
            id: "total-revenue",
            label: "Total Revenue",
            value: formatPrice(stats.totalRevenue),
            sub: "Excluding cancelled orders",
            icon: HiOutlineCurrencyRupee,
            accent: "#ff6a00",
            glow: "rgba(255,106,0,0.2)",
        },
        {
            id: "total-orders",
            label: "Total Orders",
            value: stats.totalOrders,
            sub: `${stats.pendingOrders} need attention`,
            icon: HiOutlineClipboardList,
            accent: "#3b82f6",
            glow: "rgba(59,130,246,0.2)",
        },
        {
            id: "avg-order",
            label: "Avg. Order Value",
            value: formatPrice(stats.avgOrderValue),
            sub: "Per confirmed order",
            icon: HiOutlineTrendingUp,
            accent: "#8b5cf6",
            glow: "rgba(139,92,246,0.2)",
        },
        {
            id: "delivered-orders",
            label: "Delivered",
            value: stats.deliveredOrders,
            sub: `${stats.cancelledOrders} cancelled`,
            icon: HiOutlineCheckCircle,
            accent: "#10b981",
            glow: "rgba(16,185,129,0.2)",
        },
    ];

    return (
        <div className="admin-page admin-dashboard">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard</h1>
                    <p className="admin-page-sub">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <span className="admin-page-date">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            {/* ── KPI Cards ─────────────────────────────────────────── */}
            <div className="kpi-grid">
                {KPI_CARDS.map(card => (
                    <div className="kpi-card" key={card.id} id={card.id}
                        style={{ "--accent": card.accent, "--glow": card.glow }}>
                        <div className="kpi-icon-wrap">
                            <card.icon className="kpi-icon" />
                        </div>
                        <div className="kpi-body">
                            <p className="kpi-label">{card.label}</p>
                            <p className="kpi-value">{card.value}</p>
                            <p className="kpi-sub">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Revenue Chart + Order Status ──────────────────────── */}
            <div className="dash-mid-grid">
                {/* Revenue Chart */}
                <div className="admin-card chart-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Revenue Overview</h3>
                        <span className="admin-card-sub">Last 7 months</span>
                    </div>
                    <RevenueChart data={REVENUE_DATA} />
                </div>

                {/* Order Status Breakdown */}
                <div className="admin-card status-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Order Status</h3>
                    </div>
                    <div className="status-breakdown">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                            const count = orders.filter(o => o.status === key).length;
                            const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                            return (
                                <div className="status-row" key={key}>
                                    <div className="status-row-left">
                                        <span className="status-dot" style={{ background: cfg.color }} />
                                        <span className="status-row-label">{cfg.label}</span>
                                    </div>
                                    <div className="status-bar-wrap">
                                        <div className="status-bar-bg">
                                            <div className="status-bar-fill"
                                                style={{ width: `${pct}%`, background: cfg.color }} />
                                        </div>
                                        <span className="status-row-count">{count}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick alerts */}
                    {stats.pendingOrders > 0 && (
                        <div className="dash-alert">
                            <HiOutlineExclamationCircle className="dash-alert-icon" />
                            <span>{stats.pendingOrders} orders need your attention</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Recent Orders ─────────────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Recent Orders</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => {
                                const cfg = STATUS_CONFIG[order.status];
                                return (
                                    <tr key={order.id}>
                                        <td><span className="order-id-cell">{order.id}</span></td>
                                        <td>
                                            <div className="customer-cell">
                                                <span className="customer-name">{order.customer.name}</span>
                                                <span className="customer-email">{order.customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{order.date}</td>
                                        <td className="text-muted">{order.items.reduce((s, i) => s + i.qty, 0)} items</td>
                                        <td><strong className="amount-cell">{formatPrice(order.total)}</strong></td>
                                        <td>
                                            <span className="status-pill"
                                                style={{ color: cfg.color, background: cfg.bg }}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
