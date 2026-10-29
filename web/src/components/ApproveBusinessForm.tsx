import { useEffect, useState, type FormEvent } from "react";
import { approveBusinessApplication } from "../api/admin";
import { getCategories } from "../api/categories";
import { getCities, getDistricts } from "../api/locations";
import type { BusinessApplication } from "../types/businessApplication";
import type { Category } from "../types/category";
import type { City, District } from "../types/location";

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);

    const [cityId, setCityId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [primaryCategoryId, setPrimaryCategoryId] = useState("");
    const [serviceAreaIds, setServiceAreaIds] = useState<number[]>([]);
    const [description, setDescription] = useState(application.message ?? "");
    const [address, setAddress] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
        getCities().then(setCities).catch(console.error);
    }, []);

    useEffect(() => {
        setDistrictId("");
        setServiceAreaIds([]);

        if (!cityId) {
            setDistricts([]);
            return;
        }

        getDistricts(Number(cityId))
            .then(setDistricts)
            .catch(console.error);
    }, [cityId]);

    function toggle(list: number[], id: number): number[] {
        return list.includes(id)
            ? list.filter((item) => item !== id)
            : [...list, id];
    }

    function toggleCategory(id: number) {
        const next = toggle(categoryIds, id);
        setCategoryIds(next);

        if (!next.includes(Number(primaryCategoryId))) {
            setPrimaryCategoryId(next.length > 0 ? String(next[0]) : "");
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (categoryIds.length === 0) {
            setError("En az bir kategori seçmelisin.");
            return;
        }

        try {
            setIsSubmitting(true);

            const updated = await approveBusinessApplication(application.id, {
                cityId: Number(cityId),
                districtId: Number(districtId),
                categoryIds,
                primaryCategoryId: Number(primaryCategoryId),
                serviceAreaDistrictIds: serviceAreaIds,
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

    const selectedCategories = categories.filter((category) =>
        categoryIds.includes(category.id)
    );

    return (
        <form className="approve-form" onSubmit={handleSubmit}>
            <h4>Firma bilgileri</h4>

            <div className="application-form-row">
                <div className="field">
                    <label htmlFor={`city-${application.id}`}>Şehir</label>

                    <select
                        id={`city-${application.id}`}
                        value={cityId}
                        onChange={(event) => setCityId(event.target.value)}
                        required
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
                    <label htmlFor={`district-${application.id}`}>İlçe</label>

                    <select
                        id={`district-${application.id}`}
                        value={districtId}
                        onChange={(event) => setDistrictId(event.target.value)}
                        disabled={!cityId}
                        required
                    >
                        <option value="">İlçe seç</option>

                        {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                                {district.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <fieldset className="checkbox-group">
                <legend>Kategoriler</legend>

                {categories.map((category) => (
                    <label key={category.id} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={categoryIds.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                        />
                        {category.name}
                    </label>
                ))}
            </fieldset>

            {selectedCategories.length > 1 && (
                <div className="field">
                    <label htmlFor={`primary-${application.id}`}>
                        Ana kategori
                    </label>

                    <select
                        id={`primary-${application.id}`}
                        value={primaryCategoryId}
                        onChange={(event) =>
                            setPrimaryCategoryId(event.target.value)
                        }
                    >
                        {selectedCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {districts.length > 0 && (
                <fieldset className="checkbox-group">
                    <legend>
                        Ek hizmet bölgeleri
                        <span className="field-hint">
                            {" "}
                            (firmanın kendi ilçesi otomatik eklenir)
                        </span>
                    </legend>

                    {districts
                        .filter((district) => String(district.id) !== districtId)
                        .map((district) => (
                            <label key={district.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={serviceAreaIds.includes(district.id)}
                                    onChange={() =>
                                        setServiceAreaIds(
                                            toggle(serviceAreaIds, district.id)
                                        )
                                    }
                                />
                                {district.name}
                            </label>
                        ))}
                </fieldset>
            )}

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
