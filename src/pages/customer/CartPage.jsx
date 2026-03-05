import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HiOutlineTrash,
    HiOutlineShoppingCart,
    HiOutlineArrowRight,
    HiOutlineChevronLeft,
    HiPlus,
    HiMinus,
    HiOutlineTag,
    HiOutlineX,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { useCoupons } from "../../context/CouponContext";
import { formatPrice } from "../../utils/helpers";
import "./CartPage.css";

const COLORS = [
    ["#ff6a00", "#ee0979"],
    ["#f7971e", "#ffd200"],
    ["#00c6ff", "#0072ff"],
    ["#11998e", "#38ef7d"],
    ["#fc5c7d", "#6a82fb"],
    ["#f953c6", "#b91d73"],
    ["#9b59b6", "#3498db"],
    ["#e44d26", "#f16529"],
    ["#5f2c82", "#49a09d"],
    ["#c94b4b", "#4b134f"],
];

const CATEGORY_EMOJIS = {
    "one-sound-crackers": "💥",
    "deluxe-crackers": "🎆",
    "giant-chorsa": "⚡",
    "bijili-crackers": "🔥",
    "ground-chakkar": "🌀",
    "flower-pots": "🌸",
    "garland-bang-crackers": "🧨",
    "pencil": "✏️",
    "bombs": "💣",
    "twinkling-star": "⭐",
    "stone-cartoon": "🎭",
    "rockets": "🚀",
    "aerial-fancy": "🎇",
    "special-fountain": "⛲",
    "repeating-cake": "🎂",
    "fancy-items": "🎁",
    "sparklers": "✨",
    "musical-shot": "🎵",
    "special-items": "📦",
};

const COUPON_ICONS = {
    "": "🎆",
    "sparklers": "🎇",
    "bombs": "🔥",
    "special-items": "🎁",
    "rockets": "🚀",
    "aerial-fancy": "✨",
};

