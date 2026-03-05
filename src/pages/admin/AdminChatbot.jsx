import { useState } from "react";
import {
    HiOutlineChat, HiOutlineQuestionMarkCircle, HiOutlineSpeakerphone,
    HiOutlineSearch, HiOutlineX, HiOutlinePencil, HiOutlineTrash,
    HiOutlinePlus, HiOutlineCheck, HiOutlineChartBar, HiOutlineEye,
    HiOutlineClock, HiOutlineTrendingUp,
} from "react-icons/hi";
import { useChat } from "../../context/ChatContext";
import { FAQ_DATA, PROMO_MESSAGES } from "../../components/chatbot/chatEngine";
import "./AdminChatbot.css";

const TABS = [
    { id: "analytics", label: "Analytics", icon: HiOutlineChartBar },
    { id: "conversations", label: "Conversations", icon: HiOutlineChat },
    { id: "faqs", label: "FAQs", icon: HiOutlineQuestionMarkCircle },
    { id: "promos", label: "Promotions", icon: HiOutlineSpeakerphone },
];

const INTENT_LABELS = {
    greeting: "Greeting",
    product_search: "Product Search",
    category_browse: "Category Browse",
    price_enquiry: "Price Enquiry",
    combo_recommend: "Combo Packs",
    cart_add: "Add to Cart",
    cart_show: "View Cart",
    cart_remove: "Remove from Cart",
    safety_tips: "Safety Tips",
    legal_info: "Legal Info",
    delivery_info: "Delivery Info",
    whatsapp_order: "WhatsApp Order",
    offers: "Offers & Deals",
    help: "Help",
    thanks: "Thanks",
    goodbye: "Goodbye",
    budget_search: "Budget Search",
    best_products: "Best Products",
    tamil_greeting: "Tamil Greeting",
    unknown: "Unknown",
};

