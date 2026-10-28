interface ProblemDetails {
    title?: string;
    errors?: Record<string, string[]>;
}

// API'nin döndüğü ProblemDetails gövdesinden kullanıcıya gösterilecek
// Türkçe mesajı çıkarır. Doğrulama hataları varsa onlar birleştirilir.
export async function readProblemMessage(
    response: Response,
    fallback: string
): Promise<string> {
    let problem: ProblemDetails | null = null;

    try {
        problem = await response.json();
    } catch {
        // Gövde JSON değilse genel mesaj gösterilir.
    }

    const messages = problem?.errors
        ? Object.values(problem.errors).flat()
        : [];

    if (messages.length > 0) {
        return messages.join(" ");
    }

    return problem?.title ?? fallback;
}
