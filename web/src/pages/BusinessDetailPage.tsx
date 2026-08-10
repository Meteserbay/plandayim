import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
    getBusinessBySlug,
    recordBusinessInteraction
} from "../api/businesses";
import type { BusinessDetail } from "../types/business";

function BusinessDetailPage() {
    const { slug } = useParams();

    const [business, setBusiness] = useState<BusinessDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!slug) {
            setError("Geçersiz işletme adresi.");
            setIsLoading(false);
            return;
        }

        getBusinessBySlug(slug)
            .then(setBusiness)
            .catch(() => {
                setError("İşletme bilgileri alınamadı.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [slug]);

    if (isLoading) {
        return (
            <main>
                <p>İşletme yükleniyor...</p>
            </main>
        );
    }

    if (error || !business) {
        return (
            <main>
                <p>{error || "İşletme bulunamadı."}</p>

                <Link to="/">
                    Ana sayfaya dön
                </Link>
            </main>
        );
    }
    function trackInteraction(type: number) {
        if (!business) {
            return;
        }

        recordBusinessInteraction(business.id, type)
            .catch(console.error);
    }
    return (
        <div className="detail-page">
            <Header />
            <div className="detail-container">
                <Link to="/" className="back-link">
                    ← Ana sayfaya dön
                </Link>

                <section className="detail-hero">
                    {business.images.length > 0 && (
                        <img
                            className="cover-image"
                            src={
                                business.images.find((image) => image.isCover)?.url ??
                                business.images[0].url
                            }
                            alt={business.name}
                        />
                    )}

                    <div className="business-profile">
                        {business.logoUrl && (
                            <img
                                className="business-logo"
                                src={business.logoUrl}
                                alt={`${business.name} logosu`}
                            />
                        )}

                        <div className="profile-main">
                            <h1 className="profile-title">
                                {business.name}
                            </h1>

                            <p className="profile-location">
                                {business.cityName} / {business.districtName}
                            </p>

                            {business.isVerified && (
                                <span className="verified-badge">
                                    ✓ Doğrulanmış işletme
                                </span>
                            )}

                            <div className="action-row">
                                <a
                                    className="primary-action"
                                    href={`tel:${business.phoneNumber}`}
                                    onClick={() => trackInteraction(1)}
                                >
                                    Firmayı Ara
                                </a>

                                {business.whatsAppNumber && (
                                    <a
                                        className="secondary-action"
                                        href={`https://wa.me/${business.whatsAppNumber.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => trackInteraction(2)}
                                    >
                                        WhatsApp'tan Yaz
                                    </a>
                                )}

                                {business.websiteUrl && (
                                    <a
                                        className="secondary-action"
                                        href={business.websiteUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => trackInteraction(3)}
                                    >
                                        Web Sitesine Git
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="detail-grid">
                    <div>
                        <section className="detail-card">
                            <h2>Hakkında</h2>

                            <p>
                                {business.description ??
                                    "Bu işletme için henüz açıklama eklenmemiş."}
                            </p>

                            <div className="tag-list">
                                {business.categories.map((category) => (
                                    <span className="tag" key={category}>
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="detail-card">
                            <h2>Hizmet Verdiği Bölgeler</h2>

                            <div className="tag-list">
                                {business.serviceAreas.map((area) => (
                                    <span className="tag" key={area}>
                                        {area}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {business.images.length > 0 && (
                            <section className="detail-card">
                                <h2>Galeri</h2>

                                <div className="gallery-grid">
                                    {business.images.map((image) => (
                                        <img
                                            key={image.url}
                                            src={image.url}
                                            alt={image.altText ?? business.name}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside>
                        {business.campaigns.map((campaign) => (
                            <section
                                className="detail-card campaign-card"
                                key={campaign.code}
                            >
                                <h2>Plandayım Ayrıcalığı</h2>

                                <h3>{campaign.title}</h3>

                                <p>{campaign.description}</p>

                                <span className="campaign-code">
                                    {campaign.code}
                                </span>

                                <p>
                                    Firmayla iletişime geçerken bu kodu
                                    söylediğinde kampanyadan yararlanabilirsin.
                                </p>
                            </section>
                        ))}

                        <section className="detail-card">
                            <h2>İletişim</h2>

                            <p>
                                <strong>Telefon</strong>
                                <br />
                                <a href={`tel:${business.phoneNumber}`}>
                                    {business.phoneNumber}
                                </a>
                            </p>

                            {business.email && (
                                <p>
                                    <strong>E-posta</strong>
                                    <br />
                                    <a href={`mailto:${business.email}`}>
                                        {business.email}
                                    </a>
                                </p>
                            )}

                            {business.websiteUrl && (
                                <p>
                                    <strong>Web Sitesi</strong>
                                    <br />
                                    <a
                                        href={business.websiteUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Siteyi ziyaret et
                                    </a>
                                </p>
                            )}

                            {business.address && (
                                <p>
                                    <strong>Adres</strong>
                                    <br />
                                    {business.address}
                                </p>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default BusinessDetailPage;