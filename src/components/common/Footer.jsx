import { Link } from "react-router-dom";
import {
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineShieldCheck,
} from "react-icons/hi";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-glow" />
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-icon">🧨</span>
                            <span className="logo-text">
                                SSS<span className="logo-highlight"> Crackers</span>
                            </span>
                        </Link>
                        <p className="footer-tagline">
                            Light up your celebrations with premium quality crackers. Trusted
                            by thousands of families across India.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/products">All Products</Link>
                            </li>
                            <li>
                                <Link to="/products?category=special-items">Special Items</Link>
                            </li>
                            <li>
                                <Link to="/cart">My Cart</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Categories</h4>
                        <ul className="footer-links">
                            <li>
                                <Link to="/products?category=aerial-fancy">Aerial Fancy</Link>
                            </li>
                            <li>
                                <Link to="/products?category=rockets">Rockets</Link>
                            </li>
                            <li>
                                <Link to="/products?category=sparklers">Sparklers</Link>
                            </li>
                            <li>
                                <Link to="/products?category=special-fountain">Special Fountain</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <HiOutlineLocationMarker className="contact-icon" />
                                <span>Sivakasi, Tamil Nadu, India</span>
                            </li>
                            <li>
                                <HiOutlinePhone className="contact-icon" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li>
                                <HiOutlineMail className="contact-icon" />
                                <span>hello@crackershub.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ── Legal Disclaimer ─────────────────────────────── */}
                <div className="footer-legal">
                    <div className="footer-legal-header">
                        <HiOutlineShieldCheck className="footer-legal-icon" />
                        <h4 className="footer-legal-title">Legal Disclaimer</h4>
                    </div>
                    <p className="footer-legal-text">
                        As per the Supreme Court of India order dated 23 October 2018 in the case
                        of <strong>Arjun Gopal vs Union of India</strong>, online sale of firecrackers through
                        e-commerce platforms is not permitted. This website is intended only for displaying
                        product information and facilitating customer enquiries. Orders, if any, are processed
                        through licensed retail channels in compliance with applicable laws. SSS Crackers follows
                        100% legal and statutory compliances under the <strong>Explosives Act</strong> and related
                        regulations. All our shops and storage facilities are maintained as per government safety standards.
                    </p>
                    <div className="footer-license">
                        <span className="footer-license-label">Explosives License Numbers:</span>
                        <div className="footer-license-numbers">
                            <span className="footer-license-badge">E/SC/TN/24/832 (E55798)</span>
                            <span className="footer-license-badge">E/SC/TN/SH/62 (E55799)</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 SSS Crackers. All Rights Reserved.</p>
                    <p className="footer-credit">Made with 🧡 in India</p>
                </div>
            </div>
        </footer>
    );
}
