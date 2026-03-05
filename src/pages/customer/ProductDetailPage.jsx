import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    HiOutlineShoppingCart,
    HiOutlineTruck,
    HiOutlineShieldCheck,
    HiOutlineRefresh,
    HiOutlineChevronLeft,
    HiPlus,
    HiMinus,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/helpers";
import ProductCard from "../../components/common/ProductCard";
import products from "../../data/products";
import "./ProductDetailPage.css";

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

function getGradient(id) {
    const pair = COLORS[id % COLORS.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    const product = products.find((p) => p.id === parseInt(id));

    if (!product) {
        return (
            <div className="detail-not-found">
                <span className="empty-emoji">🔍</span>
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist.</p>
                <Link to="/products" className="btn btn-primary">
                    Browse Products
                </Link>
            </div>
        );
    }

    const emoji = CATEGORY_EMOJIS[product.categorySlug] || "🧨";
    const related = products
        .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
        .slice(0, 4);

    const handleAddToCart = () => {
        addToCart(product, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="detail-page">
            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
                <div className="breadcrumb-container">
                    <Link to="/products" className="breadcrumb-back">
                        <HiOutlineChevronLeft /> Back to Shop
                    </Link>
                    <div className="breadcrumb-trail">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <Link to="/products">Products</Link>
                        <span>/</span>
                        <Link to={`/products?category=${product.categorySlug}`}>{product.category}</Link>
                        <span>/</span>
                        <span className="breadcrumb-current">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <section className="detail-section">
                <div className="detail-container">
                    <div className="detail-grid">
                        {/* Left — Image */}
                        <div className="detail-image-area">
                            <div className="detail-image-main" style={{ background: getGradient(product.id) }}>
                                <span className="detail-emoji">{emoji}</span>
                                {product.isBestseller && <span className="detail-badge">🔥 Bestseller</span>}
                            </div>
                        </div>

                        {/* Right — Info */}
                        <div className="detail-info">
                            <span className="detail-category">{product.category}</span>
                            <h1 className="detail-title">{product.name}</h1>

                            {/* Box Content */}
                            <div className="detail-box-content">
                                <span className="box-label">📦 Box Content:</span>
                                <span className="box-value">{product.boxContent}</span>
                            </div>

                            {/* Price */}
                            <div className="detail-pricing">
                                <span className="detail-price">{formatPrice(product.price)}</span>
                            </div>

                            {/* Description */}
                            <p className="detail-description">{product.description}</p>

                            {/* Stock */}
                            <div className="detail-stock">
                                {product.stock > 0 ? (
                                    <span className="stock-available">
                                        ✅ In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="stock-out">❌ Out of Stock</span>
                                )}
                            </div>

                            {/* Quantity + Add to Cart */}
                            <div className="detail-actions">
                                <div className="qty-control">
                                    <button
                                        className="qty-btn"
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        disabled={qty <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <HiMinus />
                                    </button>
                                    <span className="qty-value">{qty}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                                        disabled={qty >= product.stock}
                                        aria-label="Increase quantity"
                                    >
                                        <HiPlus />
                                    </button>
                                </div>
                                <button
                                    className={`btn btn-primary btn-lg detail-add-btn ${added ? "added" : ""}`}
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                >
                                    <HiOutlineShoppingCart />
                                    {added ? "Added to Cart! ✓" : "Add to Cart"}
                                </button>
                            </div>

                            {/* Total preview */}
                            {qty > 1 && (
                                <div className="detail-qty-total">
                                    Total for {qty} items: <strong>{formatPrice(product.price * qty)}</strong>
                                </div>
                            )}

                            {/* Trust Features */}
                            <div className="detail-features">
                                <div className="detail-feature">
                                    <HiOutlineTruck className="feature-icon" />
                                    <div>
                                        <strong>Free Delivery</strong>
                                        <span>Orders above ₹999</span>
                                    </div>
                                </div>
                                <div className="detail-feature">
                                    <HiOutlineShieldCheck className="feature-icon" />
                                    <div>
                                        <strong>Genuine Products</strong>
                                        <span>Sivakasi quality assured</span>
                                    </div>
                                </div>
                                <div className="detail-feature">
                                    <HiOutlineRefresh className="feature-icon" />
                                    <div>
                                        <strong>Easy Returns</strong>
                                        <span>Damaged items replaced</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="related-section">
                    <div className="detail-container">
                        <h2 className="related-title">You May Also Like</h2>
                        <div className="related-grid">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
