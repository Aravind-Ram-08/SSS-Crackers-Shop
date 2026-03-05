// ═══════════════════════════════════════════════════════════════════════════════
// SSS Crackers — AI Chatbot Engine
// Smart NLP-powered sales assistant with product search, recommendations,
// cart assistance, and multi-language support
// ═══════════════════════════════════════════════════════════════════════════════

import products, { categories } from "../../data/products";

// ── Intent Definitions ────────────────────────────────────────────────────────
const INTENTS = {
    GREETING: "greeting",
    PRODUCT_SEARCH: "product_search",
    CATEGORY_BROWSE: "category_browse",
    PRICE_ENQUIRY: "price_enquiry",
    COMBO_RECOMMEND: "combo_recommend",
    CART_ADD: "cart_add",
    CART_SHOW: "cart_show",
    CART_REMOVE: "cart_remove",
    SAFETY_TIPS: "safety_tips",
    LEGAL_INFO: "legal_info",
    DELIVERY_INFO: "delivery_info",
    WHATSAPP_ORDER: "whatsapp_order",
    OFFERS: "offers",
    HELP: "help",
    THANKS: "thanks",
    GOODBYE: "goodbye",
    BUDGET_SEARCH: "budget_search",
    BEST_PRODUCTS: "best_products",
    TAMIL_GREETING: "tamil_greeting",
    UNKNOWN: "unknown",
};

// ── Intent Patterns (English + Tamil) ─────────────────────────────────────────
const INTENT_PATTERNS = [
    // Greetings
    { intent: INTENTS.GREETING, patterns: [/^(hi|hello|hey|hii+|good\s*(morning|afternoon|evening)|howdy|hola|namaste|vanakkam)/i] },
    { intent: INTENTS.TAMIL_GREETING, patterns: [/^(vanakkam|வணக்கம்|நல்ல|eppadi|எப்படி)/i] },

    // Thanks / Goodbye
    { intent: INTENTS.THANKS, patterns: [/(thank|thanks|nandri|நன்றி|awesome|great)/i] },
    { intent: INTENTS.GOODBYE, patterns: [/^(bye|goodbye|see you|tata|good night|quit|exit)/i] },

    // Help
    { intent: INTENTS.HELP, patterns: [/(help|assist|support|what can you|menu|options)/i] },

    // Legal compliance
    { intent: INTENTS.LEGAL_INFO, patterns: [/(legal|supreme court|online (sale|order|buy|purchase)|law|ban|restrict|e-?commerce|regulation)/i] },

    // Safety
    { intent: INTENTS.SAFETY_TIPS, patterns: [/(safe|safety|precaution|careful|danger|warning|tips|guideline|children|kids.*safe|burn|injury|paathukaappu|பாதுகாப்பு)/i] },

    // Delivery
    { intent: INTENTS.DELIVERY_INFO, patterns: [/(deliver|delivery|shipping|ship|dispatch|courier|send to|arrive|transit|எப்போது வரும்)/i] },

    // WhatsApp
    { intent: INTENTS.WHATSAPP_ORDER, patterns: [/(whatsapp|whats app|wa order|order via|phone order|call|contact)/i] },

    // Offers
    { intent: INTENTS.OFFERS, patterns: [/(offer|discount|sale|deal|promo|coupon|code|சலுகை)/i] },

    // Cart operations
    { intent: INTENTS.CART_ADD, patterns: [/(add.*cart|add.*to.*cart|cart.*add|i want|buy|purchase|order|kart)/i] },
    { intent: INTENTS.CART_SHOW, patterns: [/(show.*cart|view.*cart|my cart|cart items|what.*in.*cart|open cart)/i] },
    { intent: INTENTS.CART_REMOVE, patterns: [/(remove.*cart|delete.*cart|cart.*remove|clear cart|empty cart)/i] },

    // Price enquiry
    { intent: INTENTS.PRICE_ENQUIRY, patterns: [/(price|cost|how much|rate|விலை|என்ன விலை|kitna|charge)/i] },

    // Budget search
    { intent: INTENTS.BUDGET_SEARCH, patterns: [/(under|below|less than|within|budget|cheap|affordable|low price|inexpensive)\s*₹?\s*\d+/i, /₹?\s*\d+\s*(under|below|less|budget)/i] },

    // Best products
    { intent: INTENTS.BEST_PRODUCTS, patterns: [/(best|top|popular|recommended|trending|favourite|famous|bestseller|most (sold|popular|bought))/i] },

    // Combo packs
    { intent: INTENTS.COMBO_RECOMMEND, patterns: [/(combo|pack|bundle|family|kids pack|gift|diwali pack|celebration pack|mega pack|special.*item)/i] },

    // Category browse — these need to be after other more specific patterns
    { intent: INTENTS.CATEGORY_BROWSE, patterns: [/(show|list|browse|view|display|see|all)\s+(.*)/i] },

    // Generic product search — catch-all for product references
    { intent: INTENTS.PRODUCT_SEARCH, patterns: [/(search|find|look|want|need|give|suggest|recommend)/i] },
];

