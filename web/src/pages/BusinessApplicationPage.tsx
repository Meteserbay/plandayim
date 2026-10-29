import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { useAccount } from "../account/AccountContext";
import { createBusinessApplication } from "../api/businessApplications";
import { BusinessApplicationType } from "../types/businessApplication";

function BusinessApplicationPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { account, isLoading: isAccountLoading } = useAccount();

    // Firma profilindeki "Bu işletme senin mi?" linkinden gelinirse
    // başvuru sahiplenme başvurusu olarak açılır.
    const claimBusinessId = Number(searchParams.get("isletme")) || null;
    const claimBusinessName = searchParams.get("ad") ?? "";
    const isClaim = claimBusinessId !== null;

    const [businessName, setBusinessName] = useState(claimBusinessName);
    const [contactName, setContactName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Hesap bilgileri yüklenince ad ve e-posta boşsa otomatik doldurulur.
    useEffect(() => {
        if (!account) {
            return;
        }

        setContactName((current) => current || account.fullName);
        setEmail((current) => current || account.email);
    }, [account]);

    const returnQuery = encodeURIComponent(
        `${location.pathname}${location.search}`
    );

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            setIsSubmitting(true);

            await createBusinessApplication({
                type: isClaim
                    ? BusinessApplicationType.ClaimBusiness
                    : BusinessApplicationType.AddBusiness,
                businessId: claimBusinessId,
                businessName,
                contactName,
                phoneNumber,
                email,
                message: message || null,
            });

            setIsSubmitted(true);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Başvuru gönderilemedi."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="page-shell">
            <Header />

            <section className="hero">
                <div className="hero-inner">
                    <h1 className="hero-title">
                        {isClaim
                            ? "İşletmeni sahiplen."
                            : "İşletmeni Plandayım'a ekle."}
                    </h1>

                    <p className="hero-subtitle">
                        {isClaim
                            ? "Profilin sana aitse bilgilerini bırak, ekibimiz doğrulama için seninle iletişime geçsin."
                            : "Hizmet arayan müşterilerin seni keşfetsin. Bilgilerini bırak, ekibimiz kısa sürede seninle iletişime geçsin."}
                    </p>
                </div>
            </section>

            <main className="application-container">
                {isAccountLoading ? (
                    <section className="detail-card application-success">
                        <p>Yükleniyor...</p>
                    </section>
                ) : !account ? (
                    <section className="detail-card application-success">
                        <h2>Önce hesabına giriş yap</h2>

                        <p>
                            Başvurun onaylandığında işletmen hesabına
                            bağlanır ve işletme panelinden istatistiklerini
                            görüp profilini yönetebilirsin.
                        </p>

                        <div className="action-row auth-actions">
                            <Link
                                to={`/hesap/kayit?donus=${returnQuery}`}
                                className="primary-action"
                            >
                                Hesap Oluştur
                            </Link>

                            <Link
                                to={`/hesap/giris?donus=${returnQuery}`}
                                className="secondary-action"
                            >
                                Giriş Yap
                            </Link>
                        </div>
                    </section>
                ) : isSubmitted ? (
                    <section className="detail-card application-success">
                        <h2>Başvurun alındı ✓</h2>

                        <p>
                            Teşekkürler! Başvurunu inceleyip en kısa sürede
                            seninle iletişime geçeceğiz. Onaylandığında
                            işletmen panelinde görünecek.
                        </p>

                        <Link to="/panel" className="primary-action">
                            Paneline git
                        </Link>
                    </section>
                ) : (
                    <form
                        className="detail-card application-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="field">
                            <label htmlFor="businessName">İşletme adı</label>

                            <input
                                id="businessName"
                                value={businessName}
                                onChange={(event) =>
                                    setBusinessName(event.target.value)
                                }
                                readOnly={isClaim}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="contactName">Ad soyad</label>

                            <input
                                id="contactName"
                                value={contactName}
                                onChange={(event) =>
                                    setContactName(event.target.value)
                                }
                                autoComplete="name"
                                required
                                maxLength={150}
                            />
                        </div>

                        <div className="application-form-row">
                            <div className="field">
                                <label htmlFor="phoneNumber">Telefon</label>

                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(event) =>
                                        setPhoneNumber(event.target.value)
                                    }
                                    placeholder="0555 555 55 55"
                                    autoComplete="tel"
                                    required
                                    maxLength={30}
                                />

                                {!isClaim && (
                                    <span className="field-hint">
                                        Onaylanırsa firma profilinde
                                        iletişim numarası olarak gösterilir.
                                    </span>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="email">E-posta</label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    autoComplete="email"
                                    required
                                    maxLength={254}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="message">
                                Mesajın (isteğe bağlı)
                            </label>

                            <textarea
                                id="message"
                                value={message}
                                onChange={(event) =>
                                    setMessage(event.target.value)
                                }
                                rows={5}
                                maxLength={2000}
                                placeholder="Verdiğin hizmetler, hizmet bölgelerin..."
                            />
                        </div>

                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            className="search-button"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                        </button>
                    </form>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default BusinessApplicationPage;
