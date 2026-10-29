import { useEffect, useState, type FormEvent } from "react";
import { UnauthorizedError } from "../../api/admin";
import { getBusinessProfile, updateBusinessProfile } from "../../api/owner";
import type { UpdateBusinessProfileRequest } from "../../types/owner";

interface ProfileTabProps {
    businessId: number;
    onError: (error: unknown) => void;
}

const emptyForm: UpdateBusinessProfileRequest = {
    description: "",
    phoneNumber: "",
    whatsAppNumber: "",
    email: "",
    websiteUrl: "",
    address: "",
};

function ProfileTab({ businessId, onError }: ProfileTabProps) {
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

    useEffect(() => {
        let isCancelled = false;

        getBusinessProfile(businessId)
            .then((profile) => {
                if (!isCancelled) {
                    setForm({
                        description: profile.description ?? "",
                        phoneNumber: profile.phoneNumber,
                        whatsAppNumber: profile.whatsAppNumber ?? "",
                        email: profile.email ?? "",
                        websiteUrl: profile.websiteUrl ?? "",
                        address: profile.address ?? "",
                    });
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

    function update(field: keyof UpdateBusinessProfileRequest, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
        setMessage(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);

        try {
            setIsSaving(true);

            // Boş isteğe bağlı alanlar null olarak gönderilir.
            const saved = await updateBusinessProfile(businessId, {
                description: form.description || null,
                phoneNumber: form.phoneNumber,
                whatsAppNumber: form.whatsAppNumber || null,
                email: form.email || null,
                websiteUrl: form.websiteUrl || null,
                address: form.address || null,
            });

            // Sunucu adresi normalleştirebilir (örn. https:// ekler).
            setForm((current) => ({
                ...current,
                websiteUrl: saved.websiteUrl ?? "",
            }));
            setMessage({ type: "ok", text: "Profilin kaydedildi ✓" });
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                onError(error);
                return;
            }

            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Profil kaydedilemedi.",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <p className="admin-muted owner-section">Yükleniyor...</p>;
    }

    return (
        <section className="owner-section">
            <div className="owner-section-header">
                <h2>Profil bilgileri</h2>
            </div>

            <form className="detail-card application-form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="description">Hakkında</label>

                    <textarea
                        id="description"
                        value={form.description ?? ""}
                        onChange={(event) => update("description", event.target.value)}
                        rows={5}
                        maxLength={2000}
                        placeholder="Verdiğin hizmetleri, deneyimini ve seni farklı kılan şeyleri anlat."
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
                            value={form.whatsAppNumber ?? ""}
                            onChange={(event) => update("whatsAppNumber", event.target.value)}
                            placeholder="905551234567"
                            maxLength={30}
                        />

                        <span className="field-hint">
                            Ülke koduyla yaz; profilde "WhatsApp'tan Yaz" butonu çıkar.
                        </span>
                    </div>
                </div>

                <div className="application-form-row">
                    <div className="field">
                        <label htmlFor="email">E-posta</label>

                        <input
                            id="email"
                            type="email"
                            value={form.email ?? ""}
                            onChange={(event) => update("email", event.target.value)}
                            maxLength={254}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="websiteUrl">Web sitesi</label>

                        <input
                            id="websiteUrl"
                            value={form.websiteUrl ?? ""}
                            onChange={(event) => update("websiteUrl", event.target.value)}
                            placeholder="ornek.com"
                            maxLength={500}
                        />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="address">Adres</label>

                    <input
                        id="address"
                        value={form.address ?? ""}
                        onChange={(event) => update("address", event.target.value)}
                        maxLength={500}
                    />
                </div>

                <p className="field-hint">
                    Buradaki bilgiler profilinde herkese açık görünür. İşletme
                    adı, konum ve kategori değişikliği için bizimle iletişime geç.
                </p>

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
        </section>
    );
}

export default ProfileTab;
