import { useState, useRef, useEffect } from "react";
import {
    HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane,
    HiOutlineTrash, HiOutlineShoppingCart, HiOutlineExternalLink,
} from "react-icons/hi";
import { useChat } from "../../context/ChatContext";
import { formatPrice } from "../../utils/helpers";
import "./ChatBot.css";

// ── Category emoji map ────────────────────────────────────────────────────
const EMOJIS = {
    "one-sound-crackers": "💥", "deluxe-crackers": "🎆", "giant-chorsa": "⚡",
    "bijili-crackers": "🔥", "ground-chakkar": "🌀", "flower-pots": "🌸",
    "garland-bang-crackers": "🧨", "pencil": "✏️", "bombs": "💣",
    "twinkling-star": "⭐", "stone-cartoon": "🎭", "rockets": "🚀",
    "aerial-fancy": "🎇", "special-fountain": "⛲", "repeating-cake": "🎂",
    "fancy-items": "🎁", "sparklers": "✨", "musical-shot": "🎵",
    "special-items": "📦",
};

export default function ChatBot() {
    const {
        messages, isOpen, isTyping, unreadCount,
        sendMessage, handleQuickReply, addProductFromChat, toggleChat, clearChat,
    } = useChat();

    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = (e) => {
        e?.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Render a single message ────────────────────────────────────────────
    const renderMessage = (msg) => {
        const isBot = msg.sender === "bot";

        return (
            <div className={`chat-message ${isBot ? "bot" : "user"} ${msg.isBanner ? "banner" : ""}`} key={msg.id}>
                {isBot && (
                    <div className="chat-avatar">
                        <span>🧨</span>
                    </div>
                )}
                <div className="chat-bubble-wrap">
                    <div className={`chat-bubble ${isBot ? "bot-bubble" : "user-bubble"}`}>
                        {/* Text content with markdown-like formatting */}
                        {msg.text && (
                            <div
                                className="chat-text"
                                dangerouslySetInnerHTML={{
                                    __html: formatChatText(msg.text),
                                }}
                            />
                        )}

                        {/* Product cards */}
                        {msg.products && msg.products.length > 0 && (
                            <div className="chat-products">
                                {msg.products.map((p) => (
                                    <div className="chat-product-card" key={p.id}>
                                        <div className="chat-product-header">
                                            <span className="chat-product-emoji">
                                                {EMOJIS[p.categorySlug] || "🧨"}
                                            </span>
                                            <div className="chat-product-info">
                                                <p className="chat-product-name">{p.name}</p>
                                                <p className="chat-product-cat">{p.category}</p>
                                            </div>
                                        </div>
                                        <div className="chat-product-details">
                                            <span className="chat-product-price">{p.priceFormatted}</span>
                                            <span className="chat-product-box">{p.boxContent}</span>
                                        </div>
                                        {p.isBestseller && (
                                            <span className="chat-product-badge">🔥 Bestseller</span>
                                        )}
                                        <div className="chat-product-actions">
                                            <button
                                                className="chat-product-btn add"
                                                onClick={() => addProductFromChat(p.id)}
                                            >
                                                <HiOutlineShoppingCart /> Add to Cart
                                            </button>
                                            <a
                                                href={`/products/${p.id}`}
                                                className="chat-product-btn view"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <HiOutlineExternalLink /> View
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* WhatsApp button */}
                        {msg.whatsappLink && (
                            <a
                                href={msg.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chat-whatsapp-btn"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Order via WhatsApp
                            </a>
                        )}
                    </div>

                    {/* Quick reply buttons */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="chat-quick-replies">
                            {msg.quickReplies.map((qr, idx) => (
                                <button
                                    key={idx}
                                    className="chat-quick-btn"
                                    onClick={() => handleQuickReply(qr.action)}
                                >
                                    {qr.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <span className="chat-time">
                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* ── Floating Toggle Button ──────────────────────────────── */}
            <button
                className={`chat-toggle-btn ${isOpen ? "chat-toggle-open" : ""}`}
                onClick={toggleChat}
                aria-label="Toggle chat"
                id="chat-toggle"
            >
                {isOpen ? (
                    <HiOutlineX className="chat-toggle-icon" />
                ) : (
                    <>
                        <HiOutlineChat className="chat-toggle-icon" />
                        {unreadCount > 0 && (
                            <span className="chat-unread-badge">{unreadCount}</span>
                        )}
                    </>
                )}
                {!isOpen && <span className="chat-toggle-pulse" />}
            </button>

            {/* ── Chat Window ──────────────────────────────────────────── */}
            <div className={`chat-window ${isOpen ? "chat-window-open" : ""}`} id="chat-window">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <div className="chat-header-avatar">
                            <span>🧨</span>
                            <span className="chat-status-dot" />
                        </div>
                        <div>
                            <h3 className="chat-header-title">SSS Crackers</h3>
                            <p className="chat-header-status">
                                {isTyping ? "Typing..." : "Online — Ask me anything!"}
                            </p>
                        </div>
                    </div>
                    <div className="chat-header-actions">
                        <button
                            className="chat-header-btn"
                            onClick={clearChat}
                            title="Clear chat"
                        >
                            <HiOutlineTrash />
                        </button>
                        <button
                            className="chat-header-btn"
                            onClick={toggleChat}
                            title="Close chat"
                        >
                            <HiOutlineX />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="chat-messages" id="chat-messages">
                    {messages.map(renderMessage)}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="chat-message bot">
                            <div className="chat-avatar">
                                <span>🧨</span>
                            </div>
                            <div className="chat-bubble-wrap">
                                <div className="chat-bubble bot-bubble typing-bubble">
                                    <div className="typing-indicator">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chat-input"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        id="chat-input"
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!input.trim()}
                        aria-label="Send message"
                        id="chat-send"
                    >
                        <HiOutlinePaperAirplane />
                    </button>
                </form>
            </div>
        </>
    );
}

// ── Format text with markdown-like styling ────────────────────────────────
function formatChatText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/\n/g, "<br/>");
}
