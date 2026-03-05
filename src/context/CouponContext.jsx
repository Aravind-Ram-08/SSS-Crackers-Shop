import { createContext, useContext, useState, useEffect } from "react";

const CouponContext = createContext();

// ── Default coupons (mock data) ─────────────────────────────────────────────
const DEFAULT_COUPONS = [
    {
        id: 1,
        couponCode: "DIWALI20",
        discountType: "percentage",
        discountValue: 20,
        minimumOrder: 0,
        expiryDate: "2026-12-31",
        usageLimit: 500,
        usedCount: 42,
        category: "",
        isActive: true,
        description: "Get 20% OFF on all orders",
        createdAt: "2026-01-15",
    },
    {
        id: 2,
        couponCode: "CRACKER100",
        discountType: "flat",
        discountValue: 100,
        minimumOrder: 0,
        expiryDate: "2026-12-31",
        usageLimit: 1000,
        usedCount: 156,
        category: "",
        isActive: true,
        description: "Flat ₹100 OFF on all orders",
        createdAt: "2026-01-20",
    },
    {
        id: 3,
        couponCode: "FESTIVE500",
        discountType: "flat",
        discountValue: 500,
        minimumOrder: 3000,
        expiryDate: "2026-12-31",
        usageLimit: 200,
        usedCount: 30,
        category: "",
        isActive: true,
        description: "₹500 OFF on orders above ₹3000",
        createdAt: "2026-02-01",
    },
    {
        id: 4,
        couponCode: "SPARKLE10",
        discountType: "percentage",
        discountValue: 10,
        minimumOrder: 0,
        expiryDate: "2026-12-31",
        usageLimit: 300,
        usedCount: 18,
        category: "sparklers",
        isActive: true,
        description: "10% OFF on Sparklers category",
        createdAt: "2026-02-05",
    },
    {
        id: 5,
        couponCode: "FAMILY10",
        discountType: "percentage",
        discountValue: 10,
        minimumOrder: 0,
        expiryDate: "2026-12-31",
        usageLimit: 150,
        usedCount: 12,
        category: "special-items",
        isActive: true,
        description: "10% OFF on Combo Packs",
        createdAt: "2026-02-10",
    },
    {
        id: 6,
        couponCode: "BOOM200",
        discountType: "flat",
        discountValue: 200,
        minimumOrder: 1500,
        expiryDate: "2026-11-30",
        usageLimit: 100,
        usedCount: 5,
        category: "bombs",
        isActive: true,
        description: "₹200 OFF on Bombs orders above ₹1500",
        createdAt: "2026-02-15",
    },
];

