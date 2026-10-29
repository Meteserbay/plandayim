import { useState, type FormEvent } from "react";
import { approveBusinessApplication } from "../api/admin";
import type { BusinessApplication } from "../types/businessApplication";
import BusinessClassificationFields, {
    emptyClassification,
} from "./BusinessClassificationFields";

interface ApproveBusinessFormProps {
    application: BusinessApplication;
    onApproved: (application: BusinessApplication) => void;
    onCancel: () => void;
    onError: (error: unknown) => void;
}

// "İşletme ekle" başvurusunu onaylarken firmanın oluşturulması için
// başvuruda olmayan bilgileri (konum, kategori, hizmet bölgesi) toplar.
function ApproveBusinessForm({
    application,
    onApproved,
    onCancel,
    onError,
}: ApproveBusinessFormProps) {
    const [classification, setClassification] = useState(emptyClassification);
    const [description, setDescription] = useState(application.message ?? "");
    const [address, setAddress] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (classification.categoryIds.length === 0) {
            setError("En az bir kategori seçmelisin.");
            return;
        }

        try {
            setIsSubmitting(true);

            const updated = await approveBusinessApplication(application.id, {
                cityId: Number(classification.cityId),
                districtId: Number(classification.districtId),
                categoryIds: classification.categoryIds,
                primaryCategoryId: Number(classification.primaryCategoryId),
                serviceAreaDistrictIds: classification.serviceAreaIds,
                description: description || null,
                address: address || null,
            });

            onApproved(updated);
        } catch (submitError) {
            onError(submitError);

            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Başvuru onaylanamadı."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="approve-form" onSubmit={handleSubmit}>
            <h4>Firma bilgileri</h4>

            <BusinessClassificationFields
                idPrefix={`approve-${application.id}`}
                value={classification}
                onChange={setClassification}
            />

            <div className="field">
                <label htmlFor={`description-${application.id}`}>
                    Açıklama
                </label>

                <textarea
                    id={`description-${application.id}`}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    maxLength={2000}
                />
            </div>

            <div className="field">
                <label htmlFor={`address-${application.id}`}>Adres</label>

                <input
                    id={`address-${application.id}`}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    maxLength={500}
                />
            </div>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <div className="admin-actions">
                <button
                    type="submit"
                    className="admin-button admin-button-approve"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Oluşturuluyor..." : "Onayla ve firmayı oluştur"}
                </button>

                <button
                    type="button"
                    className="admin-button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Vazgeç
                </button>
            </div>
        </form>
    );
}

export default ApproveBusinessForm;
