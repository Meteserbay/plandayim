import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StatsTab from "../components/owner/StatsTab";
import ProfileTab from "../components/owner/ProfileTab";
import CampaignsTab from "../components/owner/CampaignsTab";
import { useAccount } from "../account/AccountContext";
import { UnauthorizedError } from "../api/admin";
import { getMyApplications } from "../api/owner";
import {
    BusinessApplicationStatus,
    BusinessApplicationType,
    type BusinessApplication,
} from "../types/businessApplication";

const tabs = [
    { id: "istatistikler", label: "İstatistikler" },
    { id: "profil", label: "Profil" },
    { id: "kampanyalar", label: "Kampanyalar" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const statusLabels: Record<BusinessApplicationStatus, string> = {
    [BusinessApplicationStatus.Pending]: "İnceleniyor",
    [BusinessApplicationStatus.Approved]: "Onaylandı",
    [BusinessApplicationStatus.Rejected]: "Reddedildi",
};

function OwnerPanelPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { account, isLoading, logout, setAccount } = useAccount();

    const [applications, setApplications] = useState<BusinessApplication[]>([]);
    const [error, setError] = useState("");

    const businesses = account?.businesses ?? [];
    const selectedId = Number(searchParams.get("isletme")) || businesses[0]?.id;
    const selectedBusiness =
        businesses.find((business) => business.id === selectedId) ??
        businesses[0];

    const tabParam = searchParams.get("sekme");
    const activeTab: TabId =
        tabs.find((tab) => tab.id === tabParam)?.id ?? "istatistikler";

    const handleError = useCallback(
        (caughtError: unknown) => {
            if (caughtError instanceof UnauthorizedError) {
                setAccount(null);
                navigate("/hesap/giris?donus=%2Fpanel", { replace: true });
                return;
            }

            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Bir hata oluştu."
            );
        },
        [navigate, setAccount]
    );

    useEffect(() => {
        if (!isLoading && !account) {
            navigate("/hesap/giris?donus=%2Fpanel", { replace: true });
        }
    }, [account, isLoading, navigate]);

    useEffect(() => {
        if (!account) {
            return;
        }

        getMyApplications()
            .then(setApplications)
            .catch(handleError);
    }, [account, handleError]);

    function updateParams(changes: Record<string, string>) {
        const next = new URLSearchParams(searchParams);

        for (const [key, value] of Object.entries(changes)) {
            next.set(key, value);
        }

        setSearchParams(next, { replace: true });
    }

    async function handleLogout() {
        await logout();
        navigate("/", { replace: true });
    }

    if (isLoading || !account) {
        return (
            <div className="page-shell">
                <Header />
                <main className="owner-container">
                    <p className="admin-muted">Yükleniyor...</p>
                </main>
            </div>
        );
    }

    const pendingApplications = applications.filter(
        (application) =>
            application.status === BusinessApplicationStatus.Pending
    );

    return (
        <div className="page-shell">
            <Header />

            <main className="owner-container">
                <div className="owner-header">
                    <div>
                        <h1 className="section-title">İşletme paneli</h1>
                        <p className="admin-muted">
                            {account.fullName} · {account.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-button"
                        onClick={handleLogout}
                    >
                        Çıkış yap
                    </button>
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {selectedBusiness ? (
                    <>
                        <div className="owner-business-bar detail-card">
                            {businesses.length > 1 ? (
                                <div className="field">
                                    <label htmlFor="business">İşletme</label>

                                    <select
                                        id="business"
                                        value={selectedBusiness.id}
                                        onChange={(event) =>
                                            updateParams({
                                                isletme: event.target.value,
                                            })
                                        }
                                    >
                                        {businesses.map((business) => (
                                            <option
                                                key={business.id}
                                                value={business.id}
                                            >
                                                {business.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <h2>{selectedBusiness.name}</h2>
                            )}

                            <Link
                                to={`/business/${selectedBusiness.slug}`}
                                className="secondary-action"
                                target="_blank"
                            >
                                Profili görüntüle ↗
                            </Link>
                        </div>

                        <div className="admin-tabs owner-tabs" role="tablist">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    className={
                                        activeTab === tab.id
                                            ? "admin-tab admin-tab-active"
                                            : "admin-tab"
                                    }
                                    onClick={() => updateParams({ sekme: tab.id })}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === "istatistikler" && (
                            <StatsTab
                                key={selectedBusiness.id}
                                businessId={selectedBusiness.id}
                                onError={handleError}
                            />
                        )}

                        {activeTab === "profil" && (
                            <ProfileTab
                                key={selectedBusiness.id}
                                businessId={selectedBusiness.id}
                                onError={handleError}
                            />
                        )}

                        {activeTab === "kampanyalar" && (
                            <CampaignsTab
                                key={selectedBusiness.id}
                                businessId={selectedBusiness.id}
                                onError={handleError}
                            />
                        )}
                    </>
                ) : (
                    <section className="detail-card application-success">
                        <h2>Henüz onaylanmış bir işletmen yok</h2>

                        <p>
                            {pendingApplications.length > 0
                                ? "Başvurun inceleniyor. Onaylandığında işletmen burada görünecek."
                                : "İşletmeni Plandayım'a ekle ya da mevcut bir profili sahiplen."}
                        </p>

                        <Link to="/firmalar-icin" className="primary-action">
                            İşletme ekle
                        </Link>
                    </section>
                )}

                {applications.length > 0 && (
                    <section className="owner-section">
                        <h2>Başvurularım</h2>

                        <div className="admin-list">
                            {applications.map((application) => (
                                <div
                                    key={application.id}
                                    className="detail-card owner-application"
                                >
                                    <div>
                                        <strong>{application.businessName}</strong>
                                        <p className="admin-muted">
                                            {application.type ===
                                            BusinessApplicationType.AddBusiness
                                                ? "İşletme ekleme"
                                                : "Sahiplenme"}
                                        </p>
                                    </div>

                                    <span
                                        className={`tag admin-status-${application.status}`}
                                    >
                                        {statusLabels[application.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default OwnerPanelPage;
