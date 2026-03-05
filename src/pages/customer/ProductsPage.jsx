import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineAdjustments,
    HiOutlineTag,
    HiOutlineCurrencyRupee,
    HiOutlineChevronDown,
    HiOutlineRefresh,
    HiOutlineViewGrid,
    HiOutlineViewList,
} from "react-icons/hi";
import ProductCard from "../../components/common/ProductCard";
import products, { categories } from "../../data/products";
import { formatPrice } from "../../utils/helpers";
import "./ProductsPage.css";

// ── Constants ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Top Rated" },
    { value: "new", label: "New Arrivals" },
    { value: "name", label: "Name: A to Z" },
];

const PRICE_RANGES = [
    { label: "Under ₹100", min: 0, max: 100, key: "0-100" },
    { label: "₹100 – ₹300", min: 100, max: 300, key: "100-300" },
    { label: "₹300 – ₹600", min: 300, max: 600, key: "300-600" },
    { label: "₹600 – ₹1,000", min: 600, max: 1000, key: "600-1000" },
    { label: "₹1,000 – ₹3,000", min: 1000, max: 3000, key: "1000-3000" },
    { label: "Above ₹3,000", min: 3000, max: Infinity, key: "3000+" },
];

const OFFER_FILTERS = [
    { key: "bestseller", label: "🔥 Bestsellers", icon: "🔥" },
    { key: "featured", label: "⭐ Featured Items", icon: "⭐" },
    { key: "combos", label: "📦 Combo Packs", icon: "📦" },
    { key: "under100", label: "💰 Under ₹100", icon: "💰" },
];

