import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { UnauthorizedError } from "../api/admin";
import { getAdminBusinesses } from "../api/adminBusinesses";
import AdminLayout from "../components/AdminLayout";
import type { AdminBusinessList } from "../types/adminBusiness";

function AdminBusinessesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") ?? "";
    const page = Math.max(1, Number(searchParams.get("sayfa")) || 1);

    const [searchInput, setSearchInput] = useState(query);
    const [data, setData] = useState<AdminBusinessList | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        setError("");

        getAdminBusinesses(query, page)
            .then((result) => {
                if (!isCancelled) {
                    setData(result);
                }
            })
            .catch((caughtError) => {
                if (isCancelled) {
                    return;
                }

                if (caughtError instanceof UnauthorizedError) {
                    navigate("/admin/giris", { replace: true });
                    return;
                }

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Firmalar alınamadı."
                );
            });

        return () => {
            isCancelled = true;
        };
    }, [query, page, navigate]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const next = new URLSearchParams();

        if (searchInput.trim()) {
            next.set("q", searchInput.trim());
        }

        setSearchParams(next);
    }

    function goToPage(nextPage: number) {
        const next = new URLSearchParams(searchParams);
        next.set("sayfa", String(nextPage));
        setSearchParams(next);
    }

    const pageCount = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

    return (
        <AdminLayout>
            <h1 className="section-title">Firmalar</h1>

            <form className="admin-search" onSubmit={handleSearch} role="search">
                <div className="field">
                    <label htmlFor="business-search">Firma ara</label>

                    <input
                        id="business-search"
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Firma adı veya profil adresi"
                    />
                </div>

                <button type="submit" className="admin-button admin-button-approve">
                    Ara
                </button>
            </form>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {!data ? (
                <p className="admin-muted">Yükleniyor...</p>
            ) : data.items.length === 0 ? (
                <div className="empty-state">
                    {query ? `"${query}" ile eşleşen firma yok.` : "Henüz firma yok."}
                </div>
            ) : (
                <>
                    <p className="admin-muted admin-result-count">
                        {data.totalCount} firma
                    </p>

                    <div className="admin-list">
                        {data.items.map((business) => (
                            <Link
                                key={business.id}
                                to={`/admin/firmalar/${business.id}`}
                                className="detail-card admin-business-row"
                            >
                                <div>
                                    <h3>{business.name}</h3>

                                    <p className="admin-muted">
                                        {business.primaryCategory ?? "Kategori yok"} ·{" "}
                                        {business.cityName} / {business.districtName}
                                    </p>

                                    <p className="admin-muted">
                                        {business.ownerEmail
                                            ? `Sahip: ${business.ownerEmail}`
                                            : "Sahibi yok"}
                                    </p>
                                </div>

                                <div className="tag-list">
                                    <span
                                        className={
                                            business.isActive
                                                ? "tag admin-status-2"
                                                : "tag admin-status-3"
                                        }
                                    >
                                        {business.isActive ? "Yayında" : "Yayında değil"}
                                    </span>

                                    {business.isVerified && (
                                        <span className="tag">✓ Doğrulanmış</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {pageCount > 1 && (
                        <div className="admin-pagination">
                            <button
                                type="button"
                                className="admin-button"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                ← Önceki
                            </button>

                            <span className="admin-muted">
                                Sayfa {page} / {pageCount}
                            </span>

                            <button
                                type="button"
                                className="admin-button"
                                disabled={page >= pageCount}
                                onClick={() => goToPage(page + 1)}
                            >
                                Sonraki →
                            </button>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    );
}

export default AdminBusinessesPage;