// ── Category Name to Slug Mapping ─────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
    "one-sound-crackers": ["one sound", "single sound", "oosai", "oru oosai", "jallikattu", "bahubali", "lakshmi", "kuruvi", "parrot", "bird"],
    "deluxe-crackers": ["deluxe", "delux"],
    "giant-chorsa": ["chorsa", "giant", "chorsa giant"],
    "bijili-crackers": ["bijili", "bijli", "bijilee", "mini cracker"],
    "ground-chakkar": ["chakkar", "chakra", "spinner", "wheel", "butterfly", "bambaram", "ground spin"],
    "flower-pots": ["flower pot", "flowerpot", "flower", "fountain pot", "colour koti", "multi pop", "peacock"],
    "garland-bang-crackers": ["garland", "wala", "ladi", "string", "chain"],
    "pencil": ["pencil", "colour pencil", "electric pencil"],
    "bombs": ["bomb", "atom", "hydrogen", "nero", "classic bomb"],
    "twinkling-star": ["twinkling", "twinkle", "star"],
    "stone-cartoon": ["stone", "cartoon", "snake", "magic stone", "pop pop", "snapper", "jumping", "whistling"],
    "rockets": ["rocket", "baby rocket", "whistle rocket", "colour rocket", "two stage"],
    "aerial-fancy": ["aerial", "sky shot", "fancy aerial", "sky"],
    "special-fountain": ["fountain", "silver fountain", "gold fountain", "mega fountain", "crackling fountain"],
    "repeating-cake": ["cake", "repeating", "shot cake", "shots cake"],
    "fancy-items": ["fancy", "champagne", "magic wand", "colour smoke", "smoke", "paper cap", "magic candle", "wand"],
    "sparklers": ["sparkler", "sparkle", "pul", "pul vanam", "green sparkler", "red sparkler", "multi colour sparkler"],
    "musical-shot": ["musical", "music", "melody"],
    "special-items": ["special", "combo", "family", "kids", "gift", "premium", "mega value", "celebration", "pack"],
};

// ── Fuzzy Text Matching ───────────────────────────────────────────────────────
function fuzzyMatch(text, query) {
    const t = text.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return 1.0;
    if (q.includes(t)) return 0.9;

    // Word-level matching
    const queryWords = q.split(/\s+/);
    const textWords = t.split(/\s+/);
    let matched = 0;
    for (const qw of queryWords) {
        if (textWords.some(tw => tw.includes(qw) || qw.includes(tw))) {
            matched++;
        }
    }
    return queryWords.length > 0 ? matched / queryWords.length : 0;
}

// ── Detect Intent ─────────────────────────────────────────────────────────────
function detectIntent(message) {
    const msg = message.trim().toLowerCase();

    // Check budget search first (has numbers)
    const budgetMatch = msg.match(/(under|below|less than|within|budget|cheap|affordable)\s*₹?\s*(\d+)/i)
        || msg.match(/₹?\s*(\d+)\s*(under|below|less)/i);
    if (budgetMatch) {
        const amount = parseInt(budgetMatch[2] || budgetMatch[1]);
        if (!isNaN(amount)) {
            return { intent: INTENTS.BUDGET_SEARCH, data: { budget: amount } };
        }
    }

    // Check explicit category mentions
    for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
            if (msg.includes(kw.toLowerCase())) {
                // Check if it's a price enquiry about this category
                if (/(price|cost|how much|rate|kitna|விலை)/.test(msg)) {
                    return { intent: INTENTS.PRICE_ENQUIRY, data: { categorySlug: slug } };
                }
                // Check if it's an add to cart request
                if (/(add|buy|purchase|order|want|i need)/.test(msg)) {
                    return { intent: INTENTS.CART_ADD, data: { searchQuery: kw, categorySlug: slug } };
                }
                // It's a category browse
                return { intent: INTENTS.CATEGORY_BROWSE, data: { categorySlug: slug, keyword: kw } };
            }
        }
    }

    // Check patterns
    for (const { intent, patterns } of INTENT_PATTERNS) {
        for (const pattern of patterns) {
            const match = msg.match(pattern);
            if (match) {
                return { intent, data: { match, fullMessage: msg } };
            }
        }
    }

    // If message contains a product name (fuzzy match)
    const productMatch = findProducts(msg);
    if (productMatch.length > 0) {
        return { intent: INTENTS.PRODUCT_SEARCH, data: { searchQuery: msg, products: productMatch } };
    }

    return { intent: INTENTS.UNKNOWN, data: { fullMessage: msg } };
}

