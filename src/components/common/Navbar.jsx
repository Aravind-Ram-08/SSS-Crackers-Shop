import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    HiOutlineShoppingCart, HiOutlineMenu, HiOutlineX,
    HiOutlineChevronDown, HiOutlineSearch, HiOutlineUser,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { categories } from "../../data/products";
import "./Navbar.css";

export default function Navbar() {
    const { cartCount } = useCart();
    const { user, unreadCount } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [shopOpen, setShopOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cartAnimate, setCartAnimate] = useState(false);
    const prevCountRef = useRef(cartCount);
    const shopRef = useRef(null);
    const searchRef = useRef(null);

    // Cart bounce animation on count change
    useEffect(() => {
        if (cartCount > prevCountRef.current) {
            setCartAnimate(true);
            const t = setTimeout(() => setCartAnimate(false), 600);
            return () => clearTimeout(t);
        }
        prevCountRef.current = cartCount;
    }, [cartCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (shopRef.current && !shopRef.current.contains(e.target)) {
                setShopOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Close mobile on route change
    const closeMobile = () => setMobileOpen(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setSearchOpen(false);
            closeMobile();
        }
    };

    return (
        <header className="navbar" role="banner">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={closeMobile} aria-label="SSS Crackers home">
                    <span className="logo-icon" aria-hidden="true">🧨</span>
                    <span className="logo-text">
                        SSS<span className="logo-highlight"> Crackers</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={`navbar-nav ${mobileOpen ? "nav-open" : ""}`} aria-label="Main navigation">
                    <NavLink to="/" className="nav-link" onClick={closeMobile} end>
                        Home
                    </NavLink>

                    {/* Shop dropdown */}
                    <div className="nav-dropdown" ref={shopRef}>
                        <button
                            className={`nav-link nav-dropdown-btn ${shopOpen ? "active" : ""}`}
                            onClick={() => setShopOpen(s => !s)}
                            aria-expanded={shopOpen}
                            aria-haspopup="true"
                        >
                            Shop <HiOutlineChevronDown className={`dropdown-arrow ${shopOpen ? "open" : ""}`} />
                        </button>
                        {shopOpen && (
                            <div className="dropdown-menu" role="menu">
                                <Link
                                    to="/products"
                                    className="dropdown-item dropdown-item-all"
                                    onClick={() => { setShopOpen(false); closeMobile(); }}
                                    role="menuitem"
                                >
                                    <span>🧨</span> All Products
                                </Link>
                                <div className="dropdown-divider" />
                                <div className="dropdown-grid">
                                    {categories.slice(0, 12).map(cat => (
                                        <Link
                                            key={cat.slug}
                                            to={`/products?category=${cat.slug}`}
                                            className="dropdown-item"
                                            onClick={() => { setShopOpen(false); closeMobile(); }}
                                            role="menuitem"
                                        >
                                            <span>{cat.icon}</span> {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <NavLink to="/whatsapp-order" className="nav-link" onClick={closeMobile}>
                        Order
                    </NavLink>

                    <NavLink to="/track-order" className="nav-link" onClick={closeMobile}>
                        📍 Track
                    </NavLink>

                    <NavLink to="/products?category=special-items" className="nav-link nav-link-offers" onClick={closeMobile}>
                        🔥 Offers
                    </NavLink>

                    <NavLink to="/cart" className="nav-link nav-mobile-only" onClick={closeMobile}>
                        🛒 Cart {cartCount > 0 && <span className="mobile-cart-count">({cartCount})</span>}
                    </NavLink>

                    <NavLink to="/admin" className="nav-link nav-link-admin" onClick={closeMobile}>
                        Admin
                    </NavLink>
                </nav>

                {/* Right Actions */}
                <div className="navbar-actions">
                    {/* Inline search */}
                    <div className={`nav-search ${searchOpen ? "search-active" : ""}`} ref={searchRef}>
                        {searchOpen ? (
                            <form className="nav-search-form" onSubmit={handleSearch}>
                                <input
                                    autoFocus
                                    type="search"
                                    className="nav-search-input"
                                    placeholder="Search crackers..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    aria-label="Search products"
                                />
                                <button type="submit" className="nav-action-btn" aria-label="Submit search">
                                    <HiOutlineSearch />
                                </button>
                                <button
                                    type="button"
                                    className="nav-action-btn"
                                    onClick={() => setSearchOpen(false)}
                                    aria-label="Close search"
                                >
                                    <HiOutlineX />
                                </button>
                            </form>
                        ) : (
                            <button
                                className="nav-action-btn search-btn"
                                aria-label="Search"
                                onClick={() => setSearchOpen(true)}
                            >
                                <HiOutlineSearch />
                            </button>
                        )}
                    </div>

                    {/* Cart with bounce animation */}
                    <Link
                        to="/cart"
                        className={`nav-action-btn cart-btn ${cartAnimate ? "cart-animate" : ""}`}
                        aria-label={`Cart, ${cartCount} items`}
                        id="nav-cart-btn"
                    >
                        <HiOutlineShoppingCart />
                        {cartCount > 0 && (
                            <span className="cart-badge" aria-hidden="true" key={cartCount}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Account button */}
                    <Link
                        to={user ? "/account" : "/login"}
                        className="nav-action-btn nav-account-btn"
                        aria-label={user ? "My Account" : "Login"}
                        id="nav-account-btn"
                    >
                        {user?.avatar
                            ? <img src={user.avatar} alt="" className="nav-avatar-img" />
                            : <HiOutlineUser />
                        }
                        {unreadCount > 0 && <span className="nav-notif-dot" />}
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        className="nav-action-btn mobile-toggle"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(s => !s)}
                        id="mobile-menu-toggle"
                    >
                        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="nav-overlay"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}
        </header>
    );
}
