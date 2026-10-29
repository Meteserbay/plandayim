import type { Category } from "../types/category";
import { API_BASE_URL } from "./config";

export async function getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);

    if (!response.ok) {
        throw new Error("Kategoriler alınamadı.");
    }

    return response.json();
}