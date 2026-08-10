import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { getCategories } from "../api/categories";
import { getCities, getDistricts } from "../api/locations";
import { searchBusinesses } from "../api/businesses";

import type { Category } from "../types/category";
import type { City, District } from "../types/location";
import type { BusinessListItem } from "../types/business";
function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedCityId, setSelectedCityId] = useState("");
    const [selectedDistrictId, setSelectedDistrictId] = useState("");
    const resultsRef = useRef<HTMLElement | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch(console.error);

        getCities()
            .then(setCities)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedCityId) {
            setDistricts([]);
            setSelectedDistrictId("");
            return;
        }

        getDistricts(Number(selectedCityId))
            .then(setDistricts)
            .catch(console.error);

        setSelectedDistrictId("");
    }, [selectedCityId]);
    async function handleSearch() {
        if (!selectedCategoryId || !selectedDistrictId) {
            return;
        }

        try {
            setIsLoading(true);

            const result = await searchBusinesses(
                Number(selectedCategoryId),
                Number(selectedDistrictId)
            );

            setBusinesses(result);
            setHasSearched(true);
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 100);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="page-shell">
            <Header />

            <section className="hero">
                <div className="hero-inner">
                    <h1 className="hero-title">
                        Planını kolaylaştır.
                    </h1>

                    <p className="hero-subtitle">
                        Organizasyonun için ihtiyacın olan hizmetleri keşfet,
                        sana uygun firmaları tek yerde bul.
                    </p>
                </div>
            </section>

            <section className="search-panel">
                <div className="search-card">
                    <div className="field">
                        <label htmlFor="category">Ne planlıyorsun?</label>

                        <select
                            id="category"
                            value={selectedCategoryId}
                            onChange={(event) =>
                                setSelectedCategoryId(event.target.value)
                            }
                        >
                            <option value="">Kategori seç</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="city">Şehir</label>

                        <select
                            id="city"
                            value={selectedCityId}
                            onChange={(event) =>
                                setSelectedCityId(event.target.value)
                            }
                        >
                            <option value="">Şehir seç</option>

                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="district">İlçe</label>

                        <select
                            id="district"
                            value={selectedDistrictId}
                            onChange={(event) =>
                                setSelectedDistrictId(event.target.value)
                            }
                            disabled={!selectedCityId}
                        >
                            <option value="">İlçe seç</option>

                            {districts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="search-button"
                        type="button"
                        onClick={handleSearch}
                        disabled={
                            !selectedCategoryId ||
                            !selectedDistrictId ||
                            isLoading
                        }
                    >
                        {isLoading ? "Aranıyor..." : "Firmaları Bul"}
                    </button>
                </div>
            </section>
            

            {hasSearched && (
            <main className="content" ref={resultsRef}>
                <h2 className="section-title">
                    Firmalar
                </h2>

                {businesses.length === 0 ? (
                    <div className="empty-state">
                        Arama kriterlerini seçerek sana uygun firmaları bulabilirsin.
                    </div>
                ) : (
                    <div className="business-grid">
                        {businesses.map((business) => (
                            <article
                                className="business-card"
                                key={business.id}
                            >
                                {business.coverImageUrl && (
                                    <img
                                        className="business-card-image"
                                        src={business.coverImageUrl}
                                        alt={business.name}
                                    />
                                )}

                                <div className="business-card-body">
                                    <div className="business-card-header">
                                        <h3>{business.name}</h3>

                                        {business.isVerified && (
                                            <span className="verified-mini">
                                                ✓
                                            </span>
                                        )}
                                    </div>

                                    {business.primaryCategory && (
                                        <p className="business-category">
                                            {business.primaryCategory}
                                        </p>
                                    )}

                                    <p className="business-meta">
                                        {business.cityName} / {business.districtName}
                                    </p>

                                    {business.hasActiveCampaign && (
                                        <div className="campaign-badge">
                                            Plandayım avantajı var
                                        </div>
                                    )}

                                    <Link
                                        className="details-link"
                                        to={`/business/${business.slug}`}
                                    >
                                        Detayları Gör
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
            )}
            <section className="popular-section">
                <div className="popular-container">
                    <div className="popular-heading">
                        <div>
                            <span className="section-eyebrow">
                                KEŞFET
                            </span>

                            <h2>Popüler hizmetler</h2>

                            <p>
                                Organizasyonun için en çok ihtiyaç duyulan
                                hizmetleri keşfet.
                            </p>
                        </div>
                    </div>

                    <div className="category-grid">
                        {categories.slice(0, 8).map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={
                                    selectedCategoryId === String(category.id)
                                        ? "category-card category-card-active"
                                        : "category-card"
                                }
                                onClick={() =>
                                    setSelectedCategoryId(String(category.id))
                                }
                            >
                                <span className="category-icon">
                                    {category.name.charAt(0)}
                                </span>

                                <span className="category-name">
                                    {category.name}
                                </span>

                                <span className="category-arrow">
                                    →
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
            <section id="how-it-works" className="info-section">
                <div className="info-container">
                    <div className="section-heading">
                        <span>Nasıl çalışır?</span>

                        <h2>
                            İhtiyacın olan hizmete birkaç adımda ulaş.
                        </h2>

                        <p>
                            Kategori ve bölge seç, sana hizmet veren işletmeleri
                            keşfet ve doğrudan iletişime geç.
                        </p>
                    </div>

                    <div className="steps-grid">
                        <article className="step-card">
                            <span className="step-number">1</span>
                            <h3>Hizmetini seç</h3>
                            <p>
                                İhtiyacın olan organizasyon hizmetini belirle.
                            </p>
                        </article>

                        <article className="step-card">
                            <span className="step-number">2</span>
                            <h3>Bölgeni belirle</h3>
                            <p>
                                Şehir ve ilçeni seçerek sana hizmet veren
                                işletmeleri görüntüle.
                            </p>
                        </article>

                        <article className="step-card">
                            <span className="step-number">3</span>
                            <h3>Firmayla iletişime geç</h3>
                            <p>
                                Firma profilini incele ve doğrudan işletmeyle
                                iletişime geç.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section id="businesses" className="business-cta-section">
                <div className="business-cta">
                    <div className="business-cta-content">
                        <span className="cta-eyebrow">
                            Firmalar için
                        </span>

                        <h2>
                            Yeni müşterilerin seni Plandayım'da bulsun.
                        </h2>

                        <p>
                            İşletmeni Plandayım'a ekleyerek hizmet arayan
                            müşterilerin seni keşfetmesini sağla.
                        </p>
                    </div>

                    <div className="business-cta-action">
                        <a
                            className="cta-button"
                            href="mailto:iletisim@plandayim.com"
                        >
                            İşletmemi Eklemek İstiyorum
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default HomePage;