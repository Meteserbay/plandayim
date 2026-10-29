import type { City, District } from "../types/location";
import { API_BASE_URL } from "./config";

export async function getCities(): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/api/cities`);

    if (!response.ok) {
        throw new Error("Şehirler alınamadı.");
    }

    return response.json();
}

export async function getDistricts(cityId: number): Promise<District[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/cities/${cityId}/districts`
    );

    if (!response.ok) {
        throw new Error("İlçeler alınamadı.");
    }

    return response.json();
}