import { Link } from "react-router-dom";
import { HiOutlineShoppingBag, HiOutlineDownload, HiOutlineRefresh } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useOrderTracking } from "../../context/OrderTrackingContext";
import { formatPrice } from "../../utils/helpers";
import "./AccountPages.css";

const STATUS_COLOR = {
    "Order Received": "#60a5fa",
    "Order Confirmed": "#a78bfa",
    "Packed": "#fbbf24",
    "Shipped": "#f97316",
    "Out for Delivery": "#fb923c",
    "Delivered": "#4ade80",
    "Cancelled": "#f87171",
};

export default function AccountOrders() {
    const { user } = useAuth();
    const { trackingOrders } = useOrderTracking();

    // Merge user-linked orders with tracking
    const allOrders = trackingOrders.filter(o =>
        o.phone === user?.phone || o.email === user?.email
    );

    if (allOrders.length === 0) {
        return (
            <div className="acc-sub-page">
                <h2 className="acc-page-title">My Orders</h2>
                <div className="acc-empty-state">
                    <span className="acc-empty-icon">🛒</span>
                    <h3>No orders yet</h3>
                    <p>Browse our collection and place your first order!</p>
                    <Link to="/products" className="acc-btn-primary acc-btn-link">Shop Now →</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="acc-sub-page">
            <h2 className="acc-page-title">My Orders <span className="acc-count-badge">{allOrders.length}</span></h2>

            <div className="orders-list">
                {allOrders.map(order => {
                    const status = order.currentStatus || "Order Received";
                    const color = STATUS_COLOR[status] || "#aaaacc";
                    return (
                        <div className="order-card" key={order.orderId}>
                            <div className="order-card-top">
                                <div>
                                    <p className="order-id">#{order.orderId}</p>
                                    <p className="order-date">{new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                </div>
                                <span className="order-status-badge" style={{ color, borderColor: color, background: color + "18" }}>
                                    ● {status}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="order-items">
                                {(order.products || []).slice(0, 3).map((item, i) => (
                                    <div key={i} className="order-item-row">
                                        <span className="order-item-emoji">🧨</span>
                                        <span className="order-item-name">{item.name}</span>
                                        <span className="order-item-qty">×{item.qty || 1}</span>
                                        <span className="order-item-price">{formatPrice((item.price || 0) * (item.qty || 1))}</span>
                                    </div>
                                ))}
                                {(order.products || []).length > 3 && (
                                    <p className="order-more">+{order.products.length - 3} more items</p>
                                )}
                            </div>

                            <div className="order-card-footer">
                                <p className="order-total">Total: <strong>{formatPrice(order.totalAmount || 0)}</strong></p>
                                <div className="order-actions">
                                    <Link to={`/track-order?id=${order.orderId}&phone=${user.phone}`} className="acc-btn-outline acc-btn-sm">
                                        📍 Track Order
                                    </Link>
                                    <button className="acc-btn-outline acc-btn-sm">
                                        <HiOutlineRefresh /> Reorder
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
