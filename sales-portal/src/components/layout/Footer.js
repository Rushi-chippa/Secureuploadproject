import { Link } from 'react-router-dom';
import './Layout.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <span className="footer-logo">🏢 SalesPortal</span>
                    <span className="footer-copyright">
                        © {currentYear} All Rights Reserved
                    </span>
                </div>

                <div className="footer-center">
                    <span className="footer-version">Version 1.0.1</span>
                </div>

                <div className="footer-right">
                    <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                    <span className="footer-divider">|</span>
                    <Link to="/terms" className="footer-link">Terms of Service</Link>
                    <span className="footer-divider">|</span>
                    <Link to="/contact" className="footer-link">Contact Us</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;