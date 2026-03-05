import { Link, useNavigate } from "react-router-dom";
import { HiOutlineShoppingCart, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/helpers";
import { buildWhatsAppURL, generateOrderMessage } from "../../utils/whatsapp";
import { useFestival, applyOfferPrice } from "../../context/FestivalContext";
import "./ProductCard.css";

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

function getGradient(id) {
    const pair = COLORS[id % COLORS.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

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

export default function ProductCard({ product, viewMode }) {
    const { addToCart } = useCart();
    const { user, toggleWishlist, isWishlisted } = useAuth();
    const navigate = useNavigate();
    const { getProductOffer } = useFestival();
    const emoji = CATEGORY_EMOJIS[product.categorySlug] || "🧨";
    const wishlisted = isWishlisted(product.id);

    const isOutOfStock = product.stock === 0;
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    // Live festival offer (takes priority if better)
    const liveOffer = getProductOffer(product);
    const { finalPrice: livePrice, saving: liveSaving } = applyOfferPrice(product.price, liveOffer);
    const liveDiscountPct = liveOffer ? liveOffer.discountValue : 0;
    // Use live offer price if it gives a better discount
    const showLiveOffer = liveOffer && liveDiscountPct > discountPercent;
    const displayPrice = showLiveOffer ? livePrice : product.price;
    const displayOriginal = showLiveOffer ? product.price : (hasDiscount ? product.originalPrice : null);
    const displayDiscount = showLiveOffer ? liveDiscountPct : discountPercent;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart(product, 1);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { navigate("/login"); return; }
        toggleWishlist(product.id);
    };

    const handleWhatsApp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const msg = generateOrderMessage({
            cartItems: [{ ...product, quantity: 1 }],
            customer: {},
            delivery: 0,
        });
        window.open(buildWhatsAppURL(msg), "_blank", "noopener,noreferrer");
    };

    return (
        <article
            className={`product-card ${isOutOfStock ? "product-card-oos" : ""}`}
            id={`product-${product.id}`}
        >
            <Link to={`/products/${product.id}`} className="product-card-link" tabIndex={-1} aria-hidden="true">
                {/* Image */}
                <div className="product-card-image" style={{ background: getGradient(product.id) }}>
                    <span className="product-card-emoji" aria-hidden="true">{emoji}</span>

                    {/* Tags — top right */}
                    {product.isBestseller && (
                        <span className="product-card-tag">🔥 Bestseller</span>
                    )}
                    {product.isFeatured && !product.isBestseller && (
                        <span className="product-card-tag tag-featured">⭐ Featured</span>
                    )}

                    {/* Wishlist heart — bottom right */}
                    <button
                        className={`product-card-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
                        onClick={handleWishlist}
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {wishlisted ? <HiHeart /> : <HiOutlineHeart />}
                    </button>

                    {/* Live offer badge — top left, highest priority */}
                    {showLiveOffer && (
                        <span className="product-card-offer-badge">{liveOffer.badge}</span>
                    )}

                    {/* Discount badge — top left (fallback) */}
                    {!showLiveOffer && hasDiscount && displayDiscount > 0 && (
                        <span className="product-card-discount-badge">🔥 {displayDiscount}% OFF</span>
                    )}

                    {/* Out of Stock overlay */}
                    {isOutOfStock && (
                        <div className="product-card-oos-overlay">
                            <span className="product-card-oos-text">Out of Stock</span>
                        </div>
                    )}

                    {/* Low stock warning */}
                    {!isOutOfStock && product.stock > 0 && product.stock <= 5 && (
                        <span className="product-card-low-stock">
                            Only {product.stock} left!
                        </span>
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="product-card-body">
                <p className="product-card-category">{product.category}</p>
                <Link to={`/products/${product.id}`} className="product-card-title-link">
                    <h3 className="product-card-title">{product.name}</h3>
                </Link>
                <p className="product-card-box">{product.boxContent}</p>

                <div className="product-card-pricing">
                    <span className="price-current">{formatPrice(displayPrice)}</span>
                    {displayOriginal && (
                        <>
                            <span className="price-original">{formatPrice(displayOriginal)}</span>
                            <span className="price-discount-tag">{displayDiscount}% off</span>
                        </>
                    )}
                    {/* Urgency tags from live offer */}
                    {showLiveOffer && liveOffer.sellingFast && (
                        <span className="pc-selling-fast">🔥 Fast</span>
                    )}
                    {showLiveOffer && liveOffer.limitedStock && (
                        <span className="pc-limited-stock">⚠️ Ltd</span>
                    )}
                </div>

                {/* Rating */}
                {product.rating && (
                    <div className="product-card-rating">
                        <span className="product-rating-stars">
                            {"★".repeat(Math.floor(product.rating))}
                            {"☆".repeat(5 - Math.floor(product.rating))}
                        </span>
                        <span className="product-rating-value">{product.rating}</span>
                        {product.numReviews > 0 && (
                            <span className="product-rating-count">({product.numReviews})</span>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="product-card-actions">
                    <button
                        className={`product-card-cart-btn ${isOutOfStock ? "product-card-cart-disabled" : ""}`}
                        onClick={handleAddToCart}
                        aria-label={isOutOfStock ? "Out of stock" : `Add ${product.name} to cart`}
                        disabled={isOutOfStock}
                    >
                        <HiOutlineShoppingCart aria-hidden="true" />
                        <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                    </button>
                    <button
                        className="product-card-wa-btn"
                        onClick={handleWhatsApp}
                        aria-label={`Order ${product.name} via WhatsApp`}
                        title="Quick order via WhatsApp"
                    >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    );
}
