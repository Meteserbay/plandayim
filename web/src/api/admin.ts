import type {
    ApproveBusinessApplicationRequest,
    BusinessApplication,
    BusinessApplicationStatus,
} from "../types/businessApplication";
import { readProblemMessage } from "./problem";

const API_BASE_URL = "http://localhost:5171";

// Oturum yoksa veya süresi dolmuşsa fırlatılır; sayfa giriş ekranına yönlendirir.
export class UnauthorizedError extends Error {
    constructor() {
        super("Oturum açman gerekiyor.");
    }
}

async function adminFetch(
    path: string,
    fallbackError: string,
    init: RequestInit = {}
): Promise<Response> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        // Admin oturum çerezinin gönderilmesi için gerekli.
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
        },
    });

    if (response.status === 401) {
        throw new UnauthorizedError();
    }

    if (response.status === 429) {
        throw new Error("Çok fazla deneme yaptın. Bir dakika sonra tekrar dene.");
    }

    if (!response.ok) {
        throw new Error(await readProblemMessage(response, fallbackError));
    }

    return response;
}

export async function adminLogin(
    email: string,
    password: string
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.status === 429) {
        throw new Error("Çok fazla deneme yaptın. Bir dakika sonra tekrar dene.");
    }

    if (!response.ok) {
        throw new Error(
            await readProblemMessage(response, "Giriş yapılamadı.")
        );
    }
}

export async function adminLogout(): Promise<void> {
    await adminFetch("/api/admin/auth/logout", "Çıkış yapılamadı.", {
        method: "POST",
    });
}

export async function getAdminSession(): Promise<{ email: string }> {
    const response = await adminFetch(
        "/api/admin/auth/me",
        "Oturum bilgisi alınamadı."
    );

    return response.json();
}

export async function getBusinessApplications(
    status?: BusinessApplicationStatus
): Promise<BusinessApplication[]> {
    const query = status ? `?status=${status}` : "";

    const response = await adminFetch(
        `/api/admin/business-applications${query}`,
        "Başvurular alınamadı."
    );

    return response.json();
}

export async function approveBusinessApplication(
    applicationId: number,
    request: ApproveBusinessApplicationRequest = {}
): Promise<BusinessApplication> {
    const response = await adminFetch(
        `/api/admin/business-applications/${applicationId}/approve`,
        "Başvuru onaylanamadı.",
        {
            method: "POST",
            body: JSON.stringify(request),
        }
    );

    return response.json();
}

export async function rejectBusinessApplication(
    applicationId: number
): Promise<BusinessApplication> {
    const response = await adminFetch(
        `/api/admin/business-applications/${applicationId}/reject`,
        "Başvuru reddedilemedi.",
        {
            method: "POST",
        }
    );

    return response.json();
}
