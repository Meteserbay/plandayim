import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { UnauthorizedError } from "../api/admin";
import {
    getAdminBusiness,
    runAdminBusinessAction,
    updateAdminBusiness,
    type AdminBusinessAction,
} from "../api/adminBusinesses";
import AdminLayout from "../components/AdminLayout";
import BusinessClassificationFields, {
    type BusinessClassificationValue,
} from "../components/BusinessClassificationFields";
import type { AdminBusinessDetail } from "../types/adminBusiness";

interface ContactForm {
    name: string;
    slug: string;
    description: string;
    phoneNumber: string;
    whatsAppNumber: string;
    email: string;
    websiteUrl: string;
    address: string;
}

function toContactForm(business: AdminBusinessDetail): ContactForm {
    return {
        name: business.name,
        slug: business.slug,
        description: business.description ?? "",
        phoneNumber: business.phoneNumber,
        whatsAppNumber: business.whatsAppNumber ?? "",
        email: business.email ?? "",
        websiteUrl: business.websiteUrl ?? "",
        address: business.address ?? "",
    };
}

function toClassification(business: AdminBusinessDetail): BusinessClassificationValue {
    return {
        cityId: String(business.cityId),
        districtId: String(business.districtId),
        categoryIds: business.categoryIds,
        primaryCategoryId: String(
            business.primaryCategoryId ?? business.categoryIds[0] ?? ""
        ),
        // Firmanın kendi ilçesi otomatik eklendiği için listede gösterilmez.
        serviceAreaIds: business.serviceAreaDistrictIds.filter(
            (id) => id !== business.districtId
        ),
    };
}

// Geri dönüşü dikkat isteyen işlemler önce onay sorar.
const confirmMessages: Partial<Record<AdminBusinessAction, string>> = {
    deactivate: "Firma profilden ve aramadan kaldırılsın mı?",
    "remove-owner": "Sahibin bu firmaya erişimi kaldırılsın mı?",
};

function AdminBusinessEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const businessId = Number(id);

    const [business, setBusiness] = useState<AdminBusinessDetail | null>(null);
    const [form, setForm] = useState<ContactForm | null>(null);
    const [classification, setClassification] =
        useState<BusinessClassificationValue | null>(null);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingAction, setPendingAction] = useState<AdminBusinessAction | null>(null);
    const [busyAction, setBusyAction] = useState<AdminBusinessAction | null>(null);

    const handleError = useCallback(
        (error: unknown) => {
            if (error instanceof UnauthorizedError) {
                navigate("/admin/giris", { replace: true });
                return;
            }

            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Bir hata oluştu.",
            });
        },
        [navigate]
    );

    const load = useCallback(
        (detail: AdminBusinessDetail) => {
            setBusiness(detail);
            setForm(toContactForm(detail));
            setClassification(toClassification(detail));
        },
        []
    );

    useEffect(() => {
        if (!Number.isFinite(businessId)) {
            return;
        }

        let isCancelled = false;

        getAdminBusiness(businessId)
            .then((detail) => {
                if (!isCancelled) {
                    load(detail);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    handleError(error);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [businessId, load, handleError]);

    function update(field: keyof ContactForm, value: string) {
        setForm((current) => (current ? { ...current, [field]: value } : current));
        setMessage(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form || !classification) {
            return;
        }

        setMessage(null);

        if (classification.categoryIds.length === 0) {
            setMessage({ type: "error", text: "En az bir kategori seçmelisin." });
            return;
        }

        try {
            setIsSaving(true);

            const saved = await updateAdminBusiness(businessId, {
                name: form.name,
                slug: form.slug,
                description: form.description || null,
                phoneNumber: form.phoneNumber,
                whatsAppNumber: form.whatsAppNumber || null,
                email: form.email || null,
                websiteUrl: form.websiteUrl || null,
                address: form.address || null,
                cityId: Number(classification.cityId),
                districtId: Number(classification.districtId),
                categoryIds: classification.categoryIds,
                primaryCategoryId: Number(classification.primaryCategoryId),
                serviceAreaDistrictIds: classification.serviceAreaIds,
            });

            load(saved);
            setMessage({ type: "ok", text: "Firma kaydedildi ✓" });
        } catch (error) {
            handleError(error);
        } finally {
            setIsSaving(false);
        }
    }

    async function runAction(action: AdminBusinessAction) {
        setMessage(null);
        setBusyAction(action);

        try {
            const updated = await runAdminBusinessAction(businessId, action);

            setBusiness(updated);
            setPendingAction(null);
        } catch (error) {
            handleError(error);
        } finally {
            setBusyAction(null);
        }
    }

    function requestAction(action: AdminBusinessAction) {
        if (confirmMessages[action]) {
            setPendingAction(action);
        } else {
            void runAction(action);
        }
    }

    if (!business || !form || !classification) {
        return (
            <AdminLayout>
                {message ? (
                    <p className="form-error" role="alert">
                        {message.text}
                    </p>
                ) : (
                    <p className="admin-muted">Yükleniyor...</p>
                )}
            </AdminLayout>
        );
    }

    const slugChanged = form.slug !== business.slug;

    return (
        <AdminLayout>
            <Link to="/admin/firmalar" className="back-link">
                ← Firmalar
            </Link>

            <div className="owner-header">
                <div>
                    <h1 className="section-title">{business.name}</h1>
                    <p className="admin-muted">#{business.id}</p>
                </div>

                <Link
                    to={`/business/${business.slug}`}
                    target="_blank"
                    className="secondary-action"
                >
                    Profili görüntüle ↗
                </Link>
            </div>

            <div className="admin-edit-grid">
                <form className="detail-card application-form" onSubmit={handleSubmit}>
                    <div className="application-form-row">
                        <div className="field">
                            <label htmlFor="name">İşletme adı</label>
                            <input
                                id="name"
                                value={form.name}
                                onChange={(event) => update("name", event.target.value)}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="slug">Profil adresi</label>
                            <input
                                id="slug"
                                value={form.slug}
                                onChange={(event) =>
                                    update("slug", event.target.value.toLowerCase())
                                }
                                required
                                maxLength={220}
                                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                            />
                            <span className="field-hint">
                                /business/{form.slug || "…"}
                                {slugChanged &&
                                    " — değişirse eski linkler çalışmaz."}
                            </span>
                        </div>
                    </div>

                    <BusinessClassificationFields
                        idPrefix="edit"
                        value={classification}
                        onChange={(value) => {
                            setClassification(value);
                            setMessage(null);
                        }}
                    />

                    <div className="field">
                        <label htmlFor="description">Açıklama</label>
                        <textarea
                            id="description"
                            value={form.description}
                            onChange={(event) => update("description", event.target.value)}
                            rows={4}
                            maxLength={2000}
                        />
                    </div>

                    <div className="application-form-row">
                        <div className="field">
                            <label htmlFor="phoneNumber">Telefon</label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(event) => update("phoneNumber", event.target.value)}
                                required
                                maxLength={30}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsAppNumber">WhatsApp</label>
                            <input
                                id="whatsAppNumber"
                                type="tel"
                                value={form.whatsAppNumber}
                                onChange={(event) =>
                                    update("whatsAppNumber", event.target.value)
                                }
                                maxLength={30}
                            />
                        </div>
                    </div>

                    <div className="application-form-row">
                        <div className="field">
                            <label htmlFor="email">E-posta</label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(event) => update("email", event.target.value)}
                                maxLength={254}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="websiteUrl">Web sitesi</label>
                            <input
                                id="websiteUrl"
                                value={form.websiteUrl}
                                onChange={(event) => update("websiteUrl", event.target.value)}
                                maxLength={500}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="address">Adres</label>
                        <input
                            id="address"
                            value={form.address}
                            onChange={(event) => update("address", event.target.value)}
                            maxLength={500}
                        />
                    </div>

                    {message && (
                        <p
                            className={message.type === "ok" ? "form-success" : "form-error"}
                            role="status"
                        >
                            {message.text}
                        </p>
                    )}

                    <button className="search-button" type="submit" disabled={isSaving}>
                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </form>

                <aside className="admin-edit-side">
                    <section className="detail-card">
                        <h2 className="owner-card-title">Durum</h2>

                        <div className="admin-status-row">
                            <span>
                                {business.isActive ? "Yayında" : "Yayında değil"}
                            </span>

                            <button
                                type="button"
                                className={
                                    business.isActive
                                        ? "admin-button admin-button-reject"
                                        : "admin-button admin-button-approve"
                                }
                                disabled={busyAction !== null}
                                onClick={() =>
                                    requestAction(
                                        business.isActive ? "deactivate" : "activate"
                                    )
                                }
                            >
                                {business.isActive ? "Yayından kaldır" : "Yayına al"}
                            </button>
                        </div>

                        <div className="admin-status-row">
                            <span>
                                {business.isVerified
                                    ? "✓ Doğrulanmış"
                                    : "Doğrulanmamış"}
                            </span>

                            <button
                                type="button"
                                className="admin-button"
                                disabled={busyAction !== null}
                                onClick={() =>
                                    requestAction(
                                        business.isVerified ? "unverify" : "verify"
                                    )
                                }
                            >
                                {business.isVerified ? "Rozeti kaldır" : "Doğrula"}
                            </button>
                        </div>
                    </section>

                    <section className="detail-card">
                        <h2 className="owner-card-title">Sahip</h2>

                        {business.ownerEmail ? (
                            <>
                                <p className="admin-owner">
                                    {business.ownerFullName}
                                    <br />
                                    <span className="admin-muted">
                                        {business.ownerEmail}
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    className="admin-button admin-button-reject"
                                    disabled={busyAction !== null}
                                    onClick={() => requestAction("remove-owner")}
                                >
                                    Sahipliği kaldır
                                </button>
                            </>
                        ) : (
                            <p className="admin-muted">
                                Bu firmanın bağlı bir hesabı yok. Sahiplenme
                                başvurusu onaylanınca burada görünür.
                            </p>
                        )}
                    </section>

                    {pendingAction && (
                        <section className="detail-card admin-confirm-card" role="alertdialog">
                            <p className="admin-confirm-text">
                                {confirmMessages[pendingAction]}
                            </p>

                            <div className="admin-actions">
                                <button
                                    type="button"
                                    className="admin-button admin-button-reject"
                                    disabled={busyAction !== null}
                                    onClick={() => runAction(pendingAction)}
                                >
                                    {busyAction ? "İşleniyor..." : "Evet"}
                                </button>

                                <button
                                    type="button"
                                    className="admin-button"
                                    onClick={() => setPendingAction(null)}
                                >
                                    Vazgeç
                                </button>
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </AdminLayout>
    );
}

export default AdminBusinessEditPage;