export function CouponProvider({ children }) {
    const [coupons, setCoupons] = useState(() => {
        const saved = localStorage.getItem("sss-coupons");
        return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
    });

    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        const saved = localStorage.getItem("sss-applied-coupon");
        return saved ? JSON.parse(saved) : null;
    });
    const [couponDiscount, setCouponDiscount] = useState(0);

    // Persist coupons to localStorage
    useEffect(() => {
        localStorage.setItem("sss-coupons", JSON.stringify(coupons));
    }, [coupons]);

    // Persist applied coupon
    useEffect(() => {
        localStorage.setItem("sss-applied-coupon", JSON.stringify(appliedCoupon));
    }, [appliedCoupon]);

    // ── Admin CRUD ─────────────────────────────────────────────────────
    const addCoupon = (coupon) => {
        const newId = coupons.length > 0 ? Math.max(...coupons.map((c) => c.id)) + 1 : 1;
        setCoupons((prev) => [
            {
                ...coupon,
                id: newId,
                usedCount: 0,
                createdAt: new Date().toISOString().split("T")[0],
            },
            ...prev,
        ]);
    };

    const updateCoupon = (id, updated) => {
        setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    };

    const deleteCoupon = (id) => {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        if (appliedCoupon?.id === id) {
            removeCoupon();
        }
    };

    const toggleCoupon = (id) => {
        setCoupons((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
        if (appliedCoupon?.id === id) {
            removeCoupon();
        }
    };

    // ── Customer: Validate & Apply ─────────────────────────────────────
    const validateCoupon = (code, cartItems, cartTotal) => {
        const coupon = coupons.find(
            (c) => c.couponCode.toLowerCase() === code.trim().toLowerCase()
        );

        if (!coupon) {
            return { valid: false, message: "Invalid coupon code" };
        }

        if (!coupon.isActive) {
            return { valid: false, message: "This coupon is currently inactive" };
        }

        // Check expiry
        const today = new Date().toISOString().split("T")[0];
        if (coupon.expiryDate && coupon.expiryDate < today) {
            return { valid: false, message: "This coupon has expired" };
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return { valid: false, message: "This coupon has reached its usage limit" };
        }

        // Check minimum order
        if (coupon.minimumOrder > 0 && cartTotal < coupon.minimumOrder) {
            return {
                valid: false,
                message: `Minimum order of ₹${coupon.minimumOrder} required for this coupon`,
            };
        }

        // Category-based: check if cart has items from that category
        if (coupon.category) {
            const categoryItems = cartItems.filter(
                (item) => item.categorySlug === coupon.category
            );
            if (categoryItems.length === 0) {
                return {
                    valid: false,
                    message: `This coupon is only valid for the ${coupon.category.replace(/-/g, " ")} category`,
                };
            }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.category) {
            // Category-specific discount
            const categoryTotal = cartItems
                .filter((item) => item.categorySlug === coupon.category)
                .reduce((sum, item) => sum + item.price * item.quantity, 0);

            if (coupon.discountType === "percentage") {
                discount = Math.round((categoryTotal * coupon.discountValue) / 100);
            } else {
                discount = Math.min(coupon.discountValue, categoryTotal);
            }
        } else {
            // General discount
            if (coupon.discountType === "percentage") {
                discount = Math.round((cartTotal * coupon.discountValue) / 100);
            } else {
                discount = Math.min(coupon.discountValue, cartTotal);
            }
        }

        return { valid: true, coupon, discount };
    };

    const applyCoupon = (code, cartItems, cartTotal) => {
        const result = validateCoupon(code, cartItems, cartTotal);
        if (result.valid) {
            setAppliedCoupon(result.coupon);
            setCouponDiscount(result.discount);
            // Increment usage count
            setCoupons((prev) =>
                prev.map((c) =>
                    c.id === result.coupon.id
                        ? { ...c, usedCount: c.usedCount + 1 }
                        : c
                )
            );
        }
        return result;
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
    };

    // Recalculate discount when cart changes (if coupon is applied)
    const recalculateDiscount = (cartItems, cartTotal) => {
        if (!appliedCoupon) {
            setCouponDiscount(0);
            return;
        }
        const result = validateCoupon(appliedCoupon.couponCode, cartItems, cartTotal);
        if (result.valid) {
            setCouponDiscount(result.discount);
        } else {
            // Coupon no longer valid — auto-remove
            removeCoupon();
        }
    };

    // Get available (active, non-expired) coupons for display
    const getAvailableCoupons = () => {
        const today = new Date().toISOString().split("T")[0];
        return coupons.filter(
            (c) =>
                c.isActive &&
                (!c.expiryDate || c.expiryDate >= today) &&
                (c.usageLimit === 0 || c.usedCount < c.usageLimit)
        );
    };

    return (
        <CouponContext.Provider
            value={{
                coupons,
                appliedCoupon,
                couponDiscount,
                addCoupon,
                updateCoupon,
                deleteCoupon,
                toggleCoupon,
                applyCoupon,
                removeCoupon,
                recalculateDiscount,
                getAvailableCoupons,
            }}
        >
            {children}
        </CouponContext.Provider>
    );
}

export function useCoupons() {
    const context = useContext(CouponContext);
    if (!context) throw new Error("useCoupons must be used within a CouponProvider");
    return context;
}
