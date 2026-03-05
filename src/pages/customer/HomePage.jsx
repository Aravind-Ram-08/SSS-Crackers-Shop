import { Link } from "react-router-dom";
import { HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineCash } from "react-icons/hi";
import ProductCard from "../../components/common/ProductCard";
import LiveOffersBanner from "../../components/common/LiveOffersBanner";
import products, { categories } from "../../data/products";
import "./HomePage.css";

export default function HomePage() {
    const featured = products.filter((p) => p.isFeatured);
    const bestsellers = products.filter((p) => p.isBestseller);

    return (
        <div className="home-page">
            {/* ===== HERO SECTION ===== */}
            <section className="hero" id="hero">
                <div className="hero-bg-effects">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                    <div className="hero-orb hero-orb-3" />
                    <div className="hero-particles">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <span key={i} className="particle" style={{ "--i": i }} />
                        ))}
                    </div>
                </div>
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">🎆 Diwali Collection 2026</span>
                        <h1 className="hero-title">
                            Light Up Your
                            <span className="hero-title-gradient"> Celebrations</span>
                        </h1>
                        <p className="hero-subtitle">
                            Premium crackers at unbeatable prices. From dazzling aerial shots to
                            family-friendly sparklers — find everything for a spectacular Diwali.
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Shop Now <HiOutlineArrowRight />
                            </Link>
                            <Link to="/products?category=special-items" className="btn btn-outline btn-lg">
                                View Combos
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-number">500+</span>
                                <span className="hero-stat-label">Products</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-number">10K+</span>
                                <span className="hero-stat-label">Happy Customers</span>
                            </div>
                            <div className="hero-stat-divider" />
                            <div className="hero-stat">
                                <span className="hero-stat-number">4.8★</span>
                                <span className="hero-stat-label">Average Rating</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-emoji-display">
                            <span className="hero-emoji-main">🧨</span>
                            <span className="hero-emoji-float e1">🎆</span>
                            <span className="hero-emoji-float e2">✨</span>
                            <span className="hero-emoji-float e3">🎇</span>
                            <span className="hero-emoji-float e4">💥</span>
                            <span className="hero-emoji-float e5">🚀</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== LIVE OFFERS BANNER ===== */}
            <LiveOffersBanner />

            {/* ===== TRUST BADGES ===== */}
            <section className="trust-bar">
                <div className="trust-container">
                    <div className="trust-item">
                        <HiOutlineTruck className="trust-icon" />
                        <div>
                            <strong>Free Delivery</strong>
                            <span>Orders above ₹999</span>
                        </div>
                    </div>
                    <div className="trust-item">
                        <HiOutlineShieldCheck className="trust-icon" />
                        <div>
                            <strong>100% Genuine</strong>
                            <span>Sivakasi quality</span>
                        </div>
                    </div>
                    <div className="trust-item">
                        <HiOutlineCash className="trust-icon" />
                        <div>
                            <strong>Secure Payment</strong>
                            <span>Razorpay protected</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CATEGORIES ===== */}
            <section className="section categories-section" id="categories">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Browse</span>
                        <h2 className="section-title">Shop by Category</h2>
                        <p className="section-subtitle">Find exactly what you need for your celebration</p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((cat) => (
                            <Link
                                to={`/products?category=${cat.slug}`}
                                className="category-card"
                                key={cat.slug}
                                id={`cat-${cat.slug}`}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                <span className="category-name">{cat.name}</span>
                                <span className="category-count">{cat.count} items</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="section featured-section" id="featured">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Featured</span>
                        <h2 className="section-title">Top Picks for You</h2>
                        <p className="section-subtitle">Hand-picked products loved by our customers</p>
                    </div>
                    <div className="products-grid">
                        {featured.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div className="section-cta">
                        <Link to="/products" className="btn btn-outline">
                            View All Products <HiOutlineArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== PROMO BANNER ===== */}
            <section className="promo-banner" id="promo-banner">
                <div className="promo-container">
                    <div className="promo-content">
                        <span className="promo-badge">🔥 Limited Time</span>
                        <h2 className="promo-title">Diwali Mega Sale</h2>
                        <p className="promo-text">
                            Get up to <strong>40% OFF</strong> on all combo packs. Free delivery on orders above ₹999!
                        </p>
                        <Link to="/products?category=special-items" className="btn btn-primary btn-lg">
                            Shop Combos <HiOutlineArrowRight />
                        </Link>
                    </div>
                    <div className="promo-visual">
                        <span className="promo-emoji">🎁</span>
                    </div>
                </div>
            </section>

            {/* ===== BESTSELLERS ===== */}
            <section className="section bestsellers-section" id="bestsellers">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Trending</span>
                        <h2 className="section-title">Bestsellers</h2>
                        <p className="section-subtitle">Most ordered products this festive season</p>
                    </div>
                    <div className="products-grid">
                        {bestsellers.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="cta-section" id="cta">
                <div className="cta-container">
                    <h2 className="cta-title">Ready to Light Up Your Festival?</h2>
                    <p className="cta-text">
                        Browse our complete collection of premium crackers and place your order today.
                    </p>
                    <Link to="/products" className="btn btn-primary btn-lg">
                        Start Shopping <HiOutlineArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
}
