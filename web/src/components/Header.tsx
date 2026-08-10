import { Link } from "react-router";

function Header() {
    return (
        <header className="site-header">
            <div className="header-inner">
                <Link to="/" className="brand">
                    Plandayım
                </Link>

                <nav className="header-nav">
                    <Link to="/" className="header-link">
                        Hizmet Bul
                    </Link>

                    <a href="/#how-it-works" className="header-link">
                        Nasıl Çalışır?
                    </a>

                    <a href="/#businesses" className="header-business-link">
                        Firmalar İçin
                    </a>
                </nav>
            </div>
        </header>
    );
}

export default Header;