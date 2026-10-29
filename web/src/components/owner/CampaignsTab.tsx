import { useEffect, useState, type FormEvent } from "react";
import { UnauthorizedError } from "../../api/admin";
import {
    deleteCampaign,
    getCampaigns,
    saveCampaign,
    setCampaignActive,
} from "../../api/owner";
import {
    CampaignVisibility,
    type OwnerCampaign,
    type SaveCampaignRequest,
} from "../../types/owner";

const visibilityLabels: Record<CampaignVisibility, string> = {
    [CampaignVisibility.Live]: "Yayında",
    [CampaignVisibility.Scheduled]: "Planlandı",
    [CampaignVisibility.Expired]: "Süresi doldu",
    [CampaignVisibility.Disabled]: "Kapalı",
};

const emptyForm: SaveCampaignRequest = {
    title: "",
    code: "",
    description: "",
    startsOn: "",
    endsOn: "",
};

function formatDate(value?: string | null) {
    return value
        ? new Date(`${value}T00:00:00`).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;
}

function describeDates(campaign: OwnerCampaign) {
    const starts = formatDate(campaign.startsOn);
    const ends = formatDate(campaign.endsOn);

    if (starts && ends) {
        return `${starts} – ${ends}`;
    }

    if (starts) {
        return `${starts} itibarıyla`;
    }

    if (ends) {
        return `${ends} tarihine kadar`;
    }

    return "Süresiz";
}

interface CampaignsTabProps {
    businessId: number;
    onError: (error: unknown) => void;
}

