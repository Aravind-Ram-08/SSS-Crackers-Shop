// ═══════════════════════════════════════════════════════════════════════════════
// SSS Crackers — WhatsApp Order Utility
// Generates formatted order messages and WhatsApp click-to-chat links
// ═══════════════════════════════════════════════════════════════════════════════

// Default store WhatsApp number (admins can override via localStorage)
const DEFAULT_PHONE = "919876543210";

export function getWhatsAppNumber() {
    try {
        return localStorage.getItem("sss-wa-number") || DEFAULT_PHONE;
    } catch {
        return DEFAULT_PHONE;
    }
}

export function setWhatsAppNumber(number) {
    try {
        localStorage.setItem("sss-wa-number", number);
    } catch { }
}

/**
 * Format price in Indian Rupees
 */
function fmtPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Generate a complete WhatsApp order message from cart + customer info
 * @param {Object} params
 * @param {Array}  params.cartItems  — array of { name, quantity, price, boxContent }
 * @param {Object} params.customer   — { name, phone, address }
 * @param {number} params.delivery   — delivery charge
 * @returns {string} formatted order message
 */
export function generateOrderMessage({ cartItems = [], customer = {}, delivery = 0 }) {
    const lines = [];
    const timestamp = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    lines.push("🧨 *SSS Crackers — Order Enquiry*");
    lines.push(`📅 ${timestamp}`);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("*Customer Details:*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");

    if (customer.name) lines.push(`👤 Name: ${customer.name}`);
    if (customer.phone) lines.push(`📱 Phone: ${customer.phone}`);
    if (customer.address) lines.push(`📍 Address: ${customer.address}`);

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("*Order Details:*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");

    let subtotal = 0;
    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        lines.push(
            `${index + 1}. *${item.name}*`
        );
        lines.push(
            `   ${item.quantity} × ${fmtPrice(item.price)} = ${fmtPrice(itemTotal)}`
        );
        if (item.boxContent) {
            lines.push(`   📦 ${item.boxContent}`);
        }
        lines.push("");
    });

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push(`Subtotal: ${fmtPrice(subtotal)}`);
    if (delivery > 0) {
        lines.push(`Delivery: ${fmtPrice(delivery)}`);
    } else {
        lines.push("Delivery: FREE 🚚");
    }
    lines.push(`*Total Amount: ${fmtPrice(subtotal + delivery)}*`);
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("Please confirm availability and payment details. 🙏");
    lines.push("");
    lines.push("_Sent via SSS Crackers Website_");

    return lines.join("\n");
}

/**
 * Generate a simple enquiry message (no cart)
 */
export function generateSimpleEnquiry(customer = {}) {
    const lines = [];
    lines.push("🧨 *SSS Crackers — General Enquiry*");
    lines.push("");
    if (customer.name) lines.push(`👤 Name: ${customer.name}`);
    if (customer.phone) lines.push(`📱 Phone: ${customer.phone}`);
    lines.push("");
    lines.push("I'd like to enquire about your products. Please share the latest catalogue and prices.");
    lines.push("");
    lines.push("🙏 Thank you!");
    return lines.join("\n");
}

/**
 * Build click-to-chat WhatsApp URL
 */
export function buildWhatsAppURL(message) {
    const phone = getWhatsAppNumber();
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp with the given message
 */
export function openWhatsApp(message) {
    const url = buildWhatsAppURL(message);
    window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Generate and open WhatsApp with order
 */
export function sendOrderViaWhatsApp({ cartItems, customer, delivery }) {
    const message = generateOrderMessage({ cartItems, customer, delivery });
    openWhatsApp(message);
    // Log the enquiry
    logEnquiry({ cartItems, customer, delivery, message });
    return message;
}

/**
 * Log enquiry to localStorage for admin viewing
 */
export function logEnquiry({ cartItems, customer, delivery, message }) {
    try {
        const saved = localStorage.getItem("sss-enquiries");
        const enquiries = saved ? JSON.parse(saved) : [];
        const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
        enquiries.push({
            id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            customer: { ...customer },
            items: cartItems.map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                boxContent: i.boxContent || "",
            })),
            subtotal,
            delivery,
            total: subtotal + delivery,
            message,
            status: "new",
        });
        localStorage.setItem("sss-enquiries", JSON.stringify(enquiries.slice(-200)));
    } catch { }
}

/**
 * Get all enquiries from localStorage
 */
export function getEnquiries() {
    try {
        const saved = localStorage.getItem("sss-enquiries");
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

/**
 * Update an enquiry's status
 */
export function updateEnquiryStatus(id, status) {
    try {
        const enquiries = getEnquiries();
        const updated = enquiries.map(e =>
            e.id === id ? { ...e, status } : e
        );
        localStorage.setItem("sss-enquiries", JSON.stringify(updated));
        return updated;
    } catch {
        return [];
    }
}

/**
 * Delete an enquiry
 */
export function deleteEnquiry(id) {
    try {
        const enquiries = getEnquiries().filter(e => e.id !== id);
        localStorage.setItem("sss-enquiries", JSON.stringify(enquiries));
        return enquiries;
    } catch {
        return [];
    }
}

/**
 * Export enquiries as CSV text
 */
export function exportEnquiriesCSV() {
    const enquiries = getEnquiries();
    if (enquiries.length === 0) return "";

    const header = "Enquiry ID,Date,Customer Name,Phone,Address,Items,Subtotal,Delivery,Total,Status\n";
    const rows = enquiries.map(e => {
        const date = new Date(e.timestamp).toLocaleDateString("en-IN");
        const items = e.items.map(i => `${i.name} x${i.quantity}`).join(" | ");
        return `${e.id},${date},"${e.customer?.name || ""}","${e.customer?.phone || ""}","${e.customer?.address || ""}","${items}",${e.subtotal},${e.delivery},${e.total},${e.status}`;
    });
    return header + rows.join("\n");
}

/**
 * Download enquiries as CSV file
 */
export function downloadEnquiriesCSV() {
    const csv = exportEnquiriesCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sss-crackers-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