// ── Find Products by Query ────────────────────────────────────────────────────
function findProducts(query, limit = 5) {
    const q = query.toLowerCase().replace(/[^a-z0-9\s₹]/g, "");
    if (!q.trim()) return [];

    const scored = products.map(p => {
        let score = 0;
        score += fuzzyMatch(p.name, q) * 3;
        score += fuzzyMatch(p.category, q) * 2;
        score += fuzzyMatch(p.description, q) * 1;

        // Boost bestsellers and featured
        if (p.isBestseller) score += 0.3;
        if (p.isFeatured) score += 0.2;

        return { product: p, score };
    });

    return scored
        .filter(s => s.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.product);
}

// ── Find Products by Category ─────────────────────────────────────────────────
function findByCategory(categorySlug) {
    return products.filter(p => p.categorySlug === categorySlug);
}

// ── Find Products Under Budget ────────────────────────────────────────────────
function findUnderBudget(budget, limit = 6) {
    return products
        .filter(p => p.price <= budget)
        .sort((a, b) => b.price - a.price)
        .slice(0, limit);
}

// ── Find Best / Popular Products ──────────────────────────────────────────────
function findBestProducts(categorySlug = null, limit = 5) {
    let pool = categorySlug
        ? products.filter(p => p.categorySlug === categorySlug)
        : products;
    return pool
        .filter(p => p.isBestseller || p.isFeatured)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

// ── Format Price ──────────────────────────────────────────────────────────────
function fmtPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR",
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
}

// ── Product Card for Chat ─────────────────────────────────────────────────────
function formatProductCard(p) {
    return {
        type: "product",
        id: p.id,
        name: p.name,
        price: p.price,
        priceFormatted: fmtPrice(p.price),
        category: p.category,
        boxContent: p.boxContent,
        categorySlug: p.categorySlug,
        isBestseller: p.isBestseller,
        description: p.description?.substring(0, 100) + "...",
    };
}

