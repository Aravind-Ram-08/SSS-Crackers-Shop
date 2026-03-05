import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
    HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardList,
    HiOutlineChartBar, HiOutlineMenu, HiOutlineX, HiOutlineLogout,
    HiOutlineBell, HiOutlineChevronRight, HiOutlineChatAlt2, HiOutlinePhone,
    HiOutlineTag, HiOutlineDocumentText, HiOutlineLocationMarker, HiOutlineSparkles,
} from "react-icons/hi";
import { useAdminData } from "../../context/AdminDataContext";
import "./AdminLayout.css";

const NAV_ITEMS = [
    { to: "/admin", label: "Dashboard", icon: HiOutlineChartBar, end: true },
    { to: "/admin/products", label: "Products", icon: HiOutlineShoppingBag },
    { to: "/admin/orders", label: "Orders", icon: HiOutlineClipboardList },
    { to: "/admin/order-tracking", label: "Order Tracking", icon: HiOutlineLocationMarker },
    { to: "/admin/festival-offers", label: "Festival & Offers", icon: HiOutlineSparkles },
    { to: "/admin/coupons", label: "Coupons", icon: HiOutlineTag },
    { to: "/admin/invoices", label: "Invoices", icon: HiOutlineDocumentText },
    { to: "/admin/enquiries", label: "Enquiries", icon: HiOutlinePhone },
    { to: "/admin/chatbot", label: "Chatbot", icon: HiOutlineChatAlt2 },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { stats } = useAdminData();
    const navigate = useNavigate();

    return (
        <div className={`admin-shell ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-brand">
                        <span className="sidebar-brand-icon">🧨</span>
                        {sidebarOpen && <span className="sidebar-brand-text">SSS Crackers</span>}
                    </Link>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(o => !o)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                    </button>
                </div>

                {sidebarOpen && <p className="sidebar-section-label">MAIN MENU</p>}

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                            }
                        >
                            <Icon className="sidebar-link-icon" />
                            {sidebarOpen && <span className="sidebar-link-label">{label}</span>}
                            {sidebarOpen && label === "Orders" && stats.pendingOrders > 0 && (
                                <span className="sidebar-badge">{stats.pendingOrders}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {sidebarOpen && (
                        <div className="sidebar-admin-info">
                            <div className="sidebar-admin-avatar">A</div>
                            <div>
                                <p className="sidebar-admin-name">Admin</p>
                                <p className="sidebar-admin-role">Super Admin</p>
                            </div>
                        </div>
                    )}
                    <Link to="/" className="sidebar-exit-btn" title="Back to Store">
                        <HiOutlineHome />
                        {sidebarOpen && <span>Store</span>}
                    </Link>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="topbar-breadcrumb">
                        <Link to="/admin" className="topbar-brand-link">Admin</Link>
                        <HiOutlineChevronRight className="topbar-sep" />
                        <span className="topbar-page-name" id="admin-page-title">Dashboard</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-alert">
                            <HiOutlineBell />
                            {stats.pendingOrders > 0 && (
                                <span className="topbar-alert-dot">{stats.pendingOrders}</span>
                            )}
                        </div>
                        <div className="topbar-avatar">A</div>
                    </div>
                </header>

                {/* Page content rendered by child routes */}
                <Outlet />
            </div>
        </div>
    );
}