// Products min/max for the custom slider
const PRICE_MIN = 0;
const PRICE_MAX = Math.max(...products.map((p) => p.price));

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get("category") || "";
    const qParam = searchParams.get("q") || "";
    const priceParam = searchParams.get("price") || "";
    const stockParam = searchParams.get("stock") || "";

    const [search, setSearch] = useState(qParam);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [sortBy, setSortBy] = useState("featured");
    const [priceRange, setPriceRange] = useState(priceParam); // e.g. "100-300"
    const [customMin, setCustomMin] = useState(PRICE_MIN);
    const [customMax, setCustomMax] = useState(PRICE_MAX);
    const [inStockOnly, setInStockOnly] = useState(stockParam === "available");
    const [offerFilters, setOfferFilters] = useState([]);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid | list

    // Collapsible filter sections
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        offers: true,
        stock: true,
    });

    const filterRef = useRef(null);

    // ── Sync URL ───────────────────────────────────────────────────────────
    const updateURL = useCallback(
        (overrides = {}) => {
            const params = {};
            const cat = overrides.category ?? selectedCategory;
            const q = overrides.q ?? search;
            const price = overrides.price ?? priceRange;
            const stock = overrides.stock ?? inStockOnly;

            if (cat) params.category = cat;
            if (q) params.q = q;
            if (price) params.price = price;
            if (stock) params.stock = "available";

            setSearchParams(params, { replace: true });
        },
        [selectedCategory, search, priceRange, inStockOnly, setSearchParams]
    );

    // ── Filter Logic ───────────────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }

        // Category
        if (selectedCategory) {
            result = result.filter((p) => p.categorySlug === selectedCategory);
        }

        // Price Range
        if (priceRange) {
            const range = PRICE_RANGES.find((r) => r.key === priceRange);
            if (range) {
                result = result.filter((p) => p.price >= range.min && p.price <= range.max);
            } else if (priceRange === "custom") {
                result = result.filter((p) => p.price >= customMin && p.price <= customMax);
            }
        }

        // Stock
        if (inStockOnly) {
            result = result.filter((p) => p.stock > 0);
        }

        // Offer Filters
        if (offerFilters.includes("bestseller")) {
            result = result.filter((p) => p.isBestseller);
        }
        if (offerFilters.includes("featured")) {
            result = result.filter((p) => p.isFeatured);
        }
        if (offerFilters.includes("combos")) {
            result = result.filter((p) => p.categorySlug === "special-items");
        }
        if (offerFilters.includes("under100")) {
            result = result.filter((p) => p.price < 100);
        }

        // Sort
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "popular":
                result.sort((a, b) => b.numReviews - a.numReviews);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "new":
                result.sort((a, b) => b.id - a.id);
                break;
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                result.sort(
                    (a, b) =>
                        (b.isFeatured ? 2 : 0) +
                        (b.isBestseller ? 1 : 0) -
                        ((a.isFeatured ? 2 : 0) + (a.isBestseller ? 1 : 0))
                );
        }

        return result;
    }, [search, selectedCategory, sortBy, priceRange, customMin, customMax, inStockOnly, offerFilters]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleCategoryChange = (slug) => {
        const newCat = selectedCategory === slug ? "" : slug;
        setSelectedCategory(newCat);
        updateURL({ category: newCat });
    };

    const handlePriceRange = (key) => {
        const newRange = priceRange === key ? "" : key;
        setPriceRange(newRange);
        updateURL({ price: newRange });
    };

    const handleOfferToggle = (key) => {
        setOfferFilters((prev) =>
            prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
        );
    };

    const handleStockToggle = () => {
        const newVal = !inStockOnly;
        setInStockOnly(newVal);
        updateURL({ stock: newVal });
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSortBy("featured");
        setPriceRange("");
        setCustomMin(PRICE_MIN);
        setCustomMax(PRICE_MAX);
        setInStockOnly(false);
        setOfferFilters([]);
        setSearchParams({});
    };

    const toggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const activeFilterCount =
        (selectedCategory ? 1 : 0) +
        (priceRange ? 1 : 0) +
        (inStockOnly ? 1 : 0) +
        offerFilters.length +
        (search ? 1 : 0);

    const hasActiveFilters = activeFilterCount > 0;

    // Close mobile filter on outside click
    useEffect(() => {
        if (!mobileFilterOpen) return;
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setMobileFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [mobileFilterOpen]);

    // ── Category counts (live based on search) ─────────────────────────────
    const categoryCounts = useMemo(() => {
        let base = [...products];
        if (search.trim()) {
            const q = search.toLowerCase();
            base = base.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }
        const counts = {};
        categories.forEach((c) => {
            counts[c.slug] = base.filter((p) => p.categorySlug === c.slug).length;
        });
        return counts;
    }, [search]);

    return (
        <div className="products-page">
            {/* Page Header */}
            <div className="products-page-header">
                <div className="products-header-container">
                    <div className="products-header-left">
                        <h1 className="products-page-title">
                            {selectedCategory
                                ? categories.find((c) => c.slug === selectedCategory)?.name || "Products"
                                : "All Products"}
                        </h1>
                        <p className="products-page-count">
                            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                            {hasActiveFilters && (
                                <span className="products-filter-badge">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>
                            )}
                        </p>
                    </div>
                    <div className="products-header-right">
                        <div className="view-mode-toggle">
                            <button
                                className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                                onClick={() => setViewMode("grid")}
                                aria-label="Grid view"
                                id="view-grid"
                            >
                                <HiOutlineViewGrid />
                            </button>
                            <button
                                className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
                                onClick={() => setViewMode("list")}
                                aria-label="List view"
                                id="view-list"
                            >
                                <HiOutlineViewList />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="products-main-layout">
                {/* ── Mobile Filter Toggle ──────────────────────── */}
                <button
                    className="mobile-filter-toggle"
                    onClick={() => setMobileFilterOpen((p) => !p)}
                    id="mobile-filter-btn"
                >
                    <HiOutlineAdjustments />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="mobile-filter-count">{activeFilterCount}</span>
                    )}
                </button>

                {/* ── SIDEBAR FILTER PANEL ──────────────────────── */}
                <aside
                    ref={filterRef}
                    className={`filter-sidebar ${mobileFilterOpen ? "filter-sidebar-open" : ""}`}
                    id="filter-panel"
                >
                    <div className="filter-sidebar-header">
                        <h2 className="filter-sidebar-title">
                            <HiOutlineAdjustments /> Filters
                        </h2>
                        {hasActiveFilters && (
                            <button className="filter-reset-btn" onClick={clearFilters} id="reset-filters-btn">
                                <HiOutlineRefresh /> Reset
                            </button>
                        )}
                        <button
                            className="filter-sidebar-close"
                            onClick={() => setMobileFilterOpen(false)}
                        >
                            <HiOutlineX />
                        </button>
                    </div>

                    {/* ── Search ── */}
                    <div className="filter-search-wrap">
                        <HiOutlineSearch className="filter-search-icon" />
                        <input
                            type="text"
                            className="filter-search-input"
                            placeholder="Search crackers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            id="filter-search"
                        />
                        {search && (
                            <button className="filter-search-clear" onClick={() => setSearch("")}>
                                <HiOutlineX />
                            </button>
                        )}
                    </div>

                    {/* ── Categories ── */}
                    <div className="filter-section">
                        <button
                            className="filter-section-header"
                            onClick={() => toggleSection("categories")}
                        >
                            <span>Categories</span>
                            <HiOutlineChevronDown
                                className={`filter-chevron ${openSections.categories ? "open" : ""}`}
                            />
                        </button>
                        {openSections.categories && (
                            <div className="filter-section-body filter-categories-list">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.slug}
                                        className={`filter-category-item ${selectedCategory === cat.slug ? "active" : ""}`}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        id={`cat-filter-${cat.slug}`}
                                    >
                                        <span className="filter-cat-icon">{cat.icon}</span>
                                        <span className="filter-cat-name">{cat.name}</span>
                                        <span className="filter-cat-count">{categoryCounts[cat.slug]}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Price Filter ── */}
                    <div className="filter-section">
                        <button
                            className="filter-section-header"
                            onClick={() => toggleSection("price")}
                        >
                            <span><HiOutlineCurrencyRupee style={{ verticalAlign: "middle" }} /> Price Range</span>
                            <HiOutlineChevronDown
                                className={`filter-chevron ${openSections.price ? "open" : ""}`}
                            />
                        </button>
                        {openSections.price && (
                            <div className="filter-section-body">
                                <div className="filter-price-ranges">
                                    {PRICE_RANGES.map((range) => (
                                        <button
                                            key={range.key}
                                            className={`filter-price-btn ${priceRange === range.key ? "active" : ""}`}
                                            onClick={() => handlePriceRange(range.key)}
                                            id={`price-filter-${range.key}`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Range */}
                                <div className="filter-custom-range">
                                    <span className="filter-custom-label">Custom Range</span>
                                    <div className="filter-custom-inputs">
                                        <div className="filter-price-input-wrap">
                                            <span className="filter-price-prefix">₹</span>
                                            <input
                                                type="number"
                                                className="filter-price-input"
                                                placeholder="Min"
                                                value={customMin || ""}
                                                onChange={(e) => setCustomMin(Number(e.target.value) || 0)}
                                                min={0}
                                                id="price-min-input"
                                            />
                                        </div>
                                        <span className="filter-price-dash">—</span>
                                        <div className="filter-price-input-wrap">
                                            <span className="filter-price-prefix">₹</span>
                                            <input
                                                type="number"
                                                className="filter-price-input"
                                                placeholder="Max"
                                                value={customMax || ""}
                                                onChange={(e) => setCustomMax(Number(e.target.value) || PRICE_MAX)}
                                                min={0}
                                                id="price-max-input"
                                            />
                                        </div>
                                        <button
                                            className="filter-custom-apply"
                                            onClick={() => {
                                                setPriceRange("custom");
                                                updateURL({ price: "custom" });
                                            }}
                                            id="apply-custom-price"
                                        >
                                            Go
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Offers ── */}
                    <div className="filter-section">
                        <button
                            className="filter-section-header"
                            onClick={() => toggleSection("offers")}
                        >
                            <span><HiOutlineTag style={{ verticalAlign: "middle" }} /> Offers & Deals</span>
                            <HiOutlineChevronDown
                                className={`filter-chevron ${openSections.offers ? "open" : ""}`}
                            />
                        </button>
                        {openSections.offers && (
                            <div className="filter-section-body">
                                {OFFER_FILTERS.map((offer) => (
                                    <label
                                        key={offer.key}
                                        className={`filter-checkbox-label ${offerFilters.includes(offer.key) ? "checked" : ""}`}
                                        id={`offer-filter-${offer.key}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="filter-checkbox-input"
                                            checked={offerFilters.includes(offer.key)}
                                            onChange={() => handleOfferToggle(offer.key)}
                                        />
                                        <span className="filter-checkbox-custom" />
                                        <span>{offer.label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Stock ── */}
                    <div className="filter-section">
                        <button
                            className="filter-section-header"
                            onClick={() => toggleSection("stock")}
                        >
                            <span>Availability</span>
                            <HiOutlineChevronDown
                                className={`filter-chevron ${openSections.stock ? "open" : ""}`}
                            />
                        </button>
                        {openSections.stock && (
                            <div className="filter-section-body">
                                <label className={`filter-toggle-label ${inStockOnly ? "checked" : ""}`}>
                                    <span>In Stock Only</span>
                                    <button
                                        className={`filter-toggle ${inStockOnly ? "active" : ""}`}
                                        onClick={handleStockToggle}
                                        id="stock-toggle"
                                        role="switch"
                                        aria-checked={inStockOnly}
                                    >
                                        <span className="filter-toggle-knob" />
                                    </button>
                                </label>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── MAIN CONTENT ──────────────────────────────── */}
                <div className="products-content">
                    {/* Toolbar */}
                    <div className="products-toolbar">
                        <div className="toolbar-left">
                            {/* Active Filter Chips */}
                            {hasActiveFilters && (
                                <div className="active-filters">
                                    {selectedCategory && (
                                        <span className="filter-chip">
                                            {categories.find((c) => c.slug === selectedCategory)?.icon}{" "}
                                            {categories.find((c) => c.slug === selectedCategory)?.name}
                                            <button onClick={() => handleCategoryChange("")}>
                                                <HiOutlineX />
                                            </button>
                                        </span>
                                    )}
                                    {priceRange && priceRange !== "custom" && (
                                        <span className="filter-chip">
                                            💰 {PRICE_RANGES.find((r) => r.key === priceRange)?.label}
                                            <button onClick={() => handlePriceRange("")}>
                                                <HiOutlineX />
                                            </button>
                                        </span>
                                    )}
                                    {priceRange === "custom" && (
                                        <span className="filter-chip">
                                            💰 {formatPrice(customMin)} – {formatPrice(customMax)}
                                            <button onClick={() => { setPriceRange(""); updateURL({ price: "" }); }}>
                                                <HiOutlineX />
                                            </button>
                                        </span>
                                    )}
                                    {inStockOnly && (
                                        <span className="filter-chip">
                                            ✅ In Stock
                                            <button onClick={handleStockToggle}>
                                                <HiOutlineX />
                                            </button>
                                        </span>
                                    )}
                                    {offerFilters.map((f) => (
                                        <span className="filter-chip" key={f}>
                                            {OFFER_FILTERS.find((o) => o.key === f)?.icon}{" "}
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                            <button onClick={() => handleOfferToggle(f)}>
                                                <HiOutlineX />
                                            </button>
                                        </span>
                                    ))}
                                    {search && (
                                        <span className="filter-chip">
                                            🔍 "{search}"
                                            <button onClick={() => setSearch("")}>
                                                <HiOutlineX />
                                            </button>
                                        </span>
                                    )}
                                    <button className="clear-all-btn" onClick={clearFilters}>
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="toolbar-right">
                            <div className="sort-select-wrapper">
                                <label className="sort-label">Sort by:</label>
                                <select
                                    className="sort-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    id="sort-select"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className={`products-grid-page ${viewMode === "list" ? "products-list-view" : ""}`}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : (
                        <div className="products-empty">
                            <span className="empty-emoji">🔍</span>
                            <h3>No products found</h3>
                            <p>Try a different search or adjust your filters.</p>
                            <button className="btn btn-outline" onClick={clearFilters}>
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* Results summary */}
                    {filteredProducts.length > 0 && (
                        <div className="products-results-summary">
                            Showing {filteredProducts.length} of {products.length} products
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile overlay */}
            {mobileFilterOpen && (
                <div className="filter-overlay" onClick={() => setMobileFilterOpen(false)} />
            )}
        </div>
    );
}
