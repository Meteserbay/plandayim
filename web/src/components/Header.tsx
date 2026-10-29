import { Link } from "react-router";
import { useAccount } from "../account/AccountContext";

function Header() {
    const { account } = useAccount();

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

                    {account ? (
                        <Link to="/panel" className="header-business-link">
                            Panelim
                        </Link>
                    ) : (
                        <>
                            <Link to="/hesap/giris" className="header-link">
                                Giriş Yap
                            </Link>

                            <Link
                                to="/firmalar-icin"
                                className="header-business-link"
                            >
                                Firmalar İçin
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
