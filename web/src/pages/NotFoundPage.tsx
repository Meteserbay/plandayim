import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../seo";

function NotFoundPage() {
    usePageMeta({ title: "Sayfa bulunamadı", noIndex: true });

    return (
        <div className="page-shell">
            <Header />

            <main className="not-found">
                <span className="not-found-code">404</span>
                <h1>Aradığın sayfayı bulamadık.</h1>
                <p>
                    Adres yanlış yazılmış ya da sayfa kaldırılmış olabilir.
                    Ana sayfadan aramaya devam edebilirsin.
                </p>
                <Link className="not-found-button" to="/">
                    Ana sayfaya dön
                </Link>
            </main>

            <Footer />
        </div>
    );
}

export default NotFoundPage;
