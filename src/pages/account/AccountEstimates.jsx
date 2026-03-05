import { Link } from "react-router-dom";
import { HiOutlineTrash, HiOutlineShare, HiOutlinePencil } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/helpers";
import "./AccountPages.css";

function buildWhatsAppMsg(est) {
    const lines = (est.items || []).map(i => `• ${i.name} ×${i.qty} = ${formatPrice(i.price * i.qty)}`);
    return encodeURIComponent(`🧨 *SSS Crackers Estimate*\n\n${lines.join("\n")}\n\n*Total: ${formatPrice(est.total || 0)}*\n\nOrder now at https://ssscrackers.com`);
}

export default function AccountEstimates() {
    const { user, deleteEstimate } = useAuth();
    const estimates = user?.savedEstimates || [];

    if (!estimates.length) {
        return (
            <div className="acc-sub-page">
                <h2 className="acc-page-title">Saved Estimates</h2>
                <div className="acc-empty-state">
                    <span className="acc-empty-icon">📋</span>
                    <h3>No saved estimates</h3>
                    <p>Build a cart and save it as an estimate to share or order later.</p>
                    <Link to="/products" className="acc-btn-primary acc-btn-link">Browse Products →</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="acc-sub-page">
            <h2 className="acc-page-title">Saved Estimates <span className="acc-count-badge">{estimates.length}</span></h2>
            <div className="estimates-list">
                {estimates.map(est => (
                    <div className="estimate-card" key={est.id}>
                        <div className="estimate-card-top">
                            <div>
                                <p className="estimate-title">{est.title || `Estimate ${est.id}`}</p>
                                <p className="estimate-date">Saved {new Date(est.savedAt).toLocaleDateString("en-IN")}</p>
                            </div>
                            <p className="estimate-total">{formatPrice(est.total || 0)}</p>
                        </div>
                        <div className="estimate-items-preview">
                            {(est.items || []).slice(0, 4).map((item, i) => (
                                <span key={i} className="estimate-item-chip">{item.name}</span>
                            ))}
                            {(est.items || []).length > 4 && <span className="estimate-item-chip estimate-more">+{est.items.length - 4}</span>}
                        </div>
                        <div className="estimate-actions">
                            <a
                                href={`https://wa.me/?text=${buildWhatsAppMsg(est)}`}
                                target="_blank" rel="noreferrer"
                                className="acc-btn-green acc-btn-sm"
                            >
                                <HiOutlineShare /> Share on WhatsApp
                            </a>
                            <Link to="/cart" className="acc-btn-primary acc-btn-sm">
                                Load to Cart
                            </Link>
                            <button className="acc-btn-outline acc-btn-sm acc-btn-danger" onClick={() => deleteEstimate(est.id)}>
                                <HiOutlineTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
