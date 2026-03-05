import { createContext, useContext, useState } from "react";

// ── Order status stages ─────────────────────────────────────────────────────
export const ORDER_STAGES = [
    { key: "order_received", label: "Order Received", icon: "📋", desc: "We have received your order" },
    { key: "confirmed", label: "Order Confirmed", icon: "✅", desc: "Your order has been confirmed" },
    { key: "packed", label: "Packed", icon: "📦", desc: "Your order is packed and ready" },
    { key: "shipped", label: "Shipped", icon: "🚚", desc: "Your order is on its way" },
    { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵", desc: "Out for delivery in your area" },
    { key: "delivered", label: "Delivered", icon: "🎉", desc: "Order delivered successfully" },
];

// Map from admin status → tracking stage index
export const STATUS_TO_STAGE = {
    pending: 0, // order_received
    processing: 1, // confirmed
    packed: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
    cancelled: -1,
};

// ── Seed tracking updates helper ──────────────────────────────────────────
function buildTrackingHistory(status, orderDate) {
    const stageIndex = STATUS_TO_STAGE[status] ?? 0;
    const base = new Date(orderDate);
    const updates = [];

    for (let i = 0; i <= Math.min(stageIndex, ORDER_STAGES.length - 1); i++) {
        const ts = new Date(base);
        ts.setHours(ts.getHours() + i * 6);
        updates.push({
            stage: ORDER_STAGES[i].key,
            label: ORDER_STAGES[i].label,
            message: ORDER_STAGES[i].desc,
            timestamp: ts.toISOString(),
        });
    }
    return updates;
}

// ── Seed orders with tracking data ───────────────────────────────────────
const SEED_ORDERS = [
    {
        orderId: "ORD-2026-0001",
        customerName: "Ravi Kumar",
        phone: "9876543210",
        email: "ravi@example.com",
        address: "12, Anna Nagar, Chennai, TN - 600040",
        products: [
            { name: "Sky Shot 30 Shots", qty: 2, price: 899 },
            { name: "Sparklers Gold (Box of 50)", qty: 3, price: 149 },
        ],
        totalAmount: 2245,
        orderStatus: "delivered",
        paymentId: "pay_P1aXXXXXX",
        createdAt: "2026-02-20T10:00:00.000Z",
    },
    {
        orderId: "ORD-2026-0002",
        customerName: "Priya Sharma",
        phone: "9123456780",
        email: "priya@example.com",
        address: "45, MG Road, Bangalore, KA - 560001",
        products: [
            { name: "Diwali Family Combo Pack", qty: 1, price: 1799 },
        ],
        totalAmount: 1799,
        orderStatus: "shipped",
        paymentId: "pay_P2bXXXXXX",
        createdAt: "2026-02-22T11:30:00.000Z",
    },
    {
        orderId: "ORD-2026-0003",
        customerName: "Arun Patel",
        phone: "9988776655",
        email: "arun@example.com",
        address: "8, Park Street, Kolkata, WB - 700016",
        products: [
            { name: "Rocket Supreme (Pack of 5)", qty: 4, price: 399 },
            { name: "1000 Wala Garland", qty: 2, price: 649 },
        ],
        totalAmount: 2894,
        orderStatus: "processing",
        paymentId: "pay_P3cXXXXXX",
        createdAt: "2026-02-23T09:15:00.000Z",
    },
    {
        orderId: "ORD-2026-0004",
        customerName: "Meena Iyer",
        phone: "9876001234",
        email: "meena@example.com",
        address: "33, Juhu Beach Rd, Mumbai, MH - 400049",
        products: [
            { name: "Sky Shot 100 Shots Grand", qty: 1, price: 2799 },
        ],
        totalAmount: 2799,
        orderStatus: "pending",
        paymentId: "pay_P4dXXXXXX",
        createdAt: "2026-02-24T14:20:00.000Z",
    },
    {
        orderId: "ORD-2026-0005",
        customerName: "Suresh Nair",
        phone: "9011223344",
        email: "suresh@example.com",
        address: "19, Civil Lines, Jaipur, RJ - 302006",
        products: [
            { name: "Multicolor Fountain Supreme", qty: 2, price: 499 },
            { name: "Flower Pot Fountain (Box of 6)", qty: 3, price: 349 },
        ],
        totalAmount: 2045,
        orderStatus: "delivered",
        paymentId: "pay_P5eXXXXXX",
        createdAt: "2026-02-21T08:00:00.000Z",
    },
    {
        orderId: "ORD-2026-0006",
        customerName: "Kavitha Reddy",
        phone: "9700112233",
        email: "kavitha@example.com",
        address: "77, Sector 18, Noida, UP - 201301",
        products: [
            { name: "Ground Chakkar Deluxe (Box of 10)", qty: 5, price: 249 },
            { name: "Pencil Sparklers Neon (Box of 20)", qty: 4, price: 139 },
        ],
        totalAmount: 1801,
        orderStatus: "cancelled",
        paymentId: "pay_P6fXXXXXX",
        createdAt: "2026-02-19T16:45:00.000Z",
    },
    {
        orderId: "ORD-2026-0007",
        customerName: "Dinesh Babu",
        phone: "9555867891",
        email: "dinesh@example.com",
        address: "5, Boat Club Rd, Trichy, TN - 620002",
        products: [
            { name: "Mega Bomb Cracker (Pack of 10)", qty: 3, price: 219 },
            { name: "Color Smoke Tubes (Pack of 6)", qty: 2, price: 189 },
        ],
        totalAmount: 1035,
        orderStatus: "delivered",
        paymentId: "pay_P7gXXXXXX",
        createdAt: "2026-02-18T12:00:00.000Z",
    },
    {
        orderId: "ORD-2026-0008",
        customerName: "Anita Gupta",
        phone: "9312456789",
        email: "anita@example.com",
        address: "102, Connaught Place, Delhi - 110001",
        products: [
            { name: "Diwali Family Combo Pack", qty: 2, price: 1799 },
            { name: "Sparklers Gold (Box of 50)", qty: 5, price: 149 },
        ],
        totalAmount: 4343,
        orderStatus: "shipped",
        paymentId: "pay_P8hXXXXXX",
        createdAt: "2026-02-25T17:10:00.000Z",
    },
    {
        orderId: "ORD-2026-0009",
        customerName: "Rajesh Menon",
        phone: "9448123456",
        email: "rajesh@example.com",
        address: "22, MG Marg, Kochi, KL - 682011",
        products: [
            { name: "Sky Shot 30 Shots", qty: 3, price: 899 },
        ],
        totalAmount: 2697,
        orderStatus: "processing",
        paymentId: "pay_P9iXXXXXX",
        createdAt: "2026-02-26T13:40:00.000Z",
    },
    {
        orderId: "ORD-2026-0010",
        customerName: "Pooja Verma",
        phone: "9667890123",
        email: "pooja@example.com",
        address: "6, Race Course Rd, Coimbatore, TN - 641018",
        products: [
            { name: "Sky Shot 100 Shots Grand", qty: 1, price: 2799 },
            { name: "Rocket Supreme (Pack of 5)", qty: 2, price: 399 },
        ],
        totalAmount: 3597,
        orderStatus: "pending",
        paymentId: "pay_P0jXXXXXX",
        createdAt: "2026-02-27T10:05:00.000Z",
    },
];

// Attach tracking history to each seed order
const INITIAL_ORDERS = SEED_ORDERS.map(o => ({
    ...o,
    trackingUpdates: buildTrackingHistory(o.orderStatus, o.createdAt),
}));

// ─────────────────────────────────────────────────────────────────────────────
const OrderTrackingContext = createContext();

export function OrderTrackingProvider({ children }) {
    const [trackingOrders, setTrackingOrders] = useState(INITIAL_ORDERS);

    // Find order by ID + phone (customer-facing lookup)
    const findOrder = (orderId, phone) => {
        const id = orderId.trim().toUpperCase();
        const ph = phone.trim().replace(/\D/g, "");
        return trackingOrders.find(
            o =>
                o.orderId.toUpperCase() === id &&
                o.phone.replace(/\D/g, "") === ph
        ) || null;
    };

    // Update order status (used by both admin and internally)
    const updateTrackingStatus = (orderId, newStatus) => {
        setTrackingOrders(prev =>
            prev.map(o => {
                if (o.orderId !== orderId) return o;
                const stageIndex = STATUS_TO_STAGE[newStatus] ?? 0;
                const newHistory = buildTrackingHistory(newStatus, o.createdAt);
                // If advancing, add new update with current timestamp
                if (newStatus !== "cancelled") {
                    const now = new Date().toISOString();
                    if (
                        newHistory.length > 0 &&
                        stageIndex >= 0
                    ) {
                        newHistory[newHistory.length - 1].timestamp = now;
                    }
                }
                return {
                    ...o,
                    orderStatus: newStatus,
                    trackingUpdates: newHistory,
                };
            })
        );
    };

    // Add a brand-new order (called from checkout flow if wired up)
    const addTrackingOrder = (order) => {
        const newOrder = {
            ...order,
            trackingUpdates: buildTrackingHistory("pending", order.createdAt || new Date().toISOString()),
        };
        setTrackingOrders(prev => [newOrder, ...prev]);
    };

    return (
        <OrderTrackingContext.Provider value={{
            trackingOrders,
            findOrder,
            updateTrackingStatus,
            addTrackingOrder,
        }}>
            {children}
        </OrderTrackingContext.Provider>
    );
}

export function useOrderTracking() {
    const ctx = useContext(OrderTrackingContext);
    if (!ctx) throw new Error("useOrderTracking must be used within OrderTrackingProvider");
    return ctx;
}
