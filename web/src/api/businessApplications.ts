import type { CreateBusinessApplicationRequest } from "../types/businessApplication";
import { readProblemMessage } from "./problem";
import { API_BASE_URL } from "./config";

export async function createBusinessApplication(
    request: CreateBusinessApplicationRequest
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/api/business-applications`,
        {
            method: "POST",
            // Başvuru giriş yapmış hesaba bağlanır.
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }
    );

    if (response.status === 401) {
        throw new Error("Oturumun sona ermiş. Lütfen tekrar giriş yap.");
    }

    if (!response.ok) {
        throw new Error(
            await readProblemMessage(
                response,
                "Başvuru gönderilemedi. Lütfen tekrar dene."
            )
        );
    }
}
