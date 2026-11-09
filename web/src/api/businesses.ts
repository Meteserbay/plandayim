import type {
    BusinessDetail,
    BusinessListItem,
} from "../types/business";
import { API_BASE_URL } from "./config";

export async function recordBusinessInteraction(
    businessId: number,
    type: number
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/api/businesses/${businessId}/interactions`,
        {
            method: "POST",
            // Firma sahibi kendi profilini gezerken istatistiğe sayılmaması
            // için oturum çerezi gönderilir.
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ type }),
        }
    );

    if (!response.ok) {
        throw new Error("Etkileşim kaydedilemedi.");
    }
}

export async function searchBusinesses(filters: {
    categoryId: number;
    cityId?: number;
    districtId?: number;
}): Promise<BusinessListItem[]> {
    const params = new URLSearchParams({
        categoryId: String(filters.categoryId),
    });

    // İlçe seçildiyse yalnızca ilçeye göre aranır; şehir filtresi firmanın
    // kendi şehrine de baktığı için başka şehirden hizmet verenleri eleyebilir.
    if (filters.districtId) {
        params.set("districtId", String(filters.districtId));
    } else if (filters.cityId) {
        params.set("cityId", String(filters.cityId));
    }

    const response = await fetch(
        `${API_BASE_URL}/api/businesses?${params}`
    );

    if (!response.ok) {
        throw new Error("Firmalar alınamadı.");
    }

    return response.json();
}

export async function getLatestBusinesses(
    count = 6
): Promise<BusinessListItem[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/businesses/latest?count=${count}`
    );

    if (!response.ok) {
        throw new Error("Yeni firmalar alınamadı.");
    }

    return response.json();
}

export async function getBusinessBySlug(
    slug: string
): Promise<BusinessDetail> {
    const response = await fetch(
        `${API_BASE_URL}/api/businesses/${slug}`
    );

    if (!response.ok) {
        throw new Error("İşletme bulunamadı.");
    }

    return response.json();
}