import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFestival, applyOfferPrice } from "../../context/FestivalContext";
import { HiOutlineClock, HiOutlineLightningBolt, HiOutlineArrowRight } from "react-icons/hi";
import "./LiveOffersBanner.css";

// ── Flash-sale timer ──────────────────────────────────────────────────────
function FlashTimer({ offer, now }) {
    if (!offer.flashSale || !offer.flashStartTime) return null;
    const flashEnd = new Date(new Date(offer.flashStartTime).getTime() + offer.flashDurationHours * 3600000);
    const diff = Math.max(0, flashEnd - now);
    if (diff === 0) return <span className="lob-flash-done">Ended</span>;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return (
        <span className="lob-flash-timer">
            <HiOutlineClock />
            {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")} left
        </span>
    );
}

const BADGE_CLASS = {
    festival: "badge-festival",
    flash: "badge-flash",
    diwali: "badge-diwali",
    category: "badge-category",
};

export default function LiveOffersBanner() {
    const { liveOffers, now } = useFestival();
    const [active, setActive] = useState(0);

    // Auto-rotate
    useEffect(() => {
        if (liveOffers.length <= 1) return;
        const id = setInterval(() => setActive(a => (a + 1) % liveOffers.length), 5000);
        return () => clearInterval(id);
    }, [liveOffers.length]);

    if (!liveOffers.length) return null;

    return (
        <section className="live-offers-banner" id="live-offers-banner">
            <div className="lob-container">
                {/* Header */}
                <div className="lob-header">
                    <div className="lob-header-left">
                        <HiOutlineLightningBolt className="lob-lightning" />
                        <h2 className="lob-title">Live Offers</h2>
                        <span className="lob-count-pill">{liveOffers.length} Active</span>
                    </div>
                    <Link to="/products" className="lob-view-all">
                        View All <HiOutlineArrowRight />
                    </Link>
                </div>

                {/* Offer cards */}
                <div className="lob-cards">
                    {liveOffers.map((offer, idx) => (
                        <div
                            key={offer.id}
                            className={`lob-card lob-card-${offer.badgeType} ${idx === active ? "lob-card-active" : ""}`}
                            onClick={() => setActive(idx)}
                            id={`lob-card-${offer.id}`}
                        >
                            {/* Badge */}
                            <span className={`lob-badge ${BADGE_CLASS[offer.badgeType] ?? "badge-festival"}`}>
                                {offer.badge}
                            </span>

                            {/* Content */}
                            <div className="lob-card-body">
                                <h3 className="lob-card-title">{offer.title}</h3>
                                <p className="lob-card-desc">{offer.description}</p>

                                <div className="lob-card-meta">
                                    {/* Discount chip */}
                                    <span className="lob-discount-chip">
                                        🏷️ {offer.discountValue}% OFF
                                    </span>

                                    {/* Urgency tags */}
                                    {offer.limitedStock && (
                                        <span className="lob-urgency-tag limited">⚠️ Limited Stock</span>
                                    )}
                                    {offer.sellingFast && (
                                        <span className="lob-urgency-tag fast">🔥 Selling Fast</span>
                                    )}
                                </div>

                                <div className="lob-card-footer">
                                    {offer.flashSale ? (
                                        <FlashTimer offer={offer} now={now} />
                                    ) : (
                                        <span className="lob-urgency-text">
                                            <HiOutlineClock /> {offer.urgencyText}
                                        </span>
                                    )}
                                    <Link
                                        to={offer.scope === "category"
                                            ? `/products?category=${offer.scopeValue}`
                                            : "/products"}
                                        className="lob-shop-btn"
                                        id={`lob-shop-${offer.id}`}
                                    >
                                        Shop Now <HiOutlineArrowRight />
                                    </Link>
                                </div>
                            </div>

                            {/* Big discount number */}
                            <div className="lob-big-discount" aria-hidden="true">
                                {offer.discountValue}%
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots navigation */}
                {liveOffers.length > 1 && (
                    <div className="lob-dots">
                        {liveOffers.map((_, i) => (
                            <button
                                key={i}
                                className={`lob-dot ${i === active ? "lob-dot-active" : ""}`}
                                onClick={() => setActive(i)}
                                aria-label={`View offer ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
