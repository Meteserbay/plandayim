import type { Account } from "../types/account";
import { readProblemMessage } from "./problem";
import { API_BASE_URL } from "./config";

const tooManyRequestsMessage =
    "Çok fazla deneme yaptın. Bir dakika sonra tekrar dene.";

async function postAccount(
    path: string,
    body: unknown,
    fallbackError: string
): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/api/account/${path}`, {
        method: "POST",
        // Oturum çerezinin kaydedilmesi ve gönderilmesi için gerekli.
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (response.status === 429) {
        throw new Error(tooManyRequestsMessage);
    }

    if (!response.ok) {
        throw new Error(await readProblemMessage(response, fallbackError));
    }

    return response.json();
}

export function register(
    fullName: string,
    email: string,
    password: string
): Promise<Account> {
    return postAccount(
        "register",
        { fullName, email, password },
        "Hesap oluşturulamadı."
    );
}

export function login(email: string, password: string): Promise<Account> {
    return postAccount("login", { email, password }, "Giriş yapılamadı.");
}

export async function logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/api/account/logout`, {
        method: "POST",
        credentials: "include",
    });
}

// Giriş yapılmamışsa null döner.
export async function getCurrentAccount(): Promise<Account | null> {
    const response = await fetch(`${API_BASE_URL}/api/account/me`, {
        credentials: "include",
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Hesap bilgisi alınamadı.");
    }

    return response.json();
}
