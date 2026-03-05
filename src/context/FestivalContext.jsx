import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Persistence key ──────────────────────────────────────────────────────
const LS_KEY = "sss_crackers_festival_settings";

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveToStorage(data) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { }
}

// ── Default festival config ───────────────────────────────────────────────
// Next Diwali: 19 Oct 2026
const DEFAULT_FESTIVAL = {
    name: "Diwali",
    emoji: "🪔",
    targetDate: "2026-10-19T00:00:00+05:30",
    countdownEnabled: true,
    displayStyle: "top-bar",   // "top-bar" | "banner" | "popup"
    saleLiveMessage: "🎆 Diwali Sale is LIVE Now! Up to 40% OFF!",
};

// ── Seed offers ────────────────────────────────────────────────────────────
const SEED_OFFERS = [
    {
        id: "OFF-001",
        title: "Diwali Grand Sale",
        badge: "🔥 Festival Offer",
        badgeType: "festival",
        discountType: "percent",
        discountValue: 20,
        scope: "all",          // "all" | "category" | "product"
        scopeValue: "",        // category slug or product id list
        startDate: "2026-01-01",
        endDate: "2026-10-31",
        isActive: true,
        flashSale: false,
        flashDurationHours: 0,
        flashStartTime: "",
        description: "20% off on all crackers for Diwali festival",
        urgencyText: "Only days left for this offer!",
        limitedStock: false,
        sellingFast: true,
        salesCount: 347,
    },
    {
        id: "OFF-002",
        title: "Rockets Mega Deal",
        badge: "🚀 Category Deal",
        badgeType: "category",
        discountType: "percent",
        discountValue: 30,
        scope: "category",
        scopeValue: "rockets",
        startDate: "2026-02-01",
        endDate: "2026-10-25",
        isActive: true,
        flashSale: false,
        flashDurationHours: 0,
        flashStartTime: "",
        description: "30% off on all Rockets — blast off with savings!",
        urgencyText: "Limited period deal",
        limitedStock: true,
        sellingFast: false,
        salesCount: 128,
    },
    {
        id: "OFF-003",
        title: "Flash Sale — Aerial Fancy",
        badge: "⚡ Flash Sale",
        badgeType: "flash",
        discountType: "percent",
        discountValue: 40,
        scope: "category",
        scopeValue: "aerial-fancy",
        startDate: "2026-03-01",
        endDate: "2026-10-20",
        isActive: true,
        flashSale: true,
        flashDurationHours: 24,
        flashStartTime: "2026-03-04T00:00:00+05:30",
        description: "40% off on Aerial Fancy items — FLASH SALE!",
        urgencyText: "Flash sale ending soon!",
        limitedStock: true,
        sellingFast: true,
        salesCount: 89,
    },
    {
        id: "OFF-004",
        title: "Diwali Special Combo",
        badge: "🎆 Diwali Special",
        badgeType: "diwali",
        discountType: "percent",
        discountValue: 25,
        scope: "category",
        scopeValue: "special-items",
        startDate: "2026-10-01",
        endDate: "2026-10-25",
        isActive: true,
        flashSale: false,
        flashDurationHours: 0,
        flashStartTime: "",
        description: "25% off on all Special Combo packs for Diwali!",
        urgencyText: "Festival offer — limited time",
        limitedStock: false,
        sellingFast: true,
        salesCount: 412,
    },
    {
        id: "OFF-005",
        title: "Sparklers Family Pack Deal",
        badge: "✨ Family Deal",
        badgeType: "festival",
        discountType: "percent",
        discountValue: 15,
        scope: "category",
        scopeValue: "sparklers",
        startDate: "2026-09-01",
        endDate: "2026-11-01",
        isActive: false,
        flashSale: false,
        flashDurationHours: 0,
        flashStartTime: "",
        description: "15% off on all Sparklers — brighten the night!",
        urgencyText: "Seasonal offer",
        limitedStock: false,
        sellingFast: false,
        salesCount: 0,
    },
];

// ── Helper: check if offer is currently live ─────────────────────────────
export function isOfferLive(offer, now = new Date()) {
    if (!offer.isActive) return false;
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    end.setHours(23, 59, 59, 999);
    if (now < start || now > end) return false;
    if (offer.flashSale && offer.flashStartTime) {
        const flashStart = new Date(offer.flashStartTime);
        const flashEnd = new Date(flashStart.getTime() + offer.flashDurationHours * 3600000);
        return now >= flashStart && now <= flashEnd;
    }
    return true;
}

// ── Helper: get best discount for a product ──────────────────────────────
export function getBestOffer(product, liveOffers) {
    const applicable = liveOffers.filter(o => {
        if (o.scope === "all") return true;
        if (o.scope === "category") return o.scopeValue === product.categorySlug;
        if (o.scope === "product") return o.scopeValue.split(",").map(x => x.trim()).includes(String(product.id));
        return false;
    });
    if (!applicable.length) return null;
    return applicable.reduce((best, cur) =>
        (cur.discountValue > (best?.discountValue ?? 0)) ? cur : best, null);
}

// ── Helper: compute discounted price ────────────────────────────────────
export function applyOfferPrice(price, offer) {
    if (!offer) return { finalPrice: price, saving: 0 };
    if (offer.discountType === "percent") {
        const saving = Math.round((price * offer.discountValue) / 100);
        return { finalPrice: price - saving, saving };
    }
    return { finalPrice: price, saving: 0 };
}

// ── Context ──────────────────────────────────────────────────────────────
const FestivalContext = createContext();

export function FestivalProvider({ children }) {
    // Merge saved settings over defaults so new fields always exist
    const [festival, setFestival] = useState(() => ({
        ...DEFAULT_FESTIVAL,
        ...(loadFromStorage() ?? {}),
    }));
    const [offers, setOffers] = useState(SEED_OFFERS);
    const [now, setNow] = useState(new Date());

    // Live clock — tick every second
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Persist festival settings whenever they change
    useEffect(() => {
        saveToStorage(festival);
    }, [festival]);

    // Countdown to festival
    const target = new Date(festival.targetDate);
    const diff = Math.max(0, target - now);
    const isOver = diff === 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const countdown = { days, hours, minutes, seconds, isOver, diff };

    // Live offers (filtered by date)
    const liveOffers = offers.filter(o => isOfferLive(o, now));

    // ── Offer CRUD ───────────────────────────────────────────────────────
    const addOffer = useCallback((offer) => {
        const newId = `OFF-${String(Date.now()).slice(-5)}`;
        setOffers(prev => [{ ...offer, id: newId, salesCount: 0 }, ...prev]);
    }, []);

    const updateOffer = useCallback((id, updated) => {
        setOffers(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
    }, []);

    const deleteOffer = useCallback((id) => {
        setOffers(prev => prev.filter(o => o.id !== id));
    }, []);

    const toggleOffer = useCallback((id) => {
        setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
    }, []);

    const updateFestival = useCallback((updated) => {
        setFestival(prev => ({ ...prev, ...updated }));
    }, []);

    // Convenience: get best offer for a product
    const getProductOffer = useCallback((product) => getBestOffer(product, liveOffers), [liveOffers]);

    return (
        <FestivalContext.Provider value={{
            festival, updateFestival,
            countdown,
            offers, liveOffers,
            addOffer, updateOffer, deleteOffer, toggleOffer,
            getProductOffer,
            now,
        }}>
            {children}
        </FestivalContext.Provider>
    );
}

export function useFestival() {
    const ctx = useContext(FestivalContext);
    if (!ctx) throw new Error("useFestival must be used within FestivalProvider");
    return ctx;
}
