import { useParams, Link, useNavigate } from "react-router-dom";
import {
    HiOutlineDownload,
    HiOutlinePrinter,
    HiOutlineChevronLeft,
    HiOutlineShare,
} from "react-icons/hi";
import { useInvoices, SHOP_DETAILS } from "../../context/InvoiceContext";
import { formatPrice } from "../../utils/helpers";
import { buildWhatsAppURL } from "../../utils/whatsapp";
import "./InvoicePage.css";

export default function InvoicePage() {
    const { invoiceId } = useParams();
    const { getInvoice } = useInvoices();
    const navigate = useNavigate();

    const invoice = getInvoice(invoiceId);

    if (!invoice) {
        return (
            <div className="inv-not-found">
                <span className="inv-not-found-icon">🧾</span>
                <h2>Invoice Not Found</h2>
                <p>The invoice <code>{invoiceId}</code> could not be found.</p>
                <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
        );
    }

    const date = new Date(invoice.date);
    const formattedDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const handlePrint = () => {
        window.print();
    };

    const handleShareWhatsApp = () => {
        const msg = `🧾 *Invoice from SSS Crackers*\n\n` +
            `Invoice: ${invoice.invoiceId}\n` +
            `Order: ${invoice.orderId}\n` +
            `Date: ${formattedDate}\n` +
            `Amount: ${formatPrice(invoice.totalAmount)}\n\n` +
            `Thank you for choosing SSS Crackers! 🎆\n` +
            `View your invoice on our website.`;
        window.open(buildWhatsAppURL(msg), "_blank", "noopener,noreferrer");
    };

    return (
        <div className="inv-page">
            {/* Actions bar (hidden on print) */}
            <div className="inv-actions-bar no-print">
                <Link to="/" className="breadcrumb-back">
                    <HiOutlineChevronLeft /> Back to Home
                </Link>
                <div className="inv-actions">
                    <button className="inv-action-btn" onClick={handlePrint} id="print-invoice-btn">
                        <HiOutlinePrinter /> Print / Save PDF
                    </button>
                    <button className="inv-action-btn inv-action-wa" onClick={handleShareWhatsApp} id="share-invoice-btn">
                        <HiOutlineShare /> Share via WhatsApp
                    </button>
                </div>
            </div>

            {/* Invoice document */}
            <div className="inv-document" id="invoice-document">
                {/* Header */}
                <div className="inv-doc-header">
                    <div className="inv-doc-brand">
                        <h1 className="inv-doc-logo">🎆 SSS Crackers</h1>
                        <p className="inv-doc-tagline">{SHOP_DETAILS.tagline}</p>
                        <div className="inv-doc-licenses">
                            {SHOP_DETAILS.licenses.map((lic, i) => (
                                <span key={i} className="inv-license-tag">{lic}</span>
                            ))}
                        </div>
                    </div>
                    <div className="inv-doc-invoice-info">
                        <h2 className="inv-doc-invoice-title">INVOICE</h2>
                        <div className="inv-doc-meta">
                            <div className="inv-meta-row">
                                <span>Invoice No.</span>
                                <strong>{invoice.invoiceId}</strong>
                            </div>
                            <div className="inv-meta-row">
                                <span>Order ID</span>
                                <strong>{invoice.orderId}</strong>
                            </div>
                            <div className="inv-meta-row">
                                <span>Date</span>
                                <strong>{formattedDate}</strong>
                            </div>
                            <div className="inv-meta-row">
                                <span>Time</span>
                                <strong>{formattedTime}</strong>
                            </div>
                            {invoice.paymentId && (
                                <div className="inv-meta-row">
                                    <span>Payment ID</span>
                                    <strong className="inv-payment-id">{invoice.paymentId}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="inv-doc-divider" />

                {/* Customer + Shop Details */}
                <div className="inv-doc-parties">
                    <div className="inv-doc-party">
                        <h4 className="inv-party-label">Bill To</h4>
                        <p className="inv-party-name">{invoice.customer.name}</p>
                        {invoice.customer.phone && (
                            <p className="inv-party-detail">📞 {invoice.customer.phone}</p>
                        )}
                        {invoice.customer.email && (
                            <p className="inv-party-detail">✉️ {invoice.customer.email}</p>
                        )}
                        {invoice.customer.address && (
                            <p className="inv-party-detail">
                                📍 {invoice.customer.address}
                                {invoice.customer.city && `, ${invoice.customer.city}`}
                                {invoice.customer.state && `, ${invoice.customer.state}`}
                                {invoice.customer.pincode && ` - ${invoice.customer.pincode}`}
                            </p>
                        )}
                    </div>
                    <div className="inv-doc-party">
                        <h4 className="inv-party-label">From</h4>
                        <p className="inv-party-name">{SHOP_DETAILS.name}</p>
                        <p className="inv-party-detail">📞 {SHOP_DETAILS.phone}</p>
                        <p className="inv-party-detail">📍 {SHOP_DETAILS.address}</p>
                        <p className="inv-party-detail">🌐 {SHOP_DETAILS.website}</p>
                    </div>
                </div>

                <div className="inv-doc-divider" />

                {/* Products Table */}
                <table className="inv-doc-table">
                    <thead>
                        <tr>
                            <th className="inv-th-sno">#</th>
                            <th className="inv-th-product">Product</th>
                            <th className="inv-th-cat">Category</th>
                            <th className="inv-th-qty">Qty</th>
                            <th className="inv-th-price">Price</th>
                            <th className="inv-th-subtotal">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.products.map((item, i) => (
                            <tr key={i}>
                                <td className="inv-td-sno">{i + 1}</td>
                                <td className="inv-td-product">
                                    <span className="inv-product-name">{item.name}</span>
                                    {item.boxContent && (
                                        <span className="inv-product-box">{item.boxContent}</span>
                                    )}
                                </td>
                                <td className="inv-td-cat">{item.category}</td>
                                <td className="inv-td-qty">{item.quantity}</td>
                                <td className="inv-td-price">{formatPrice(item.price)}</td>
                                <td className="inv-td-subtotal">{formatPrice(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="inv-doc-totals">
                    <div className="inv-totals-spacer" />
                    <div className="inv-totals-block">
                        <div className="inv-total-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(invoice.subtotal)}</span>
                        </div>
                        <div className="inv-total-row">
                            <span>Delivery</span>
                            <span>{invoice.delivery === 0 ? "FREE" : formatPrice(invoice.delivery)}</span>
                        </div>
                        {invoice.couponDiscount > 0 && (
                            <div className="inv-total-row inv-discount-row">
                                <span>Coupon ({invoice.couponCode})</span>
                                <span>−{formatPrice(invoice.couponDiscount)}</span>
                            </div>
                        )}
                        <div className="inv-total-row inv-grand-total">
                            <span>Grand Total</span>
                            <span>{formatPrice(invoice.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="inv-doc-divider" />

                {/* Payment method */}
                <div className="inv-doc-payment-method">
                    <span className="inv-pm-label">Payment Method:</span>
                    <span className="inv-pm-value">
                        {invoice.paymentMethod === "online" ? "💳 Online (Razorpay)" : "📱 WhatsApp Order"}
                    </span>
                </div>

                {/* Footer */}
                <div className="inv-doc-footer">
                    <div className="inv-footer-thanks">
                        Thank you for choosing SSS Crackers! 🎆
                    </div>
                    <p className="inv-footer-legal">
                        This is a computer-generated invoice and does not require a physical signature.
                        As per Supreme Court guidelines, firecrackers are sold only through licensed retail
                        channels. This invoice serves as a record of your order enquiry and purchase.
                    </p>
                    <div className="inv-footer-contact">
                        <span>{SHOP_DETAILS.phone}</span>
                        <span>•</span>
                        <span>{SHOP_DETAILS.website}</span>
                        <span>•</span>
                        <span>{SHOP_DETAILS.address}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
