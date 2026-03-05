import { Link } from "react-router-dom";
import { HiOutlineHeart, HiOutlineShoppingCart, HiOutlineTrash } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import products from "../../data/products";
import { formatPrice } from "../../utils/helpers";
import "./AccountPages.css";

export default function AccountWishlist() {
    const { wishlist, toggleWishlist } = useAuth();
    const { addToCart } = useCart();

    const wishedProducts = products.filter(p => wishlist.includes(p.id));

    if (!wishedProducts.length) {
        return (
            <div className="acc-sub-page">
                <h2 className="acc-page-title">Wishlist</h2>
                <div className="acc-empty-state">
                    <span className="acc-empty-icon">🤍</span>
                    <h3>Your wishlist is empty</h3>
                    <p>Tap the ♡ on any product to save it for later!</p>
                    <Link to="/products" className="acc-btn-primary acc-btn-link">Explore Products →</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="acc-sub-page">
            <h2 className="acc-page-title">
                Wishlist <span className="acc-count-badge">{wishedProducts.length}</span>
            </h2>
            <div className="wishlist-grid">
                {wishedProducts.map(product => (
                    <div className="wishlist-card" key={product.id}>
                        <Link to={`/products/${product.id}`} className="wishlist-card-img">
                            <span className="wishlist-emoji">
                                {["🎆", "🎇", "✨", "🧨", "🎉", "🪔", "💥", "🌟"][product.id % 8]}
                            </span>
                        </Link>
                        <div className="wishlist-card-body">
                            <Link to={`/products/${product.id}`} className="wishlist-name">{product.name}</Link>
                            <p className="wishlist-price">{formatPrice(product.price)}</p>
                            <div className="wishlist-actions">
                                <button
                                    className="acc-btn-primary acc-btn-sm wishlist-add-btn"
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                >
                                    <HiOutlineShoppingCart />
                                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>
                                <button
                                    className="acc-btn-outline acc-btn-sm acc-btn-danger"
                                    onClick={() => toggleWishlist(product.id)}
                                    title="Remove from wishlist"
                                >
                                    <HiOutlineTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
