import { createContext, useContext, useState, useCallback } from "react";
import { generateResponse, handleQuickAction, getWelcomeMessage, getFestivalBanner } from "../components/chatbot/chatEngine";
import { useCart } from "./CartContext";
import products from "../data/products";

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { cartItems, addToCart } = useCart();

    // Chat state
    const [messages, setMessages] = useState(() => {
        const welcome = getWelcomeMessage();
        const banner = getFestivalBanner();
        return [
            { id: 1, sender: "bot", ...welcome, timestamp: Date.now() },
            { id: 2, sender: "bot", ...banner, timestamp: Date.now() + 100 },
        ];
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(1);

    // Chat log for admin (persisted to localStorage)
    const [chatLog, setChatLog] = useState(() => {
        try {
            const saved = localStorage.getItem("sss-chat-log");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Helper to add a bot message with typing delay
    const addBotMessage = useCallback((response, delay = 800) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now(),
                    sender: "bot",
                    ...response,
                    timestamp: Date.now(),
                },
            ]);
            setIsTyping(false);
            if (!isOpen) {
                setUnreadCount(prev => prev + 1);
            }
        }, delay);
    }, [isOpen]);

    // Log conversation for admin analytics
    const logConversation = useCallback((userMsg, botResponse) => {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userMessage: userMsg,
            botIntent: botResponse.intent || "unknown",
            botResponse: botResponse.text?.substring(0, 200) || "",
        };
        setChatLog(prev => {
            const updated = [...prev, entry].slice(-500); // Keep last 500
            try { localStorage.setItem("sss-chat-log", JSON.stringify(updated)); } catch { }
            return updated;
        });
    }, []);

    // Send a user message
    const sendMessage = useCallback((text) => {
        if (!text.trim()) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            sender: "user",
            text: text.trim(),
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);

        // Generate AI response
        const context = { cartItems, conversationHistory: messages };
        const response = generateResponse(text, context);

        // Log for admin
        logConversation(text, response);

        // Add bot reply with typing effect
        addBotMessage(response);
    }, [cartItems, messages, addBotMessage, logConversation]);

    // Handle quick reply button press
    const handleQuickReply = useCallback((action) => {
        const context = { cartItems, conversationHistory: messages };
        const response = handleQuickAction(action, context);

        // Handle navigation/link actions immediately
        if (response.actions) {
            for (const act of response.actions) {
                if (act.type === "navigate") {
                    window.location.href = act.path;
                    return;
                }
                if (act.type === "open_link") {
                    window.open(act.url, "_blank");
                    return;
                }
            }
        }

        if (response.text) {
            addBotMessage(response, 500);
        }
    }, [cartItems, messages, addBotMessage]);

    // Add product to cart from chatbot
    const addProductFromChat = useCallback((productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            addToCart(product, 1);
            addBotMessage({
                text: `✅ **${product.name}** has been added to your cart!\n\nPrice: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(product.price)}`,
                quickReplies: [
                    { label: "🛒 View Cart", action: "show_cart" },
                    { label: "🛍️ Continue Shopping", action: "browse_products" },
                    { label: "✅ Checkout", action: "checkout" },
                ],
            }, 400);
        }
    }, [addToCart, addBotMessage]);

    // Toggle chat open/close
    const toggleChat = useCallback(() => {
        setIsOpen(prev => {
            if (!prev) setUnreadCount(0);
            return !prev;
        });
    }, []);

    // Clear chat
    const clearChat = useCallback(() => {
        const welcome = getWelcomeMessage();
        setMessages([
            { id: Date.now(), sender: "bot", ...welcome, timestamp: Date.now() },
        ]);
    }, []);

    // Admin: Get chat analytics
    const getChatAnalytics = useCallback(() => {
        const intents = {};
        const queries = {};
        chatLog.forEach(entry => {
            intents[entry.botIntent] = (intents[entry.botIntent] || 0) + 1;
            const q = entry.userMessage?.toLowerCase().trim();
            if (q) queries[q] = (queries[q] || 0) + 1;
        });

        const topIntents = Object.entries(intents)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const topQueries = Object.entries(queries)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        return {
            totalConversations: chatLog.length,
            topIntents,
            topQueries,
            recentChats: chatLog.slice(-20).reverse(),
        };
    }, [chatLog]);

    return (
        <ChatContext.Provider value={{
            messages,
            isOpen,
            isTyping,
            unreadCount,
            sendMessage,
            handleQuickReply,
            addProductFromChat,
            toggleChat,
            clearChat,
            chatLog,
            getChatAnalytics,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within ChatProvider");
    return ctx;
}
