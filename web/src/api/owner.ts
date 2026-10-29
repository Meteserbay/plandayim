import type { BusinessApplication } from "../types/businessApplication";
import type {
    BusinessStats,
    OwnerBusinessProfile,
    OwnerCampaign,
    OwnerImages,
    SaveCampaignRequest,
    UpdateBusinessProfileRequest,
} from "../types/owner";
import { UnauthorizedError } from "./admin";
import { readProblemMessage } from "./problem";
import { API_BASE_URL } from "./config";

// Firma sahibi oturumuyla yapılan istekler. 401 gelirse sayfa giriş
// ekranına yönlendirir.
export async function ownerFetch(
    path: string,
    fallbackError: string,
    init: RequestInit = {}
): Promise<Response> {
    const isFormData = init.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: isFormData
            ? init.headers
            : {
                  "Content-Type": "application/json",
                  ...init.headers,
              },
    });

    if (response.status === 401) {
        throw new UnauthorizedError();
    }

    if (!response.ok) {
        throw new Error(await readProblemMessage(response, fallbackError));
    }

    return response;
}

export async function getMyApplications(): Promise<BusinessApplication[]> {
    const response = await ownerFetch(
        "/api/account/applications",
        "Başvurular alınamadı."
    );

    return response.json();
}

export async function getBusinessStats(
    businessId: number,
    days: number
): Promise<BusinessStats> {
    const response = await ownerFetch(
        `/api/owner/businesses/${businessId}/stats?days=${days}`,
        "İstatistikler alınamadı."
    );

    return response.json();
}

const businessPath = (businessId: number) =>
    `/api/owner/businesses/${businessId}`;

export async function getBusinessProfile(
    businessId: number
): Promise<OwnerBusinessProfile> {
    const response = await ownerFetch(
        `${businessPath(businessId)}/profile`,
        "Profil bilgileri alınamadı."
    );

    return response.json();
}

export async function updateBusinessProfile(
    businessId: number,
    request: UpdateBusinessProfileRequest
): Promise<OwnerBusinessProfile> {
    const response = await ownerFetch(
        `${businessPath(businessId)}/profile`,
        "Profil kaydedilemedi.",
        { method: "PUT", body: JSON.stringify(request) }
    );

    return response.json();
}

export async function getCampaigns(
    businessId: number
): Promise<OwnerCampaign[]> {
    const response = await ownerFetch(
        `${businessPath(businessId)}/campaigns`,
        "Kampanyalar alınamadı."
    );

    return response.json();
}

export async function saveCampaign(
    businessId: number,
    request: SaveCampaignRequest,
    campaignId?: number
): Promise<OwnerCampaign> {
    const response = await ownerFetch(
        campaignId
            ? `${businessPath(businessId)}/campaigns/${campaignId}`
            : `${businessPath(businessId)}/campaigns`,
        "Kampanya kaydedilemedi.",
        {
            method: campaignId ? "PUT" : "POST",
            body: JSON.stringify(request),
        }
    );

    return response.json();
}

export async function setCampaignActive(
    businessId: number,
    campaignId: number,
    isActive: boolean
): Promise<OwnerCampaign> {
    const response = await ownerFetch(
        `${businessPath(businessId)}/campaigns/${campaignId}/${isActive ? "activate" : "deactivate"}`,
        "Kampanya güncellenemedi.",
        { method: "POST" }
    );

    return response.json();
}

async function imagesRequest(
    businessId: number,
    path: string,
    fallbackError: string,
    init: RequestInit = {}
): Promise<OwnerImages> {
    const response = await ownerFetch(
        `${businessPath(businessId)}/${path}`,
        fallbackError,
        init
    );

    return response.json();
}

export function getImages(businessId: number): Promise<OwnerImages> {
    return imagesRequest(businessId, "images", "Görseller alınamadı.");
}

export function uploadImage(businessId: number, file: File): Promise<OwnerImages> {
    const body = new FormData();
    body.append("file", file);

    return imagesRequest(businessId, "images", "Görsel yüklenemedi.", {
        method: "POST",
        body,
    });
}

export function setCoverImage(
    businessId: number,
    imageId: number
): Promise<OwnerImages> {
    return imagesRequest(
        businessId,
        `images/${imageId}/cover`,
        "Kapak görseli değiştirilemedi.",
        { method: "POST" }
    );
}

export function reorderImages(
    businessId: number,
    imageIds: number[]
): Promise<OwnerImages> {
    return imagesRequest(businessId, "images/order", "Sıralama kaydedilemedi.", {
        method: "PUT",
        body: JSON.stringify({ imageIds }),
    });
}

export function deleteImage(
    businessId: number,
    imageId: number
): Promise<OwnerImages> {
    return imagesRequest(businessId, `images/${imageId}`, "Görsel silinemedi.", {
        method: "DELETE",
    });
}

export function uploadLogo(businessId: number, file: File): Promise<OwnerImages> {
    const body = new FormData();
    body.append("file", file);

    return imagesRequest(businessId, "logo", "Logo yüklenemedi.", {
        method: "POST",
        body,
    });
}

export function deleteLogo(businessId: number): Promise<OwnerImages> {
    return imagesRequest(businessId, "logo", "Logo kaldırılamadı.", {
        method: "DELETE",
    });
}

export async function deleteCampaign(
    businessId: number,
    campaignId: number
): Promise<void> {
    await ownerFetch(
        `${businessPath(businessId)}/campaigns/${campaignId}`,
        "Kampanya silinemedi.",
        { method: "DELETE" }
    );
}
