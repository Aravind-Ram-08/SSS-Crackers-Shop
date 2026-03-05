import { createContext, useContext, useState } from "react";
import productsData from "../data/products";

// ── Mock Orders ───────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
    { id: "ORD-2026-0001", customer: { name: "Ravi Kumar", email: "ravi@example.com", phone: "9876543210" }, items: [{ id: 1, name: "Sky Shot 30 Shots", qty: 2, price: 899 }, { id: 5, name: "Sparklers Gold (Box of 50)", qty: 3, price: 149 }], total: 2245, status: "delivered", date: "2026-02-20", paymentId: "pay_P1aXXXXXX", address: "12, Anna Nagar, Chennai, TN - 600040" },
    { id: "ORD-2026-0002", customer: { name: "Priya Sharma", email: "priya@example.com", phone: "9123456780" }, items: [{ id: 10, name: "Diwali Family Combo Pack", qty: 1, price: 1799 }], total: 1799, status: "shipped", date: "2026-02-22", paymentId: "pay_P2bXXXXXX", address: "45, MG Road, Bangalore, KA - 560001" },
    { id: "ORD-2026-0003", customer: { name: "Arun Patel", email: "arun@example.com", phone: "9988776655" }, items: [{ id: 3, name: "Rocket Supreme (Pack of 5)", qty: 4, price: 399 }, { id: 7, name: "1000 Wala Garland", qty: 2, price: 649 }], total: 2894, status: "processing", date: "2026-02-23", paymentId: "pay_P3cXXXXXX", address: "8, Park Street, Kolkata, WB - 700016" },
    { id: "ORD-2026-0004", customer: { name: "Meena Iyer", email: "meena@example.com", phone: "9876001234" }, items: [{ id: 12, name: "Sky Shot 100 Shots Grand", qty: 1, price: 2799 }], total: 2799, status: "pending", date: "2026-02-24", paymentId: "pay_P4dXXXXXX", address: "33, Juhu Beach Rd, Mumbai, MH - 400049" },
    { id: "ORD-2026-0005", customer: { name: "Suresh Nair", email: "suresh@example.com", phone: "9011223344" }, items: [{ id: 9, name: "Multicolor Fountain Supreme", qty: 2, price: 499 }, { id: 4, name: "Flower Pot Fountain (Box of 6)", qty: 3, price: 349 }], total: 2045, status: "delivered", date: "2026-02-21", paymentId: "pay_P5eXXXXXX", address: "19, Civil Lines, Jaipur, RJ - 302006" },
    { id: "ORD-2026-0006", customer: { name: "Kavitha Reddy", email: "kavitha@example.com", phone: "9700112233" }, items: [{ id: 2, name: "Ground Chakkar Deluxe (Box of 10)", qty: 5, price: 249 }, { id: 11, name: "Pencil Sparklers Neon (Box of 20)", qty: 4, price: 139 }], total: 1801, status: "cancelled", date: "2026-02-19", paymentId: "pay_P6fXXXXXX", address: "77, Sector 18, Noida, UP - 201301" },
    { id: "ORD-2026-0007", customer: { name: "Dinesh Babu", email: "dinesh@example.com", phone: "9555867891" }, items: [{ id: 6, name: "Mega Bomb Cracker (Pack of 10)", qty: 3, price: 219 }, { id: 8, name: "Color Smoke Tubes (Pack of 6)", qty: 2, price: 189 }], total: 1035, status: "delivered", date: "2026-02-18", paymentId: "pay_P7gXXXXXX", address: "5, Boat Club Rd, Trichy, TN - 620002" },
    { id: "ORD-2026-0008", customer: { name: "Anita Gupta", email: "anita@example.com", phone: "9312456789" }, items: [{ id: 10, name: "Diwali Family Combo Pack", qty: 2, price: 1799 }, { id: 5, name: "Sparklers Gold (Box of 50)", qty: 5, price: 149 }], total: 4343, status: "shipped", date: "2026-02-25", paymentId: "pay_P8hXXXXXX", address: "102, Connaught Place, Delhi - 110001" },
    { id: "ORD-2026-0009", customer: { name: "Rajesh Menon", email: "rajesh@example.com", phone: "9448123456" }, items: [{ id: 1, name: "Sky Shot 30 Shots", qty: 3, price: 899 }], total: 2697, status: "processing", date: "2026-02-26", paymentId: "pay_P9iXXXXXX", address: "22, MG Marg, Kochi, KL - 682011" },
    { id: "ORD-2026-0010", customer: { name: "Pooja Verma", email: "pooja@example.com", phone: "9667890123" }, items: [{ id: 12, name: "Sky Shot 100 Shots Grand", qty: 1, price: 2799 }, { id: 3, name: "Rocket Supreme (Pack of 5)", qty: 2, price: 399 }], total: 3597, status: "pending", date: "2026-02-27", paymentId: "pay_P0jXXXXXX", address: "6, Race Course Rd, Coimbatore, TN - 641018" },
];

// Revenue by month (last 7 months)
export const REVENUE_DATA = [
    { month: "Aug", revenue: 42500 },
    { month: "Sep", revenue: 67800 },
    { month: "Oct", revenue: 89200 },
    { month: "Nov", revenue: 245000 },
    { month: "Dec", revenue: 312000 },
    { month: "Jan", revenue: 58400 },
    { month: "Feb", revenue: 27255 },
];

const AdminDataContext = createContext();

export function AdminDataProvider({ children }) {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [products, setProducts] = useState(productsData.map(p => ({ ...p })));

    // ── Order actions ─────────────────────────────────────────────────────────
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const deleteOrder = (orderId) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    // ── Product actions ───────────────────────────────────────────────────────
    const addProduct = (product) => {
        const newId = Math.max(...products.map(p => p.id)) + 1;
        setProducts(prev => [{ ...product, id: newId, images: [], isFeatured: false, isBestseller: false, tags: [] }, ...prev]);
    };

    const updateProduct = (id, updated) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    // ── Computed stats ────────────────────────────────────────────────────────
    const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / (totalOrders - cancelledOrders)) : 0;

    return (
        <AdminDataContext.Provider value={{
            orders, products,
            updateOrderStatus, deleteOrder,
            addProduct, updateProduct, deleteProduct,
            stats: { totalRevenue, totalOrders, pendingOrders, deliveredOrders, cancelledOrders, avgOrderValue },
        }}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminData() {
    const ctx = useContext(AdminDataContext);
    if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
    return ctx;
}
