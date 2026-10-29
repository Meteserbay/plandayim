import { Link } from "react-router";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div>
                    <Link to="/" className="footer-brand">
                        Plandayım
                    </Link>

                    <p className="footer-description">
                        Organizasyon hizmetlerini tek yerde keşfet,
                        sana uygun işletmelerle kolayca iletişime geç.
                    </p>
                </div>

                <div className="footer-links">
                    <div>
                        <strong>Keşfet</strong>
                        <Link to="/">Hizmetler</Link>
                        <a href="/#how-it-works">Nasıl Çalışır?</a>
                    </div>

                    <div>
                        <strong>İşletmeler</strong>
                        <a href="/#businesses">Firmalar İçin</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} Plandayım
            </div>
        </footer>
    );
}

export default Footer;