function getGradient(id) {
    const pair = COLORS[id % COLORS.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const {
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        recalculateDiscount,
        getAvailableCoupons,
    } = useCoupons();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState("");
    const [couponMessage, setCouponMessage] = useState(null); // { type: 'success' | 'error', text }
    const [showOffers, setShowOffers] = useState(false);

    // Recalculate discount whenever cart changes
    useEffect(() => {
        recalculateDiscount(cartItems, cartTotal);
    }, [cartItems, cartTotal]);

    // Clear message after 5 seconds
    useEffect(() => {
        if (couponMessage) {
            const t = setTimeout(() => setCouponMessage(null), 5000);
            return () => clearTimeout(t);
        }
    }, [couponMessage]);

    const handleApplyCoupon = (code) => {
        const inputCode = code || couponCode;
        if (!inputCode.trim()) {
            setCouponMessage({ type: "error", text: "Please enter a coupon code" });
            return;
        }
        const result = applyCoupon(inputCode.trim(), cartItems, cartTotal);
        if (result.valid) {
            setCouponMessage({
                type: "success",
                text: `🎉 Coupon applied successfully! You saved ${formatPrice(result.discount)}`,
            });
            setCouponCode("");
            setShowOffers(false);
        } else {
            setCouponMessage({ type: "error", text: result.message });
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponMessage(null);
        setCouponCode("");
    };

    const availableCoupons = getAvailableCoupons();

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <div className="cart-empty-inner">
                    <span className="cart-empty-icon">🛒</span>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added any crackers yet. Start shopping and light up your celebrations!</p>
                    <Link to="/products" className="btn btn-primary btn-lg">
                        <HiOutlineShoppingCart /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const delivery = cartTotal >= 999 ? 0 : 99;
    const grandTotal = cartTotal + delivery - couponDiscount;

    return (
        <div className="cart-page">
            {/* Header */}
            <div className="cart-header">
                <div className="cart-header-container">
                    <Link to="/products" className="breadcrumb-back">
                        <HiOutlineChevronLeft /> Continue Shopping
                    </Link>
                    <h1 className="cart-title">
                        Shopping Cart
                        <span className="cart-title-count">({cartItems.length} {cartItems.length === 1 ? "item" : "items"})</span>
                    </h1>
                </div>
            </div>

            <div className="cart-layout">
                {/* Cart Items */}
                <div className="cart-items">
                    {cartItems.map((item) => {
                        const emoji = CATEGORY_EMOJIS[item.categorySlug] || "🧨";
                        return (
                            <div className="cart-item" key={item.id} id={`cart-item-${item.id}`}>
                                {/* Item Image */}
                                <Link to={`/products/${item.id}`} className="cart-item-image" style={{ background: getGradient(item.id) }}>
                                    <span className="cart-item-emoji">{emoji}</span>
                                </Link>

                                {/* Item Info */}
                                <div className="cart-item-info">
                                    <div className="cart-item-top">
                                        <div>
                                            <span className="cart-item-category">{item.category}</span>
                                            <Link to={`/products/${item.id}`} className="cart-item-name">{item.name}</Link>
                                            <span className="cart-item-box">{item.boxContent}</span>
                                        </div>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => removeFromCart(item.id)}
                                            aria-label="Remove item"
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    </div>

                                    <div className="cart-item-bottom">
                                        {/* Quantity */}
                                        <div className="qty-control">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                aria-label="Decrease"
                                            >
                                                <HiMinus />
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                aria-label="Increase"
                                            >
                                                <HiPlus />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="cart-item-pricing">
                                            <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                                            {item.quantity > 1 && (
                                                <span className="cart-item-unit">{formatPrice(item.price)} each</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <button className="clear-cart-btn" onClick={clearCart}>
                        <HiOutlineTrash /> Clear Cart
                    </button>

                    {/* ── Available Offers Section ─────────────────── */}
                    {availableCoupons.length > 0 && (
                        <div className="coupon-offers-section" id="available-offers">
                            <button
                                className="coupon-offers-toggle"
                                onClick={() => setShowOffers((p) => !p)}
                            >
                                <span className="coupon-offers-toggle-left">
                                    <HiOutlineTag />
                                    <span>Available Offers</span>
                                    <span className="coupon-offers-count">{availableCoupons.length}</span>
                                </span>
                                <span className={`coupon-offers-arrow ${showOffers ? "open" : ""}`}>›</span>
                            </button>

                            {showOffers && (
                                <div className="coupon-offers-list">
                                    {availableCoupons.map((c) => (
                                        <div className="coupon-offer-card" key={c.id}>
                                            <div className="coupon-offer-left">
                                                <span className="coupon-offer-icon">
                                                    {COUPON_ICONS[c.category] || "🎆"}
                                                </span>
                                                <div className="coupon-offer-info">
                                                    <span className="coupon-offer-code">{c.couponCode}</span>
                                                    <span className="coupon-offer-desc">
                                                        {c.description || (
                                                            c.discountType === "percentage"
                                                                ? `${c.discountValue}% OFF`
                                                                : `₹${c.discountValue} OFF`
                                                        )}
                                                    </span>
                                                    {c.minimumOrder > 0 && (
                                                        <span className="coupon-offer-min">
                                                            Min. order: {formatPrice(c.minimumOrder)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="coupon-offer-apply-btn"
                                                onClick={() => handleApplyCoupon(c.couponCode)}
                                                disabled={appliedCoupon?.id === c.id}
                                                id={`apply-offer-${c.couponCode}`}
                                            >
                                                {appliedCoupon?.id === c.id ? "Applied ✓" : "Apply"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="cart-summary">
                    <div className="summary-card">
                        <h3 className="summary-title">Order Summary</h3>

                        {/* ── Coupon Input ─────────────────── */}
                        <div className="coupon-input-section" id="coupon-section">
                            {appliedCoupon ? (
                                <div className="coupon-applied-badge" id="applied-coupon-badge">
                                    <div className="coupon-applied-left">
                                        <HiOutlineTag />
                                        <div>
                                            <span className="coupon-applied-code">{appliedCoupon.couponCode}</span>
                                            <span className="coupon-applied-savings">
                                                You save {formatPrice(couponDiscount)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="coupon-remove-btn"
                                        onClick={handleRemoveCoupon}
                                        aria-label="Remove coupon"
                                        id="remove-coupon-btn"
                                    >
                                        <HiOutlineX />
                                    </button>
                                </div>
                            ) : (
                                <div className="coupon-input-row">
                                    <div className="coupon-input-wrap">
                                        <HiOutlineTag className="coupon-input-icon" />
                                        <input
                                            type="text"
                                            className="coupon-input"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                            id="coupon-code-field"
                                        />
                                    </div>
                                    <button
                                        className="coupon-apply-btn"
                                        onClick={() => handleApplyCoupon()}
                                        id="apply-coupon-btn"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}

                            {/* Coupon message */}
                            {couponMessage && (
                                <div
                                    className={`coupon-message coupon-message-${couponMessage.type}`}
                                    id="coupon-message"
                                >
                                    {couponMessage.text}
                                </div>
                            )}
                        </div>

                        <div className="summary-rows">
                            <div className="summary-row">
                                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery</span>
                                <span className={delivery === 0 ? "free-delivery" : ""}>
                                    {delivery === 0 ? "FREE" : formatPrice(delivery)}
                                </span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="summary-row savings">
                                    <span>Coupon Discount</span>
                                    <span>−{formatPrice(couponDiscount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span className="total-amount">
                                {formatPrice(grandTotal)}
                            </span>
                        </div>

                        {couponDiscount > 0 && (
                            <div className="summary-savings-badge">
                                🎉 You're saving {formatPrice(couponDiscount)} with coupon {appliedCoupon?.couponCode}!
                            </div>
                        )}

                        {cartTotal < 999 && (
                            <div className="summary-free-delivery-hint">
                                Add {formatPrice(999 - cartTotal)} more for free delivery!
                            </div>
                        )}

                        <button
                            className="btn btn-primary btn-lg summary-checkout-btn"
                            id="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout <HiOutlineArrowRight />
                        </button>

                        <button
                            className="wa-order-btn summary-checkout-btn"
                            id="whatsapp-order-btn"
                            onClick={() => navigate("/whatsapp-order")}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Order via WhatsApp
                        </button>

                        <p className="summary-secure">💵 Cash on Delivery available — Pay when your order arrives</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
