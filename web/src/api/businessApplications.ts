import type { CreateBusinessApplicationRequest } from "../types/businessApplication";
import { readProblemMessage } from "./problem";

const API_BASE_URL = "http://localhost:5171";

export async function createBusinessApplication(
    request: CreateBusinessApplicationRequest
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/api/business-applications`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        throw new Error(
            await readProblemMessage(
                response,
                "Başvuru gönderilemedi. Lütfen tekrar dene."
            )
        );
    }
}
