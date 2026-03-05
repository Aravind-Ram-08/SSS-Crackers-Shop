import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AdminDataProvider } from "./context/AdminDataContext";
import { CouponProvider } from "./context/CouponContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { ChatProvider } from "./context/ChatContext";
import { OrderTrackingProvider } from "./context/OrderTrackingContext";
import { FestivalProvider } from "./context/FestivalContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Account layout + sub-pages
import AccountLayout from "./pages/account/AccountLayout";
import AccountProfile from "./pages/account/AccountProfile";
import AccountOrders from "./pages/account/AccountOrders";
import AccountEstimates from "./pages/account/AccountEstimates";
import AccountWishlist from "./pages/account/AccountWishlist";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountNotifications from "./pages/account/AccountNotifications";
import AccountLoyalty from "./pages/account/AccountLoyalty";
import AccountReferral from "./pages/account/AccountReferral";

// Customer layout & pages
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import FestivalCountdown from "./components/common/FestivalCountdown";
import MobileBottomNav from "./components/common/MobileBottomNav";
import WhatsAppFloat from "./components/common/WhatsAppFloat";
import ChatBot from "./components/chatbot/ChatBot";
import HomePage from "./pages/customer/HomePage";
import ProductsPage from "./pages/customer/ProductsPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import WhatsAppCheckout from "./pages/customer/WhatsAppCheckout";
import InvoicePage from "./pages/customer/InvoicePage";
import TrackOrderPage from "./pages/customer/TrackOrderPage";

// Admin layout & pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminChatbot from "./pages/admin/AdminChatbot";
import AdminEnquiries from "./pages/admin/AdminEnquiries";
import AdminOrderTracking from "./pages/admin/AdminOrderTracking";
import AdminFestivalOffers from "./pages/admin/AdminFestivalOffers";

// ── Protected Route guard ─────────────────────────────────────────────────
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    return children;
}

// ── Customer shell (Navbar + Footer + FestivalCountdown) ──────────────────
function CustomerShell({ children }) {
    return (
        <div className="page-wrapper">
            <FestivalCountdown />
            <Navbar />
            <main className="page-content">{children}</main>
            <Footer />
            <MobileBottomNav />
            <WhatsAppFloat />
            <ChatBot />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <FestivalProvider>
                <OrderTrackingProvider>
                    <CartProvider>
                        <CouponProvider>
                            <InvoiceProvider>
                                <AdminDataProvider>
                                    <Router>
                                        <ChatProvider>
                                            <Routes>

                                                {/* ── Auth (no Navbar/Footer) ── */}
                                                <Route path="/login" element={<LoginPage />} />
                                                <Route path="/signup" element={<SignupPage />} />

                                                {/* ── Account (protected, with Navbar) ── */}
                                                <Route
                                                    path="/account"
                                                    element={
                                                        <ProtectedRoute>
                                                            <div className="page-wrapper">
                                                                <FestivalCountdown />
                                                                <Navbar />
                                                                <AccountLayout />
                                                                <WhatsAppFloat />
                                                            </div>
                                                        </ProtectedRoute>
                                                    }
                                                >
                                                    <Route index element={<AccountProfile />} />
                                                    <Route path="orders" element={<AccountOrders />} />
                                                    <Route path="estimates" element={<AccountEstimates />} />
                                                    <Route path="wishlist" element={<AccountWishlist />} />
                                                    <Route path="addresses" element={<AccountAddresses />} />
                                                    <Route path="notifications" element={<AccountNotifications />} />
                                                    <Route path="loyalty" element={<AccountLoyalty />} />
                                                    <Route path="referral" element={<AccountReferral />} />
                                                </Route>

                                                {/* ── Admin ── */}
                                                <Route path="/admin" element={<AdminLayout />}>
                                                    <Route index element={<AdminDashboard />} />
                                                    <Route path="products" element={<AdminProducts />} />
                                                    <Route path="orders" element={<AdminOrders />} />
                                                    <Route path="coupons" element={<AdminCoupons />} />
                                                    <Route path="invoices" element={<AdminInvoices />} />
                                                    <Route path="chatbot" element={<AdminChatbot />} />
                                                    <Route path="enquiries" element={<AdminEnquiries />} />
                                                    <Route path="order-tracking" element={<AdminOrderTracking />} />
                                                    <Route path="festival-offers" element={<AdminFestivalOffers />} />
                                                </Route>

                                                {/* ── Customer ── */}
                                                <Route path="/*" element={
                                                    <CustomerShell>
                                                        <Routes>
                                                            <Route path="/" element={<HomePage />} />
                                                            <Route path="/products" element={<ProductsPage />} />
                                                            <Route path="/products/:id" element={<ProductDetailPage />} />
                                                            <Route path="/cart" element={<CartPage />} />
                                                            <Route path="/checkout" element={<CheckoutPage />} />
                                                            <Route path="/whatsapp-order" element={<WhatsAppCheckout />} />
                                                            <Route path="/invoice/:invoiceId" element={<InvoicePage />} />
                                                            <Route path="/track-order" element={<TrackOrderPage />} />
                                                        </Routes>
                                                    </CustomerShell>
                                                } />

                                            </Routes>
                                        </ChatProvider>
                                    </Router>
                                </AdminDataProvider>
                            </InvoiceProvider>
                        </CouponProvider>
                    </CartProvider>
                </OrderTrackingProvider>
            </FestivalProvider>
        </AuthProvider>
    );
}

export default App;
