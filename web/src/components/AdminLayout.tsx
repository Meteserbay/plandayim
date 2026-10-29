import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { UnauthorizedError, adminLogout, getAdminSession } from "../api/admin";

// Admin sayfalarının ortak başlığı ve menüsü. Oturum yoksa giriş
// sayfasına yönlendirir.
function AdminLayout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const [adminEmail, setAdminEmail] = useState("");

    useEffect(() => {
        getAdminSession()
            .then((session) => setAdminEmail(session.email))
            .catch((error) => {
                if (error instanceof UnauthorizedError) {
                    navigate("/admin/giris", { replace: true });
                } else {
                    console.error(error);
                }
            });
    }, [navigate]);

    async function handleLogout() {
        try {
            await adminLogout();
        } finally {
            navigate("/admin/giris", { replace: true });
        }
    }

    const navClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? "admin-nav-link admin-nav-link-active" : "admin-nav-link";

    return (
        <div className="admin-page">
            <header className="site-header">
                <div className="header-inner">
                    <div className="admin-header-left">
                        <Link to="/" className="brand">
                            Plandayım <span className="admin-badge">Admin</span>
                        </Link>

                        <nav className="admin-nav">
                            <NavLink to="/admin" end className={navClass}>
                                Başvurular
                            </NavLink>
                            <NavLink to="/admin/firmalar" className={navClass}>
                                Firmalar
                            </NavLink>
                        </nav>
                    </div>

                    <div className="header-nav">
                        {adminEmail && (
                            <span className="header-link admin-email">
                                {adminEmail}
                            </span>
                        )}

                        <button
                            type="button"
                            className="admin-button"
                            onClick={handleLogout}
                        >
                            Çıkış
                        </button>
                    </div>
                </div>
            </header>

            <main className="admin-container">{children}</main>
        </div>
    );
}

export default AdminLayout;
