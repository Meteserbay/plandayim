import { useEffect, useState } from "react";
import { getCategories } from "../api/categories";
import { getCities, getDistricts } from "../api/locations";
import type { Category } from "../types/category";
import type { City, District } from "../types/location";

export interface BusinessClassificationValue {
    cityId: string;
    districtId: string;
    categoryIds: number[];
    primaryCategoryId: string;
    serviceAreaIds: number[];
}

// oxlint-disable-next-line react/only-export-components
export const emptyClassification: BusinessClassificationValue = {
    cityId: "",
    districtId: "",
    categoryIds: [],
    primaryCategoryId: "",
    serviceAreaIds: [],
};

interface BusinessClassificationFieldsProps {
    idPrefix: string;
    value: BusinessClassificationValue;
    onChange: (value: BusinessClassificationValue) => void;
}

function toggle(list: number[], id: number): number[] {
    return list.includes(id)
        ? list.filter((item) => item !== id)
        : [...list, id];
}

// Firmanın şehir, ilçe, kategori ve hizmet bölgesi alanları. Başvuru onayı
// ve admin firma düzenlemesi aynı alanları kullanır.
function BusinessClassificationFields({
    idPrefix,
    value,
    onChange,
}: BusinessClassificationFieldsProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
        getCities().then(setCities).catch(console.error);
    }, []);

    // Sadece ilçe listesini yükler. Seçimleri sıfırlamak şehir değiştiğinde
    // yapılır; böylece düzenlemede kayıtlı ilçe ilk yüklemede silinmez.
    useEffect(() => {
        if (!value.cityId) {
            setDistricts([]);
            return;
        }

        let isCancelled = false;

        getDistricts(Number(value.cityId))
            .then((result) => {
                if (!isCancelled) {
                    setDistricts(result);
                }
            })
            .catch(console.error);

        return () => {
            isCancelled = true;
        };
    }, [value.cityId]);

    function changeCity(cityId: string) {
        onChange({ ...value, cityId, districtId: "", serviceAreaIds: [] });
    }

    function toggleCategory(id: number) {
        const categoryIds = toggle(value.categoryIds, id);
        const primaryStillSelected = categoryIds.includes(
            Number(value.primaryCategoryId)
        );

        onChange({
            ...value,
            categoryIds,
            primaryCategoryId: primaryStillSelected
                ? value.primaryCategoryId
                : categoryIds.length > 0
                  ? String(categoryIds[0])
                  : "",
        });
    }

    const selectedCategories = categories.filter((category) =>
        value.categoryIds.includes(category.id)
    );

    return (
        <>
            <div className="application-form-row">
                <div className="field">
                    <label htmlFor={`${idPrefix}-city`}>Şehir</label>

                    <select
                        id={`${idPrefix}-city`}
                        value={value.cityId}
                        onChange={(event) => changeCity(event.target.value)}
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
                    <label htmlFor={`${idPrefix}-district`}>İlçe</label>

                    <select
                        id={`${idPrefix}-district`}
                        value={value.districtId}
                        onChange={(event) =>
                            onChange({ ...value, districtId: event.target.value })
                        }
                        disabled={!value.cityId}
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
                            checked={value.categoryIds.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                        />
                        {category.name}
                    </label>
                ))}
            </fieldset>

            {selectedCategories.length > 1 && (
                <div className="field">
                    <label htmlFor={`${idPrefix}-primary`}>Ana kategori</label>

                    <select
                        id={`${idPrefix}-primary`}
                        value={value.primaryCategoryId}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                primaryCategoryId: event.target.value,
                            })
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
                        .filter((district) => String(district.id) !== value.districtId)
                        .map((district) => (
                            <label key={district.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={value.serviceAreaIds.includes(district.id)}
                                    onChange={() =>
                                        onChange({
                                            ...value,
                                            serviceAreaIds: toggle(
                                                value.serviceAreaIds,
                                                district.id
                                            ),
                                        })
                                    }
                                />
                                {district.name}
                            </label>
                        ))}
                </fieldset>
            )}
        </>
    );
}

export default BusinessClassificationFields;
