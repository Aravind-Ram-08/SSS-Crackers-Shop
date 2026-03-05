import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    HiOutlineUser, HiOutlineShoppingBag, HiOutlineDocumentText,
    HiOutlineHeart, HiOutlineLocationMarker, HiOutlineBell,
    HiOutlineStar, HiOutlineLogout, HiOutlineMenu, HiOutlineX,
    HiOutlineGift,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import "./AccountLayout.css";

const NAV_ITEMS = [
    { to: "/account", label: "My Profile", icon: HiOutlineUser, end: true },
    { to: "/account/orders", label: "My Orders", icon: HiOutlineShoppingBag },
    { to: "/account/estimates", label: "Saved Estimates", icon: HiOutlineDocumentText },
    { to: "/account/wishlist", label: "Wishlist", icon: HiOutlineHeart },
    { to: "/account/addresses", label: "Addresses", icon: HiOutlineLocationMarker },
    { to: "/account/notifications", label: "Notifications", icon: HiOutlineBell, badge: true },
    { to: "/account/loyalty", label: "Loyalty Points", icon: HiOutlineStar },
    { to: "/account/referral", label: "Refer & Earn", icon: HiOutlineGift },
];

export default function AccountLayout() {
    const { user, logout, unreadCount } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/"); };
    const close = () => setSidebarOpen(false);

    const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="account-page">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            {sidebarOpen && <div className="acc-overlay" onClick={close} />}

            <aside className={`acc-sidebar ${sidebarOpen ? "acc-sidebar-open" : ""}`}>
                {/* User card */}
                <div className="acc-user-card">
                    <div className="acc-avatar">
                        {user?.avatar
                            ? <img src={user.avatar} alt={user.name} />
                            : <span>{initials}</span>
                        }
                    </div>
                    <div className="acc-user-info">
                        <p className="acc-user-name">{user?.name}</p>
                        <p className="acc-user-email">{user?.email}</p>
                        <p className="acc-user-pts">
                            <HiOutlineStar className="acc-pts-star" />
                            {user?.loyaltyPoints || 0} pts
                        </p>
                    </div>
                    <button className="acc-close-btn" onClick={close}><HiOutlineX /></button>
                </div>

                {/* Nav */}
                <nav className="acc-nav" aria-label="Account navigation">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
                        <NavLink
                            key={to} to={to} end={end}
                            className={({ isActive }) => `acc-nav-link ${isActive ? "acc-nav-active" : ""}`}
                            onClick={close}
                        >
                            <Icon className="acc-nav-icon" />
                            <span>{label}</span>
                            {badge && unreadCount > 0 && (
                                <span className="acc-nav-badge">{unreadCount}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <button className="acc-logout-btn" onClick={handleLogout} id="account-logout-btn">
                    <HiOutlineLogout /> Logout
                </button>
            </aside>

            {/* ── Main Content ──────────────────────────────────── */}
            <main className="acc-main">
                {/* Mobile top bar */}
                <div className="acc-topbar">
                    <button className="acc-topbar-menu" onClick={() => setSidebarOpen(true)} aria-label="Open account menu">
                        <HiOutlineMenu />
                    </button>
                    <span className="acc-topbar-title">My Account</span>
                    <div className="acc-topbar-avatar" onClick={() => setSidebarOpen(true)}>
                        {user?.avatar
                            ? <img src={user.avatar} alt="" />
                            : <span>{initials}</span>
                        }
                    </div>
                </div>

                <div className="acc-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
