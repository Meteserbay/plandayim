import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { getCategories } from "../api/categories";
import { getCities, getDistricts } from "../api/locations";
import {
    getLatestBusinesses,
    searchBusinesses,
} from "../api/businesses";
import BusinessCard from "../components/BusinessCard";
import { usePageMeta } from "../seo";

import type { Category } from "../types/category";
import type { City, District } from "../types/location";
import type { BusinessListItem } from "../types/business";
function HomePage() {
    usePageMeta({});

    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
    const [latestBusinesses, setLatestBusinesses] =
        useState<BusinessListItem[]>([]);
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

        getLatestBusinesses()
            .then(setLatestBusinesses)
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
        if (!selectedCategoryId || !selectedCityId) {
            return;
        }

        try {
            setIsLoading(true);

            const result = await searchBusinesses({
                categoryId: Number(selectedCategoryId),
                cityId: Number(selectedCityId),
                districtId: selectedDistrictId
                    ? Number(selectedDistrictId)
                    : undefined,
            });

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
                            <option value="">Tüm ilçeler</option>

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
                            !selectedCityId ||
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
                        Bu bölgede bu hizmet için henüz kayıtlı firma yok.
                        Farklı bir ilçe ya da kategori deneyebilirsin.
                    </div>
                ) : (
                    <div className="business-grid">
                        {businesses.map((business) => (
                            <BusinessCard
                                key={business.id}
                                business={business}
                            />
                        ))}
                    </div>
                )}
            </main>
            )}
            {latestBusinesses.length > 0 && (
                <section className="latest-section">
                    <div className="latest-container">
                        <span className="section-eyebrow">YENİ</span>
                        <h2>Yeni eklenen firmalar</h2>
                        <p>Plandayım'a son katılan işletmeleri keşfet.</p>

                        <div className="business-grid">
                            {latestBusinesses.map((business) => (
                                <BusinessCard
                                    key={business.id}
                                    business={business}
                                />
                            ))}
                        </div>
                    </div>
                </section>
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
                        <Link
                            className="cta-button"
                            to="/firmalar-icin"
                        >
                            İşletmemi Eklemek İstiyorum
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default HomePage;