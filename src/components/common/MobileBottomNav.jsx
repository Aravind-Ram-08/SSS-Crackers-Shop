import { Link, useLocation } from "react-router-dom";
import {
    HiOutlineHome, HiHome,
    HiOutlineShoppingBag, HiShoppingBag,
    HiOutlineShoppingCart, HiShoppingCart,
    HiOutlinePhone, HiPhone,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";

export default function MobileBottomNav() {
    const { cartCount } = useCart();
    const { pathname } = useLocation();

    const items = [
        {
            to: "/",
            iconIdle: HiOutlineHome,
            iconActive: HiHome,
            label: "Home",
        },
        {
            to: "/products",
            iconIdle: HiOutlineShoppingBag,
            iconActive: HiShoppingBag,
            label: "Shop",
        },
        {
            to: "/cart",
            iconIdle: HiOutlineShoppingCart,
            iconActive: HiShoppingCart,
            label: "Cart",
            badge: cartCount,
        },
        {
            to: "/whatsapp-order",
            iconIdle: HiOutlinePhone,
            iconActive: HiPhone,
            label: "Order",
        },
    ];

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            {items.map(({ to, iconIdle: IconIdle, iconActive: IconActive, label, badge }) => {
                const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                const Icon = active ? IconActive : IconIdle;
                return (
                    <Link
                        key={to}
                        to={to}
                        className={`mobile-nav-btn ${active ? "active" : ""}`}
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                        id={`bottom-nav-${label.toLowerCase()}`}
                    >
                        <span className="nav-icon-wrap">
                            <Icon aria-hidden="true" />
                            {badge > 0 && (
                                <span className="mobile-nav-badge" aria-hidden="true" key={badge}>
                                    {badge}
                                </span>
                            )}
                        </span>
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
