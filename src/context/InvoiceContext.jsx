import { createContext, useContext, useState, useCallback } from "react";

const InvoiceContext = createContext();
export const useInvoices = () => useContext(InvoiceContext);

// ── Helpers ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "sss-invoices";
const COUNTER_KEY = "sss-invoice-counter";

function loadInvoices() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveInvoices(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getNextCounter() {
    const counter = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1;
    localStorage.setItem(COUNTER_KEY, String(counter));
    return counter;
}

function generateInvoiceId() {
    const year = new Date().getFullYear();
    const num = getNextCounter();
    return `INV-${year}-${String(num).padStart(3, "0")}`;
}

// ── Shop Details ───────────────────────────────────────────────────────────
export const SHOP_DETAILS = {
    name: "SSS Crackers",
    tagline: "Licensed Fireworks Dealer",
    licenses: [
        "E/SC/TN/24/832 (E55798)",
        "E/SC/TN/SH/62 (E55799)",
    ],
    phone: "+91 97861 94498",
    address: "Sivakasi, Tamil Nadu, India",
    website: "www.ssscrackers.com",
    gst: "33AXXXX1234X1Z5", // placeholder
};

// ── Provider ───────────────────────────────────────────────────────────────
export function InvoiceProvider({ children }) {
    const [invoices, setInvoices] = useState(loadInvoices);

    // Create a new invoice
    const createInvoice = useCallback(
        ({
            orderId,
            paymentId = "",
            customerName,
            phone,
            email = "",
            address,
            city = "",
            state = "",
            pincode = "",
            products,       // [{ name, category, quantity, price, boxContent }]
            subtotal,
            delivery = 0,
            couponCode = "",
            couponDiscount = 0,
            totalAmount,
            paymentMethod = "online", // "online" | "whatsapp"
        }) => {
            const invoiceId = generateInvoiceId();
            const now = new Date().toISOString();

            const invoice = {
                invoiceId,
                orderId: orderId || `ORD-${Date.now()}`,
                paymentId,
                date: now,
                customer: {
                    name: customerName,
                    phone,
                    email,
                    address,
                    city,
                    state,
                    pincode,
                },
                products: products.map((p) => ({
                    name: p.name,
                    category: p.category || "",
                    boxContent: p.boxContent || "",
                    quantity: p.quantity,
                    price: p.price,
                    subtotal: p.price * p.quantity,
                })),
                subtotal,
                delivery,
                couponCode,
                couponDiscount,
                totalAmount,
                paymentMethod,
                shop: SHOP_DETAILS,
            };

            setInvoices((prev) => {
                const next = [invoice, ...prev];
                saveInvoices(next);
                return next;
            });

            return invoice;
        },
        []
    );

    // Get single invoice
    const getInvoice = useCallback(
        (invoiceId) => invoices.find((inv) => inv.invoiceId === invoiceId) || null,
        [invoices]
    );

    // Get invoice by orderId
    const getInvoiceByOrder = useCallback(
        (orderId) => invoices.find((inv) => inv.orderId === orderId) || null,
        [invoices]
    );

    // Delete invoice (admin)
    const deleteInvoice = useCallback(
        (invoiceId) => {
            setInvoices((prev) => {
                const next = prev.filter((inv) => inv.invoiceId !== invoiceId);
                saveInvoices(next);
                return next;
            });
        },
        []
    );

    return (
        <InvoiceContext.Provider
            value={{
                invoices,
                createInvoice,
                getInvoice,
                getInvoiceByOrder,
                deleteInvoice,
            }}
        >
            {children}
        </InvoiceContext.Provider>
    );
}
