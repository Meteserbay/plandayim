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
                        <Link to="/firmalar-icin">İşletmeni Ekle</Link>
                        <Link to="/hesap/giris">Firma Girişi</Link>
                        <Link to="/hesap/kayit">Hesap Oluştur</Link>
                    </div>

                    <div>
                        <strong>Yasal</strong>
                        <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
                        <Link to="/gizlilik">Gizlilik ve Çerezler</Link>
                        <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
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