function CampaignsTab({ businessId, onError }: CampaignsTabProps) {
    const [campaigns, setCampaigns] = useState<OwnerCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // null: form kapalı, 0: yeni kampanya, >0: düzenlenen kampanya
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    useEffect(() => {
        let isCancelled = false;

        getCampaigns(businessId)
            .then((result) => {
                if (!isCancelled) {
                    setCampaigns(result);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    onError(error);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [businessId, onError]);

    function openForm(campaign?: OwnerCampaign) {
        setFormError("");
        setConfirmDeleteId(null);
        setEditingId(campaign?.id ?? 0);
        setForm(
            campaign
                ? {
                      title: campaign.title,
                      code: campaign.code,
                      description: campaign.description,
                      startsOn: campaign.startsOn ?? "",
                      endsOn: campaign.endsOn ?? "",
                  }
                : emptyForm
        );
    }

    function handleActionError(error: unknown, setMessage: (text: string) => void) {
        if (error instanceof UnauthorizedError) {
            onError(error);
            return;
        }

        setMessage(error instanceof Error ? error.message : "İşlem yapılamadı.");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError("");

        try {
            setIsSaving(true);

            const saved = await saveCampaign(
                businessId,
                {
                    ...form,
                    startsOn: form.startsOn || null,
                    endsOn: form.endsOn || null,
                },
                editingId || undefined
            );

            setCampaigns((current) =>
                editingId
                    ? current.map((item) => (item.id === saved.id ? saved : item))
                    : [saved, ...current]
            );
            setEditingId(null);
        } catch (error) {
            handleActionError(error, setFormError);
        } finally {
            setIsSaving(false);
        }
    }

    async function toggleActive(campaign: OwnerCampaign) {
        setBusyId(campaign.id);

        try {
            const saved = await setCampaignActive(
                businessId,
                campaign.id,
                !campaign.isActive
            );

            setCampaigns((current) =>
                current.map((item) => (item.id === saved.id ? saved : item))
            );
        } catch (error) {
            handleActionError(error, (text) => onError(new Error(text)));
        } finally {
            setBusyId(null);
        }
    }

    async function remove(campaign: OwnerCampaign) {
        setBusyId(campaign.id);

        try {
            await deleteCampaign(businessId, campaign.id);

            setCampaigns((current) =>
                current.filter((item) => item.id !== campaign.id)
            );
            setConfirmDeleteId(null);
        } catch (error) {
            handleActionError(error, (text) => onError(new Error(text)));
        } finally {
            setBusyId(null);
        }
    }

    const formView = (
        <form className="detail-card application-form" onSubmit={handleSubmit}>
            <h3 className="owner-card-title">
                {editingId ? "Kampanyayı düzenle" : "Yeni kampanya"}
            </h3>

            <div className="application-form-row">
                <div className="field">
                    <label htmlFor="campaign-title">Başlık</label>

                    <input
                        id="campaign-title"
                        value={form.title}
                        onChange={(event) =>
                            setForm({ ...form, title: event.target.value })
                        }
                        placeholder="Örn. Nişan çekiminde %10 indirim"
                        required
                        maxLength={200}
                    />
                </div>

                <div className="field">
                    <label htmlFor="campaign-code">Kod</label>

                    <input
                        id="campaign-code"
                        value={form.code}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                code: event.target.value.toUpperCase(),
                            })
                        }
                        placeholder="PLANDAYIM10"
                        required
                        minLength={3}
                        maxLength={50}
                        pattern="[A-Za-z0-9\-]+"
                    />

                    <span className="field-hint">
                        Müşteri sizi ararken bu kodu söyler.
                    </span>
                </div>
            </div>

            <div className="field">
                <label htmlFor="campaign-description">Açıklama</label>

                <textarea
                    id="campaign-description"
                    value={form.description}
                    onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                    }
                    rows={3}
                    required
                    maxLength={1000}
                />
            </div>

            <div className="application-form-row">
                <div className="field">
                    <label htmlFor="campaign-starts">
                        Başlangıç <span className="field-hint">(isteğe bağlı)</span>
                    </label>

                    <input
                        id="campaign-starts"
                        type="date"
                        value={form.startsOn ?? ""}
                        onChange={(event) =>
                            setForm({ ...form, startsOn: event.target.value })
                        }
                    />
                </div>

                <div className="field">
                    <label htmlFor="campaign-ends">
                        Bitiş <span className="field-hint">(isteğe bağlı, gün dahil)</span>
                    </label>

                    <input
                        id="campaign-ends"
                        type="date"
                        value={form.endsOn ?? ""}
                        min={form.startsOn || undefined}
                        onChange={(event) =>
                            setForm({ ...form, endsOn: event.target.value })
                        }
                    />
                </div>
            </div>

            {formError && (
                <p className="form-error" role="alert">
                    {formError}
                </p>
            )}

            <div className="admin-actions">
                <button
                    type="submit"
                    className="admin-button admin-button-approve"
                    disabled={isSaving}
                >
                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>

                <button
                    type="button"
                    className="admin-button"
                    onClick={() => setEditingId(null)}
                    disabled={isSaving}
                >
                    Vazgeç
                </button>
            </div>
        </form>
    );

    return (
        <section className="owner-section">
            <div className="owner-section-header">
                <h2>Kampanyalar</h2>

                {editingId === null && (
                    <button
                        type="button"
                        className="admin-button admin-button-approve"
                        onClick={() => openForm()}
                    >
                        + Yeni kampanya
                    </button>
                )}
            </div>

            <p className="admin-muted owner-intro">
                Yayındaki kampanyalar profilinde "Plandayım Ayrıcalığı" olarak
                görünür. Kapalı, planlanmış veya süresi dolmuş kampanyalar
                ziyaretçilere gösterilmez.
            </p>

            {editingId === 0 && formView}

            {isLoading ? (
                <p className="admin-muted">Yükleniyor...</p>
            ) : campaigns.length === 0 && editingId === null ? (
                <div className="empty-state">
                    Henüz kampanyan yok. Plandayım kullanıcılarına özel bir
                    indirim tanımlayarak öne çıkabilirsin.
                </div>
            ) : (
                <div className="admin-list">
                    {campaigns.map((campaign) =>
                        editingId === campaign.id ? (
                            <div key={campaign.id}>{formView}</div>
                        ) : (
                            <article
                                key={campaign.id}
                                className="detail-card owner-campaign"
                            >
                                <div className="admin-application-header">
                                    <div>
                                        <h3>{campaign.title}</h3>
                                        <p className="admin-muted">
                                            {describeDates(campaign)}
                                        </p>
                                    </div>

                                    <span
                                        className={`tag campaign-status-${campaign.visibility}`}
                                    >
                                        {visibilityLabels[campaign.visibility]}
                                    </span>
                                </div>

                                <p className="owner-campaign-body">
                                    <span className="campaign-code">
                                        {campaign.code}
                                    </span>
                                    {campaign.description}
                                </p>

                                {confirmDeleteId === campaign.id ? (
                                    <div className="admin-actions">
                                        <span className="admin-confirm-text">
                                            Kampanya kalıcı olarak silinsin mi?
                                        </span>

                                        <button
                                            type="button"
                                            className="admin-button admin-button-reject"
                                            disabled={busyId === campaign.id}
                                            onClick={() => remove(campaign)}
                                        >
                                            Evet, sil
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-button"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            Vazgeç
                                        </button>
                                    </div>
                                ) : (
                                    <div className="admin-actions">
                                        <button
                                            type="button"
                                            className="admin-button"
                                            onClick={() => openForm(campaign)}
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-button"
                                            disabled={busyId === campaign.id}
                                            onClick={() => toggleActive(campaign)}
                                        >
                                            {campaign.isActive ? "Kapat" : "Aç"}
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-button admin-button-reject"
                                            onClick={() => {
                                                setEditingId(null);
                                                setConfirmDeleteId(campaign.id);
                                            }}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                )}
                            </article>
                        )
                    )}
                </div>
            )}
        </section>
    );
}

export default CampaignsTab;