// ── WhatsApp Link Generator ───────────────────────────────────────────────────
function generateWhatsAppLink(cartItems = []) {
    const phone = "919876543210"; // Replace with actual number
    let message = "🧨 *SSS Crackers Order Enquiry*\n\n";

    if (cartItems.length > 0) {
        message += "I'd like to enquire about the following items:\n\n";
        cartItems.forEach((item, i) => {
            message += `${i + 1}. ${item.name} × ${item.quantity} — ${fmtPrice(item.price * item.quantity)}\n`;
        });
        const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
        message += `\n*Total: ${fmtPrice(total)}*\n`;
    } else {
        message += "I'd like to place an order. Please share the latest catalogue.\n";
    }

    message += "\nPlease confirm availability and delivery details. 🙏";
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ── Safety Guidelines ─────────────────────────────────────────────────────────
const SAFETY_GUIDELINES = [
    "🧯 Always keep a bucket of water nearby when bursting crackers.",
    "👶 Children should only use crackers under adult supervision.",
    "👗 Wear cotton clothes and avoid loose/synthetic clothing.",
    "👂 Use ear protection for loud crackers like bombs and garlands.",
    "🔥 Never hold a lit cracker in your hand.",
    "📍 Burst crackers only in open, spacious areas away from buildings.",
    "🚫 Never try to re-light a failed/dud cracker.",
    "💧 Dip used crackers in water before disposing them.",
    "🐾 Keep pets indoors during celebrations.",
    "🏥 Keep a first-aid kit ready at all times.",
];

// ── Festival Offers ───────────────────────────────────────────────────────────
const FESTIVAL_OFFERS = [
    "🎆 **Diwali Mega Sale is LIVE!** Up to 30% OFF on selected items!",
    "🎁 Buy any Family Pack and get FREE sparklers worth ₹200!",
    "🚚 FREE delivery on all orders above ₹999!",
    "💥 Flat 20% OFF on all combo packs — use code **DIWALI2026**",
    "✨ Special Bundle Deal: Buy 3 or more in any category and get 10% extra discount!",
];

// ── Legal Compliance Message ──────────────────────────────────────────────────
const LEGAL_MESSAGE = `⚖️ **Important Legal Notice**

As per the 2018 Supreme Court order, online sale of firecrackers through e-commerce platforms is restricted.

This website provides **product information and enquiry support** only. Orders are handled through **licensed retail channels** in compliance with all applicable laws.

For placing orders, please visit our physical store or contact us via WhatsApp.

📍 **SSS Crackers**, Sivakasi, Tamil Nadu
📱 WhatsApp: +91 98765 43210`;

// ── Delivery Info ─────────────────────────────────────────────────────────────
const DELIVERY_INFO = `🚚 **Delivery Information**

• **Delivery Areas:** We deliver across Tamil Nadu, Karnataka, Kerala, and Andhra Pradesh.
• **Delivery Time:** 3-5 business days (varies by location).
• **Free Delivery:** On orders above ₹999.
• **Delivery Charge:** ₹99 for orders below ₹999.
• **Packaging:** All products are packed in fireproof, shock-resistant packaging.
• **Tracking:** Order tracking available via WhatsApp updates.

⚠️ Delivery is subject to local regulations and availability.

For specific delivery queries, contact us on WhatsApp.`;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN RESPONSE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function generateResponse(message, context = {}) {
    const { intent, data } = detectIntent(message);
    const { cartItems = [], conversationHistory = [] } = context;

    let response = {
        text: "",
        products: [],
        quickReplies: [],
        actions: [],
        intent,
        whatsappLink: null,
    };

    switch (intent) {
        case INTENTS.GREETING:
            response.text = getGreeting();
            response.quickReplies = [
                { label: "🛍️ View Products", action: "browse_products" },
                { label: "🔥 Best Offers", action: "offers" },
                { label: "📦 Combo Packs", action: "combos" },
                { label: "🛒 My Cart", action: "show_cart" },
                { label: "💬 Help", action: "help" },
            ];
            break;

        case INTENTS.TAMIL_GREETING:
            response.text = "வணக்கம்! 🙏 SSS Crackers-க்கு வரவேற்கிறோம்!\n\nஎங்களிடம் 100+ வகையான பட்டாசுகள் உள்ளன. என்ன வேண்டும் என்று சொல்லுங்கள்!\n\nHello! Welcome to SSS Crackers! We have 100+ varieties of crackers. Tell me what you're looking for!";
            response.quickReplies = [
                { label: "🛍️ பொருட்களைக் காட்டு", action: "browse_products" },
                { label: "📦 Combo Packs", action: "combos" },
                { label: "💬 Help", action: "help" },
            ];
            break;

        case INTENTS.PRODUCT_SEARCH: {
            const query = data.searchQuery || data.fullMessage || message;
            const found = data.products || findProducts(query);
            if (found.length > 0) {
                response.text = `🔍 Found **${found.length}** product${found.length > 1 ? "s" : ""} matching "${query}":`;
                response.products = found.map(formatProductCard);
                response.quickReplies = [
                    { label: "🛒 Add to Cart", action: "cart_help" },
                    { label: "📋 More Options", action: "browse_products" },
                ];
            } else {
                response.text = `😕 I couldn't find products matching "${query}". Try searching by category or product name.\n\nHere are some popular options:`;
                response.products = findBestProducts(null, 3).map(formatProductCard);
                response.quickReplies = [
                    { label: "📋 Browse Categories", action: "browse_products" },
                    { label: "🔥 Bestsellers", action: "best_products" },
                ];
            }
            break;
        }

        case INTENTS.CATEGORY_BROWSE: {
            const slug = data.categorySlug;
            if (slug) {
                const catProducts = findByCategory(slug);
                const catInfo = categories.find(c => c.slug === slug);
                if (catProducts.length > 0) {
                    response.text = `${catInfo?.icon || "🧨"} **${catInfo?.name || slug}** — ${catProducts.length} products available:`;
                    response.products = catProducts.slice(0, 6).map(formatProductCard);
                    if (catProducts.length > 6) {
                        response.text += `\n\n_Showing 6 of ${catProducts.length} products. Visit the shop for the full list._`;
                    }
                } else {
                    response.text = "I couldn't find products in that category. Here are all categories:";
                    response.quickReplies = categories.slice(0, 8).map(c => ({
                        label: `${c.icon} ${c.name}`, action: `category_${c.slug}`,
                    }));
                }
            } else {
                response.text = "📋 **Browse our categories:**\n\nTap any category to see products:";
                response.quickReplies = categories.map(c => ({
                    label: `${c.icon} ${c.name}`, action: `category_${c.slug}`,
                }));
            }
            response.quickReplies.push({ label: "🏠 Home", action: "greeting" });
            break;
        }

        case INTENTS.PRICE_ENQUIRY: {
            if (data.categorySlug) {
                const catProducts = findByCategory(data.categorySlug);
                const catInfo = categories.find(c => c.slug === data.categorySlug);
                if (catProducts.length > 0) {
                    response.text = `💰 **${catInfo?.name} Price List:**\n\n`;
                    catProducts.forEach(p => {
                        response.text += `• **${p.name}** — ${fmtPrice(p.price)} (${p.boxContent})\n`;
                    });
                    response.products = catProducts.slice(0, 4).map(formatProductCard);
                }
            } else {
                // Try to find product from query
                const query = data.fullMessage?.replace(/(price|cost|how much|rate|of|the|is|what)/gi, "").trim() || message;
                const found = findProducts(query, 3);
                if (found.length > 0) {
                    response.text = "💰 **Price Details:**\n\n";
                    found.forEach(p => {
                        response.text += `• **${p.name}** — ${fmtPrice(p.price)} (${p.boxContent})\n`;
                    });
                    response.products = found.map(formatProductCard);
                } else {
                    response.text = "I'd be happy to help with pricing! Which product or category are you interested in?";
                    response.quickReplies = categories.slice(0, 6).map(c => ({
                        label: `${c.icon} ${c.name}`, action: `price_${c.slug}`,
                    }));
                }
            }
            response.quickReplies = [
                { label: "🛒 Add to Cart", action: "cart_help" },
                { label: "📋 More Categories", action: "browse_products" },
            ];
            break;
        }

        case INTENTS.BUDGET_SEARCH: {
            const budget = data.budget;
            const found = findUnderBudget(budget);
            if (found.length > 0) {
                response.text = `💰 **Products under ${fmtPrice(budget)}** — ${found.length} options found:`;
                response.products = found.map(formatProductCard);
            } else {
                response.text = `Sorry, I couldn't find products under ${fmtPrice(budget)}. Our most affordable products start at ${fmtPrice(20)}.`;
                response.products = findUnderBudget(100, 4).map(formatProductCard);
            }
            response.quickReplies = [
                { label: "💰 Under ₹100", action: "budget_100" },
                { label: "💰 Under ₹500", action: "budget_500" },
                { label: "💰 Under ₹1000", action: "budget_1000" },
            ];
            break;
        }

        case INTENTS.BEST_PRODUCTS: {
            // Check if asking about specific category
            let catSlug = null;
            for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
                if (keywords.some(kw => message.toLowerCase().includes(kw))) {
                    catSlug = slug;
                    break;
                }
            }
            const best = findBestProducts(catSlug, 5);
            const catInfo = catSlug ? categories.find(c => c.slug === catSlug) : null;
            response.text = catInfo
                ? `🏆 **Best ${catInfo.name}:**`
                : "🏆 **Our Top Picks & Bestsellers:**";
            response.products = best.map(formatProductCard);
            response.quickReplies = [
                { label: "📦 Combo Packs", action: "combos" },
                { label: "🛍️ All Products", action: "browse_products" },
            ];
            break;
        }

        case INTENTS.COMBO_RECOMMEND: {
            const combos = findByCategory("special-items");
            response.text = "📦 **Special Combo Packs:**\n\nMost customers love our combo packs! They're curated for different celebrations:\n";
            response.products = combos.map(formatProductCard);
            response.text += "\n💡 **Tip:** The _Diwali Family Combo_ is our #1 bestseller — perfect for a complete celebration!";
            response.quickReplies = [
                { label: "🛒 Add Combo to Cart", action: "cart_help" },
                { label: "📱 Order via WhatsApp", action: "whatsapp" },
            ];
            break;
        }

        case INTENTS.CART_ADD: {
            const query = data.searchQuery || message.replace(/(add|to|cart|buy|purchase|order|i want|please)/gi, "").trim();
            const found = findProducts(query, 3);
            if (found.length > 0) {
                response.text = "🛒 Which product would you like to add to cart?";
                response.products = found.map(formatProductCard);
                response.actions = found.map(p => ({
                    type: "add_to_cart",
                    productId: p.id,
                    label: `Add ${p.name}`,
                }));
            } else {
                response.text = "I'd love to help you add items! Which product are you interested in?";
                response.quickReplies = [
                    { label: "📋 Browse Products", action: "browse_products" },
                    { label: "🏆 Bestsellers", action: "best_products" },
                ];
            }
            break;
        }

        case INTENTS.CART_SHOW:
            if (cartItems.length > 0) {
                const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
                response.text = `🛒 **Your Cart** (${cartItems.length} item${cartItems.length > 1 ? "s" : ""}):\n\n`;
                cartItems.forEach((item, i) => {
                    response.text += `${i + 1}. **${item.name}** × ${item.quantity} — ${fmtPrice(item.price * item.quantity)}\n`;
                });
                response.text += `\n**Total: ${fmtPrice(total)}**`;
                if (total < 999) {
                    response.text += `\n\n💡 Add ${fmtPrice(999 - total)} more for FREE delivery!`;
                } else {
                    response.text += "\n\n🚚 You qualify for FREE delivery!";
                }
                response.quickReplies = [
                    { label: "✅ Checkout", action: "checkout" },
                    { label: "📱 Order via WhatsApp", action: "whatsapp" },
                    { label: "🛍️ Continue Shopping", action: "browse_products" },
                ];
                response.whatsappLink = generateWhatsAppLink(cartItems);
            } else {
                response.text = "🛒 Your cart is empty! Let me help you find some great products.";
                response.quickReplies = [
                    { label: "🏆 Bestsellers", action: "best_products" },
                    { label: "📦 Combo Packs", action: "combos" },
                    { label: "📋 Categories", action: "browse_products" },
                ];
            }
            break;

        case INTENTS.CART_REMOVE:
            response.text = "To remove items from your cart, please use the cart page. Tap below to go there:";
            response.quickReplies = [
                { label: "🛒 Open Cart", action: "open_cart" },
                { label: "🛍️ Continue Shopping", action: "browse_products" },
            ];
            break;

        case INTENTS.SAFETY_TIPS:
            response.text = "🧯 **Firecracker Safety Guidelines:**\n\n";
            SAFETY_GUIDELINES.forEach(tip => {
                response.text += `${tip}\n\n`;
            });
            response.text += "Stay safe and celebrate responsibly! 🙏";
            response.quickReplies = [
                { label: "🛍️ Shop Now", action: "browse_products" },
                { label: "📱 Contact Us", action: "whatsapp" },
            ];
            break;

        case INTENTS.LEGAL_INFO:
            response.text = LEGAL_MESSAGE;
            response.quickReplies = [
                { label: "📱 Order via WhatsApp", action: "whatsapp" },
                { label: "📍 Store Location", action: "delivery" },
            ];
            response.whatsappLink = generateWhatsAppLink();
            break;

        case INTENTS.DELIVERY_INFO:
            response.text = DELIVERY_INFO;
            response.quickReplies = [
                { label: "📱 Order via WhatsApp", action: "whatsapp" },
                { label: "🛍️ Shop Now", action: "browse_products" },
            ];
            break;

        case INTENTS.WHATSAPP_ORDER:
            response.text = "📱 **Order via WhatsApp**\n\nYou can place your order or enquire about products directly on WhatsApp!\n\nTap the button below to start:";
            response.whatsappLink = generateWhatsAppLink(cartItems);
            response.quickReplies = [
                { label: "📱 Open WhatsApp", action: "open_whatsapp" },
                { label: "🛒 View Cart First", action: "show_cart" },
            ];
            break;

        case INTENTS.OFFERS:
            response.text = "🎉 **Current Offers & Deals:**\n\n";
            FESTIVAL_OFFERS.forEach(offer => {
                response.text += `${offer}\n\n`;
            });
            response.text += "Don't miss out — offers valid while stocks last!";
            response.quickReplies = [
                { label: "📦 Combo Packs", action: "combos" },
                { label: "🛍️ Shop Now", action: "browse_products" },
                { label: "📱 Order via WhatsApp", action: "whatsapp" },
            ];
            break;

        case INTENTS.HELP:
            response.text = "🤖 **I'm your SSS Crackers Assistant!** Here's what I can do:\n\n" +
                "🔍 **Search Products** — \"Show me rockets\"\n" +
                "💰 **Price Check** — \"Price of flower pots\"\n" +
                "📋 **Browse Categories** — \"Show sparklers\"\n" +
                "📦 **Combo Packs** — \"Show combo packs\"\n" +
                "🛒 **Cart Help** — \"Add to cart\" / \"Show cart\"\n" +
                "💸 **Budget Search** — \"Under ₹200\"\n" +
                "🏆 **Best Products** — \"Best rockets\"\n" +
                "🎉 **Offers** — \"Current offers\"\n" +
                "🧯 **Safety Tips** — \"Safety guidelines\"\n" +
                "🚚 **Delivery** — \"Delivery info\"\n" +
                "📱 **WhatsApp** — \"Order via WhatsApp\"\n\n" +
                "Just type naturally or tap the quick buttons! 😊";
            response.quickReplies = [
                { label: "🛍️ View Products", action: "browse_products" },
                { label: "🔥 Best Offers", action: "offers" },
                { label: "📦 Combos", action: "combos" },
                { label: "🧯 Safety Tips", action: "safety" },
                { label: "📱 WhatsApp", action: "whatsapp" },
            ];
            break;

        case INTENTS.THANKS:
            response.text = getRandom([
                "You're welcome! 😊 Happy to help. Is there anything else you need?",
                "Glad I could help! 🎉 Let me know if you need anything else.",
                "My pleasure! 🙏 Wishing you a spectacular celebration!",
                "நன்றி! (Thank you!) Happy to assist. Need anything else? 🧨",
            ]);
            response.quickReplies = [
                { label: "🛍️ Shop More", action: "browse_products" },
                { label: "🛒 View Cart", action: "show_cart" },
            ];
            break;

        case INTENTS.GOODBYE:
            response.text = getRandom([
                "Goodbye! 👋 Have a wonderful celebration! Visit us anytime. 🧨",
                "See you soon! 🎆 Wishing you a happy and safe Diwali!",
                "Bye bye! 🙏 Thank you for choosing SSS Crackers. Come back anytime!",
            ]);
            break;

        default:
            response.text = getRandom([
                "I'm not sure I understand that. Let me help you with some options:",
                "Hmm, I couldn't quite get that. Here's what I can help with:",
                "I'm still learning! Here are some things I can help you with:",
            ]);
            response.quickReplies = [
                { label: "🛍️ View Products", action: "browse_products" },
                { label: "🔥 Best Offers", action: "offers" },
                { label: "📦 Combo Packs", action: "combos" },
                { label: "💬 Help", action: "help" },
                { label: "📱 WhatsApp", action: "whatsapp" },
            ];
            break;
    }

    return response;
}