export default function AdminChatbot() {
    const { chatLog, getChatAnalytics } = useChat();
    const analytics = getChatAnalytics();

    const [activeTab, setActiveTab] = useState("analytics");
    const [faqs, setFaqs] = useState(FAQ_DATA);
    const [promos, setPromos] = useState(PROMO_MESSAGES);
    const [editingFaq, setEditingFaq] = useState(null);
    const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "General" });
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [promoInput, setPromoInput] = useState("");
    const [searchConv, setSearchConv] = useState("");

    // ── FAQ Handlers ──────────────────────────────────────────────────────
    function openAddFaq() {
        setEditingFaq(null);
        setFaqForm({ question: "", answer: "", category: "General" });
        setShowFaqModal(true);
    }

    function openEditFaq(faq) {
        setEditingFaq(faq.id);
        setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category });
        setShowFaqModal(true);
    }

    function saveFaq() {
        if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
        if (editingFaq !== null) {
            setFaqs(prev => prev.map(f => f.id === editingFaq ? { ...f, ...faqForm } : f));
        } else {
            setFaqs(prev => [...prev, { id: Date.now(), ...faqForm }]);
        }
        setShowFaqModal(false);
    }

    function deleteFaq(id) {
        setFaqs(prev => prev.filter(f => f.id !== id));
    }

    // ── Promo Handlers ────────────────────────────────────────────────────
    function addPromo() {
        if (!promoInput.trim()) return;
        setPromos(prev => [...prev, promoInput.trim()]);
        setPromoInput("");
    }

    function deletePromo(index) {
        setPromos(prev => prev.filter((_, i) => i !== index));
    }

    // ── Filter Conversations ──────────────────────────────────────────────
    const filteredConvs = analytics.recentChats.filter(c =>
        !searchConv ||
        c.userMessage?.toLowerCase().includes(searchConv.toLowerCase()) ||
        c.botIntent?.toLowerCase().includes(searchConv.toLowerCase())
    );

    // ── KPI Cards ─────────────────────────────────────────────────────────
    const kpis = [
        {
            label: "Total Messages",
            value: analytics.totalConversations,
            icon: HiOutlineChat,
            accent: "#3b82f6",
            glow: "rgba(59,130,246,0.2)",
        },
        {
            label: "Most Asked Intent",
            value: analytics.topIntents[0] ? INTENT_LABELS[analytics.topIntents[0][0]] || analytics.topIntents[0][0] : "—",
            icon: HiOutlineTrendingUp,
            accent: "#ff6a00",
            glow: "rgba(255,106,0,0.2)",
        },
        {
            label: "FAQs Active",
            value: faqs.length,
            icon: HiOutlineQuestionMarkCircle,
            accent: "#10b981",
            glow: "rgba(16,185,129,0.2)",
        },
        {
            label: "Active Promos",
            value: promos.length,
            icon: HiOutlineSpeakerphone,
            accent: "#8b5cf6",
            glow: "rgba(139,92,246,0.2)",
        },
    ];

    return (
        <div className="admin-page admin-chatbot">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">AI Chatbot</h1>
                    <p className="admin-page-sub">Manage your chatbot, FAQs, and promotional messages</p>
                </div>
            </div>

            {/* ── KPI Grid ─────────────────────────────────────────── */}
            <div className="kpi-grid">
                {kpis.map((kpi, i) => (
                    <div className="kpi-card" key={i} style={{ "--accent": kpi.accent, "--glow": kpi.glow }}>
                        <div className="kpi-icon-wrap">
                            <kpi.icon className="kpi-icon" />
                        </div>
                        <div className="kpi-body">
                            <p className="kpi-label">{kpi.label}</p>
                            <p className="kpi-value">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tab Navigation ────────────────────────────────────── */}
            <div className="chatbot-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`chatbot-tab ${activeTab === tab.id ? "chatbot-tab-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════ ANALYTICS TAB ══════════ */}
            {activeTab === "analytics" && (
                <div className="chatbot-tab-content">
                    <div className="admin-card-grid">
                        {/* Top Intents */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h3 className="admin-card-title">Most Asked Topics</h3>
                            </div>
                            <div className="chatbot-analytics-list">
                                {analytics.topIntents.length > 0 ? analytics.topIntents.map(([intent, count], i) => (
                                    <div className="analytics-row" key={intent}>
                                        <span className="analytics-rank">#{i + 1}</span>
                                        <span className="analytics-label">{INTENT_LABELS[intent] || intent}</span>
                                        <div className="analytics-bar-wrap">
                                            <div
                                                className="analytics-bar"
                                                style={{
                                                    width: `${(count / (analytics.topIntents[0]?.[1] || 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="analytics-count">{count}</span>
                                    </div>
                                )) : (
                                    <p className="empty-text">No conversations yet. The chatbot will track topics automatically.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Queries */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h3 className="admin-card-title">Most Asked Questions</h3>
                            </div>
                            <div className="chatbot-analytics-list">
                                {analytics.topQueries.length > 0 ? analytics.topQueries.map(([query, count], i) => (
                                    <div className="analytics-row" key={query}>
                                        <span className="analytics-rank">#{i + 1}</span>
                                        <span className="analytics-label query">&quot;{query}&quot;</span>
                                        <span className="analytics-count">{count}</span>
                                    </div>
                                )) : (
                                    <p className="empty-text">No questions logged yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ CONVERSATIONS TAB ══════════ */}
            {activeTab === "conversations" && (
                <div className="chatbot-tab-content">
                    {/* Search */}
                    <div className="admin-card" style={{ marginBottom: "1rem" }}>
                        <div className="prod-search-wrap">
                            <HiOutlineSearch className="prod-search-icon" />
                            <input
                                type="text"
                                className="prod-search-input"
                                placeholder="Search conversations..."
                                value={searchConv}
                                onChange={e => setSearchConv(e.target.value)}
                            />
                            {searchConv && (
                                <button className="prod-search-clear" onClick={() => setSearchConv("")}>
                                    <HiOutlineX />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Recent Conversations</h3>
                            <span className="admin-card-sub">{filteredConvs.length} messages</span>
                        </div>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>User Message</th>
                                        <th>Detected Intent</th>
                                        <th>Bot Response</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredConvs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="admin-table-empty">
                                                No conversations recorded yet
                                            </td>
                                        </tr>
                                    ) : filteredConvs.map(conv => (
                                        <tr key={conv.id}>
                                            <td className="text-muted conv-time">
                                                <HiOutlineClock className="conv-time-icon" />
                                                {new Date(conv.timestamp).toLocaleString("en-IN", {
                                                    month: "short", day: "numeric",
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </td>
                                            <td>
                                                <span className="conv-user-msg">{conv.userMessage}</span>
                                            </td>
                                            <td>
                                                <span className="conv-intent-pill">
                                                    {INTENT_LABELS[conv.botIntent] || conv.botIntent}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="conv-bot-resp">
                                                    {conv.botResponse?.substring(0, 80)}...
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ FAQs TAB ══════════ */}
            {activeTab === "faqs" && (
                <div className="chatbot-tab-content">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Manage FAQs</h3>
                            <button className="btn btn-primary btn-sm" onClick={openAddFaq}>
                                <HiOutlinePlus /> Add FAQ
                            </button>
                        </div>
                        <div className="faq-list">
                            {faqs.map(faq => (
                                <div className="faq-item" key={faq.id}>
                                    <div className="faq-content">
                                        <div className="faq-question">
                                            <HiOutlineQuestionMarkCircle className="faq-q-icon" />
                                            <strong>{faq.question}</strong>
                                        </div>
                                        <p className="faq-answer">{faq.answer}</p>
                                        <span className="faq-category-pill">{faq.category}</span>
                                    </div>
                                    <div className="faq-actions">
                                        <button className="action-btn primary" onClick={() => openEditFaq(faq)} title="Edit">
                                            <HiOutlinePencil />
                                        </button>
                                        <button className="action-btn danger" onClick={() => deleteFaq(faq.id)} title="Delete">
                                            <HiOutlineTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ PROMOTIONS TAB ══════════ */}
            {activeTab === "promos" && (
                <div className="chatbot-tab-content">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Promotional Messages</h3>
                        </div>
                        <p className="promo-desc">
                            These messages are shown to users as offers and announcements in the chatbot.
                        </p>

                        {/* Add promo */}
                        <div className="promo-add-row">
                            <input
                                type="text"
                                className="modal-input promo-add-input"
                                placeholder="🎉 Enter a promotional message..."
                                value={promoInput}
                                onChange={e => setPromoInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addPromo()}
                            />
                            <button className="btn btn-primary" onClick={addPromo} disabled={!promoInput.trim()}>
                                <HiOutlinePlus /> Add
                            </button>
                        </div>

                        {/* Promo list */}
                        <div className="promo-list">
                            {promos.map((promo, i) => (
                                <div className="promo-item" key={i}>
                                    <span className="promo-text">{promo}</span>
                                    <button className="action-btn danger" onClick={() => deletePromo(i)} title="Remove">
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── FAQ Modal ─────────────────────────────────────────── */}
            {showFaqModal && (
                <div className="modal-overlay" onClick={() => setShowFaqModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingFaq ? "Edit FAQ" : "Add New FAQ"}</h2>
                            <button className="modal-close" onClick={() => setShowFaqModal(false)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-field">
                                <label className="modal-label">Question *</label>
                                <input
                                    className="modal-input"
                                    value={faqForm.question}
                                    onChange={e => setFaqForm(f => ({ ...f, question: e.target.value }))}
                                    placeholder="What is the return policy?"
                                />
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Answer *</label>
                                <textarea
                                    className="modal-input modal-textarea"
                                    value={faqForm.answer}
                                    onChange={e => setFaqForm(f => ({ ...f, answer: e.target.value }))}
                                    placeholder="Enter the answer..."
                                    rows={4}
                                />
                            </div>
                            <div className="modal-field">
                                <label className="modal-label">Category</label>
                                <select
                                    className="modal-input modal-select"
                                    value={faqForm.category}
                                    onChange={e => setFaqForm(f => ({ ...f, category: e.target.value }))}
                                >
                                    <option>General</option>
                                    <option>Orders</option>
                                    <option>Delivery</option>
                                    <option>Payment</option>
                                    <option>Products</option>
                                    <option>Safety</option>
                                    <option>Legal</option>
                                    <option>Returns</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowFaqModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveFaq}>
                                <HiOutlineCheck /> {editingFaq ? "Save Changes" : "Add FAQ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
