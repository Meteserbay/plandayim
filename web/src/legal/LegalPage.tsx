import type { ReactNode } from "react";
import { Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePageMeta } from "../seo";
import { LEGAL_INFO } from "./legalInfo";

interface LegalPageProps {
    title: string;
    description: string;
    children: ReactNode;
}

function LegalPage({ title, description, children }: LegalPageProps) {
    usePageMeta({ title, description });

    return (
        <div className="page-shell">
            <Header />

            <main className="legal-page">
                <h1>{title}</h1>
                <p className="legal-updated">
                    Son güncelleme: {LEGAL_INFO.lastUpdated}
                </p>

                {children}

                <nav className="legal-nav" aria-label="Yasal metinler">
                    <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
                    <Link to="/gizlilik">Gizlilik ve Çerez Politikası</Link>
                    <Link to="/kullanim-kosullari">Kullanım Koşulları</Link>
                </nav>
            </main>

            <Footer />
        </div>
    );
}

export default LegalPage;
