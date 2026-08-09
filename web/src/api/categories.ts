import type { Category } from "../types/category";

const API_BASE_URL = "http://localhost:5171";

export async function getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);

    if (!response.ok) {
        throw new Error("Kategoriler alýnamadý.");
    }

    return response.json();
}