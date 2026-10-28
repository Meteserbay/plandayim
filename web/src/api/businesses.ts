import type {
    BusinessDetail,
    BusinessListItem,
} from "../types/business";

const API_BASE_URL = "http://localhost:5171";

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

export async function searchBusinesses(
    categoryId: number,
    districtId: number
): Promise<BusinessListItem[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/businesses?categoryId=${categoryId}&districtId=${districtId}`
    );

    if (!response.ok) {
        throw new Error("Firmalar alınamadı.");
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