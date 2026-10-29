import type {
    AdminBusinessDetail,
    AdminBusinessList,
    UpdateAdminBusinessRequest,
} from "../types/adminBusiness";
import { adminFetch } from "./admin";

export async function getAdminBusinesses(
    query: string,
    page: number
): Promise<AdminBusinessList> {
    const params = new URLSearchParams({ page: String(page) });

    if (query.trim()) {
        params.set("q", query.trim());
    }

    const response = await adminFetch(
        `/api/admin/businesses?${params}`,
        "Firmalar alınamadı."
    );

    return response.json();
}

export async function getAdminBusiness(
    businessId: number
): Promise<AdminBusinessDetail> {
    const response = await adminFetch(
        `/api/admin/businesses/${businessId}`,
        "Firma bilgileri alınamadı."
    );

    return response.json();
}

export async function updateAdminBusiness(
    businessId: number,
    request: UpdateAdminBusinessRequest
): Promise<AdminBusinessDetail> {
    const response = await adminFetch(
        `/api/admin/businesses/${businessId}`,
        "Firma kaydedilemedi.",
        { method: "PUT", body: JSON.stringify(request) }
    );

    return response.json();
}

export type AdminBusinessAction =
    | "activate"
    | "deactivate"
    | "verify"
    | "unverify"
    | "remove-owner";

export async function runAdminBusinessAction(
    businessId: number,
    action: AdminBusinessAction
): Promise<AdminBusinessDetail> {
    const response = await adminFetch(
        action === "remove-owner"
            ? `/api/admin/businesses/${businessId}/owner`
            : `/api/admin/businesses/${businessId}/${action}`,
        "İşlem yapılamadı.",
        { method: action === "remove-owner" ? "DELETE" : "POST" }
    );

    return response.json();
}