// ── Handle Quick Reply Actions ────────────────────────────────────────────────
export function handleQuickAction(action, context = {}) {
    const actionMap = {
        greeting: () => generateResponse("hello", context),
        browse_products: () => generateResponse("show all categories", context),
        offers: () => generateResponse("show current offers", context),
        combos: () => generateResponse("show combo packs", context),
        show_cart: () => generateResponse("show my cart", context),
        best_products: () => generateResponse("best products", context),
        help: () => generateResponse("help", context),
        safety: () => generateResponse("safety guidelines", context),
        whatsapp: () => generateResponse("whatsapp order", context),
        delivery: () => generateResponse("delivery information", context),
        cart_help: () => generateResponse("how to add to cart", context),
        checkout: () => ({ text: "", actions: [{ type: "navigate", path: "/checkout" }], intent: "navigate" }),
        open_cart: () => ({ text: "", actions: [{ type: "navigate", path: "/cart" }], intent: "navigate" }),
        open_whatsapp: () => {
            const link = generateWhatsAppLink(context.cartItems || []);
            return { text: "", actions: [{ type: "open_link", url: link }], intent: "whatsapp", whatsappLink: link };
        },
        budget_100: () => generateResponse("products under ₹100", context),
        budget_500: () => generateResponse("products under ₹500", context),
        budget_1000: () => generateResponse("products under ₹1000", context),
    };

    // Category actions
    if (action.startsWith("category_")) {
        const slug = action.replace("category_", "");
        return generateResponse(`show ${slug.replace(/-/g, " ")}`, context);
    }

    // Price actions
    if (action.startsWith("price_")) {
        const slug = action.replace("price_", "");
        return generateResponse(`price of ${slug.replace(/-/g, " ")}`, context);
    }

    const handler = actionMap[action];
    if (handler) return handler();

    return generateResponse("help", context);
}

