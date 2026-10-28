import type { BusinessApplication } from "../types/businessApplication";
import type { BusinessStats } from "../types/owner";
import { UnauthorizedError } from "./admin";
import { readProblemMessage } from "./problem";

const API_BASE_URL = "http://localhost:5171";

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
