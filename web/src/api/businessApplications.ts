import type { CreateBusinessApplicationRequest } from "../types/businessApplication";

const API_BASE_URL = "http://localhost:5171";

interface ProblemDetails {
    title?: string;
    errors?: Record<string, string[]>;
}

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

    if (response.ok) {
        return;
    }

    let problem: ProblemDetails | null = null;

    try {
        problem = await response.json();
    } catch {
        // Gövde JSON değilse genel mesaj gösterilir.
    }

    const messages = problem?.errors
        ? Object.values(problem.errors).flat()
        : [];

    throw new Error(
        messages.length > 0
            ? messages.join(" ")
            : problem?.title ?? "Başvuru gönderilemedi. Lütfen tekrar dene."
    );
}