// ── Welcome Message ───────────────────────────────────────────────────────────
export function getWelcomeMessage() {
    return {
        text: "🧨 **Welcome to SSS Crackers!**\n\nI'm your smart shopping assistant! I can help you:\n\n🔍 Find products & check prices\n📦 Suggest combo packs\n🛒 Manage your cart\n🎉 Share current offers\n\nHow can I help you today?",
        products: [],
        quickReplies: [
            { label: "🛍️ View Products", action: "browse_products" },
            { label: "🔥 Best Offers", action: "offers" },
            { label: "📦 Combo Packs", action: "combos" },
            { label: "🧯 Safety Tips", action: "safety" },
            { label: "💬 Help", action: "help" },
        ],
        actions: [],
        intent: INTENTS.GREETING,
        isWelcome: true,
    };
}

// ── Festival Banner (auto-shown) ──────────────────────────────────────────────
export function getFestivalBanner() {
    return {
        text: "🎆 **Diwali Sale is LIVE!** Up to 30% OFF on selected items. Free delivery on orders above ₹999! 🎉",
        products: [],
        quickReplies: [
            { label: "🛍️ Shop Now", action: "browse_products" },
            { label: "📦 Combo Packs", action: "combos" },
        ],
        actions: [],
        intent: "festival_banner",
        isBanner: true,
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getGreeting() {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return getRandom([
        `${timeGreeting}! 🙏 Welcome to **SSS Crackers**! I'm here to help you find the perfect crackers for your celebration. What are you looking for?`,
        `${timeGreeting}! 🧨 Welcome to **SSS Crackers**! We have 100+ varieties of premium crackers. How can I assist you today?`,
        `Hey there! 👋 Welcome to **SSS Crackers**! Looking for something specific, or shall I show you our bestsellers?`,
    ]);
}

// ── Export FAQ Data for Admin Panel ───────────────────────────────────────────
export const FAQ_DATA = [
    { id: 1, question: "What is the minimum order amount?", answer: "There is no minimum order amount. However, orders above ₹999 qualify for free delivery.", category: "Orders" },
    { id: 2, question: "Do you deliver to my city?", answer: "We deliver across Tamil Nadu, Karnataka, Kerala, and Andhra Pradesh. Contact us for other locations.", category: "Delivery" },
    { id: 3, question: "Are the crackers safe?", answer: "Yes! All our products are manufactured in Sivakasi using safe materials and are tested for quality.", category: "Safety" },
    { id: 4, question: "Can I return damaged products?", answer: "Yes, we replace any damaged products. Contact us within 24 hours of delivery with photos.", category: "Returns" },
    { id: 5, question: "What payment methods do you accept?", answer: "We accept UPI, Credit/Debit Cards, Net Banking, and Wallets via Razorpay. WhatsApp orders accept UPI.", category: "Payment" },
    { id: 6, question: "Is online sale legal?", answer: "As per the 2018 SC order, online sales are restricted. We provide information and enquiry support. Orders through licensed channels.", category: "Legal" },
    { id: 7, question: "Do you have Green Crackers?", answer: "Yes! Our sparkler collection includes low-smoke, eco-friendly green sparklers.", category: "Products" },
    { id: 8, question: "How to store crackers safely?", answer: "Store in a cool, dry place away from direct sunlight. Keep away from children and heat sources.", category: "Safety" },
];

export const PROMO_MESSAGES = FESTIVAL_OFFERS;
export { generateWhatsAppLink, findProducts, findByCategory, SAFETY_GUIDELINES };
