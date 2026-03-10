import { useState } from "react";
import { useAdminData, REVENUE_DATA } from "../../context/AdminDataContext";
import { formatPrice } from "../../utils/helpers";
import {
    HiOutlineCurrencyRupee, HiOutlineClipboardList,
    HiOutlineTrendingUp, HiOutlineChartBar,
    HiOutlineShoppingBag,
} from "react-icons/hi";
import "./AdminAnalytics.css";

// Monthly revenue SVG line chart
function LineChart({ data, color = "#ff6a00" }) {
    const W = 560, H = 140, PAD = 36;
    const maxV = Math.max(...data.map(d => d.revenue));
    const minV = Math.min(...data.map(d => d.revenue));
    const range = maxV - minV || 1;
    const pts = data.map((d, i) => ({
        x: PAD + (i * (W - PAD * 2)) / (data.length - 1),
        y: PAD + ((1 - (d.revenue - minV) / range) * (H - PAD)),
        label: d.month,
        val: d.revenue,
    }));
    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="analytics-chart-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map(t => (
                <line key={t}
                    x1={PAD} y1={PAD + (1 - t) * (H - PAD)}
                    x2={W - PAD} y2={PAD + (1 - t) * (H - PAD)}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1"
                />
            ))}
            {/* Area fill */}
            <path d={areaD} fill="url(#lineArea)" />
            {/* Line */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Points */}
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="#0d0d20" strokeWidth="2" />
                    <text x={p.x} y={H + 14} fill="#555588" fontSize="10" textAnchor="middle">{p.label}</text>
                </g>
            ))}
        </svg>
    );
}

// Bar chart
function BarChart({ data, color = "#8b5cf6", label = "revenue" }) {
    const W = 480, H = 140, PAD = 36, GAP = 8;
    const maxV = Math.max(...data.map(d => d[label] || 0)) || 1;
    const n = data.length;
    const barW = (W - PAD * 2 - GAP * (n - 1)) / n;

    return (
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="analytics-chart-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
            </defs>
            {data.map((d, i) => {
                const barH = (((d[label] || 0) / maxV) * (H - PAD));
                const x = PAD + i * (barW + GAP);
                const y = H - barH;
                return (
                    <g key={i}>
                        <rect x={x} y={PAD} width={barW} height={H - PAD} rx="5" fill="rgba(255,255,255,0.02)" />
                        <rect x={x} y={y} width={barW} height={barH} rx="5" fill="url(#barFill)" />
                        <text x={x + barW / 2} y={H + 14} fill="#555588" fontSize="9" textAnchor="middle">{d.name}</text>
                    </g>
                );
            })}
        </svg>
    );
}

