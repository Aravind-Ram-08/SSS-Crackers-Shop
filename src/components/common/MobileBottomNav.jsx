import { Link, useLocation } from "react-router-dom";
import {
    HiOutlineHome, HiOutlineShoppingBag, HiOutlineShoppingCart,
    HiOutlinePhone,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";

export default function MobileBottomNav() {
    const { cartCount } = useCart();
    const { pathname } = useLocation();

    const items = [
        { to: "/", icon: HiOutlineHome, label: "Home" },
        { to: "/products", icon: HiOutlineShoppingBag, label: "Shop" },
        { to: "/cart", icon: HiOutlineShoppingCart, label: "Cart", badge: cartCount },
        { to: "/whatsapp-order", icon: HiOutlinePhone, label: "Order" },
    ];

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            {items.map(({ to, icon: Icon, label, badge }) => {
                const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                return (
                    <Link
                        key={to}
                        to={to}
                        className={`mobile-nav-btn ${active ? "active" : ""}`}
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                    >
                        <Icon aria-hidden="true" />
                        {badge > 0 && (
                            <span className="mobile-nav-badge" aria-hidden="true">{badge}</span>
                        )}
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