// Donut chart for categories
function DonutChart({ data }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const COLORS = ["#ff6a00", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#a3e635"];
    let cumAngle = -90;
    const R = 60, CX = 75, CY = 75;

    function polarToXY(angle, r) {
        const rad = (angle * Math.PI) / 180;
        return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
    }

    const slices = data.slice(0, 8).map((d, i) => {
        const angle = (d.value / total) * 360;
        const start = cumAngle;
        cumAngle += angle;
        const largeArc = angle > 180 ? 1 : 0;
        const s = polarToXY(start, R);
        const e = polarToXY(start + angle, R);
        const path = `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
        return { path, color: COLORS[i % COLORS.length], label: d.name, value: d.value };
    });

    return (
        <div className="donut-wrap">
            <svg viewBox="0 0 150 150" className="donut-svg">
                <circle cx={CX} cy={CY} r={R} fill="rgba(255,255,255,0.02)" />
                {slices.map((s, i) => (
                    <path key={i} d={s.path} fill={s.color} opacity="0.85" />
                ))}
                <circle cx={CX} cy={CY} r={R * 0.55} fill="#0d0d20" />
                <text x={CX} y={CY - 6} fill="#e0e0e8" fontSize="11" textAnchor="middle" fontWeight="700">
                    {data.length}
                </text>
                <text x={CX} y={CY + 8} fill="#555588" fontSize="8" textAnchor="middle">
                    categories
                </text>
            </svg>
            <div className="donut-legend">
                {slices.map((s, i) => (
                    <div key={i} className="donut-legend-item">
                        <span className="donut-legend-dot" style={{ background: s.color }} />
                        <span className="donut-legend-name">{s.label}</span>
                        <span className="donut-legend-val">{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Weekly mock data derived from revenue
function getWeeklyData() {
    return [
        { name: "Mon", revenue: 12400 },
        { name: "Tue", revenue: 8200 },
        { name: "Wed", revenue: 15800 },
        { name: "Thu", revenue: 9600 },
        { name: "Fri", revenue: 21300 },
        { name: "Sat", revenue: 34500 },
        { name: "Sun", revenue: 28900 },
    ];
}

export default function AdminAnalytics() {
    const { orders, products, stats } = useAdminData();
    const [period, setPeriod] = useState("monthly");

    // Top products by order frequency
    const productSales = {};
    orders.forEach(o => {
        if (o.status === "cancelled") return;
        o.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.qty;
        });
    });
    const topProducts = Object.entries(productSales)
        .map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, revenue: qty * (orders.flatMap(o => o.items).find(i => i.name === name)?.price || 0), qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);

    // Top categories
    const catRevenue = {};
    orders.forEach(o => {
        if (o.status === "cancelled") return;
        o.items.forEach(item => {
            const prod = products.find(p => p.id === item.id || p.name === item.name);
            const cat = prod?.category || "Unknown";
            catRevenue[cat] = (catRevenue[cat] || 0) + item.qty * item.price;
        });
    });
    const topCats = Object.entries(catRevenue)
        .map(([name, value]) => ({ name: name.split(" ")[0], value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const catSegments = Object.entries(catRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const weeklyData = getWeeklyData();
    const weeklyRevenue = weeklyData.reduce((s, d) => s + d.revenue, 0);

    // Today's stats (mock with most recent orders)
    const today = new Date().toLocaleDateString("en-CA");
    const todayOrders = orders.filter(o => o.date === today || orders.indexOf(o) < 2);
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.status !== "cancelled" ? o.total : 0), 0);

    const KPI = [
        {
            id: "kpi-total-rev",
            label: "Total Revenue",
            value: formatPrice(stats.totalRevenue),
            sub: "All time (excl. cancelled)",
            icon: HiOutlineCurrencyRupee,
            color: "#ff6a00",
            glow: "rgba(255,106,0,0.2)",
        },
        {
            id: "kpi-total-orders",
            label: "Total Orders",
            value: stats.totalOrders,
            sub: `${stats.deliveredOrders} delivered`,
            icon: HiOutlineClipboardList,
            color: "#3b82f6",
            glow: "rgba(59,130,246,0.2)",
        },
        {
            id: "kpi-avg-order",
            label: "Avg. Order Value",
            value: formatPrice(stats.avgOrderValue),
            sub: "Per confirmed order",
            icon: HiOutlineTrendingUp,
            color: "#8b5cf6",
            glow: "rgba(139,92,246,0.2)",
        },
        {
            id: "kpi-weekly-rev",
            label: "Weekly Revenue",
            value: formatPrice(weeklyRevenue),
            sub: "Last 7 days",
            icon: HiOutlineChartBar,
            color: "#10b981",
            glow: "rgba(16,185,129,0.2)",
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Sales Analytics</h1>
                    <p className="admin-page-sub">Comprehensive sales performance and revenue insights</p>
                </div>
                <div className="analytics-period-tabs">
                    {["monthly", "weekly"].map(p => (
                        <button
                            key={p}
                            className={`analytics-period-btn ${period === p ? "active" : ""}`}
                            onClick={() => setPeriod(p)}
                            id={`period-${p}`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── KPI Row ─────────────────────────────────────────── */}
            <div className="kpi-grid">
                {KPI.map(k => (
                    <div key={k.id} id={k.id} className="kpi-card" style={{ "--accent": k.color, "--glow": k.glow }}>
                        <div className="kpi-icon-wrap">
                            <k.icon className="kpi-icon" />
                        </div>
                        <div className="kpi-body">
                            <p className="kpi-label">{k.label}</p>
                            <p className="kpi-value">{k.value}</p>
                            <p className="kpi-sub">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts Grid ──────────────────────────────────────── */}
            <div className="analytics-charts-grid">
                {/* Monthly / Weekly Revenue */}
                <div className="admin-card analytics-chart-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">
                            {period === "monthly" ? "Monthly Revenue" : "Daily Revenue (This Week)"}
                        </h3>
                        <span className="admin-card-sub">
                            {period === "monthly" ? "Last 7 months" : "Mon–Sun"}
                        </span>
                    </div>
                    <LineChart
                        data={period === "monthly" ? REVENUE_DATA : weeklyData}
                        color="#ff6a00"
                    />
                    <div className="analytics-chart-totals">
                        <div className="analytics-total-item">
                            <span className="analytics-total-label">Period Total</span>
                            <span className="analytics-total-value">
                                {formatPrice(period === "monthly"
                                    ? REVENUE_DATA.reduce((s, d) => s + d.revenue, 0)
                                    : weeklyRevenue
                                )}
                            </span>
                        </div>
                        <div className="analytics-total-item">
                            <span className="analytics-total-label">Avg / Period</span>
                            <span className="analytics-total-value">
                                {formatPrice(Math.round((period === "monthly"
                                    ? REVENUE_DATA.reduce((s, d) => s + d.revenue, 0)
                                    : weeklyRevenue) / (period === "monthly" ? REVENUE_DATA.length : 7)
                                ))}
                            </span>
                        </div>
                        <div className="analytics-total-item">
                            <span className="analytics-total-label">Peak</span>
                            <span className="analytics-total-value">
                                {formatPrice(Math.max(...(period === "monthly" ? REVENUE_DATA : weeklyData).map(d => d.revenue)))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Categories Donut */}
                <div className="admin-card analytics-chart-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Revenue by Category</h3>
                        <span className="admin-card-sub">All orders</span>
                    </div>
                    {catSegments.length > 0 ? (
                        <DonutChart data={catSegments} />
                    ) : (
                        <div className="analytics-empty">No order data available</div>
                    )}
                </div>
            </div>

            {/* ── Top Products + Top Categories Bar ──────────────── */}
            <div className="analytics-bottom-grid">
                {/* Top Products */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Top Selling Products</h3>
                        <span className="admin-card-sub">By quantity sold</span>
                    </div>
                    {topProducts.length > 0 ? (
                        <>
                            <BarChart data={topProducts.map(p => ({ name: p.name, revenue: p.qty }))} color="#ff6a00" label="revenue" />
                            <div className="analytics-top-list">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="analytics-top-row">
                                        <span className="analytics-rank">{i + 1}</span>
                                        <span className="analytics-top-name">{p.name}</span>
                                        <span className="analytics-top-qty">{p.qty} units</span>
                                        <span className="analytics-top-rev">{formatPrice(p.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="analytics-empty">No sales data available yet</div>
                    )}
                </div>

                {/* Top Categories */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Top Categories by Revenue</h3>
                        <span className="admin-card-sub">Revenue generated</span>
                    </div>
                    {topCats.length > 0 ? (
                        <>
                            <BarChart data={topCats} color="#8b5cf6" label="value" />
                            <div className="analytics-top-list">
                                {topCats.slice(0, 5).map((c, i) => (
                                    <div key={i} className="analytics-top-row">
                                        <span className="analytics-rank">{i + 1}</span>
                                        <span className="analytics-top-name">{c.name}</span>
                                        <div className="analytics-cat-bar-wrap">
                                            <div
                                                className="analytics-cat-bar"
                                                style={{
                                                    width: `${(c.value / (topCats[0]?.value || 1)) * 100}%`,
                                                    background: "#8b5cf6",
                                                }}
                                            />
                                        </div>
                                        <span className="analytics-top-rev">{formatPrice(c.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="analytics-empty">No sales data available yet</div>
                    )}
                </div>
            </div>

            {/* ── Order Status Summary ──────────────────────────────── */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Order Status Breakdown</h3>
                    <span className="admin-card-sub">{stats.totalOrders} total orders</span>
                </div>
                <div className="analytics-status-grid">
                    {[
                        { label: "Pending", count: orders.filter(o => o.status === "pending").length, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                        { label: "Processing", count: orders.filter(o => o.status === "processing").length, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                        { label: "Shipped", count: orders.filter(o => o.status === "shipped").length, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
                        { label: "Delivered", count: orders.filter(o => o.status === "delivered").length, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                        { label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                    ].map(s => (
                        <div key={s.label} className="analytics-status-card" style={{ background: s.bg, borderColor: s.color + "33" }}>
                            <p className="analytics-status-count" style={{ color: s.color }}>{s.count}</p>
                            <p className="analytics-status-label">{s.label}</p>
                            <div className="analytics-status-pct-bar">
                                <div
                                    className="analytics-status-pct-fill"
                                    style={{
                                        width: `${stats.totalOrders > 0 ? Math.round((s.count / stats.totalOrders) * 100) : 0}%`,
                                        background: s.color,
                                    }}
                                />
                            </div>
                            <p className="analytics-status-pct-label">
                                {stats.totalOrders > 0 ? Math.round((s.count / stats.totalOrders) * 100) : 0}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
