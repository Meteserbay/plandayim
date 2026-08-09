import type { City, District } from "../types/location";

const API_BASE_URL = "http://localhost:5171";

export async function getCities(): Promise<City[]> {
    const response = await fetch(`${API_BASE_URL}/api/cities`);

    if (!response.ok) {
        throw new Error("Þehirler alýnamadý.");
    }

    return response.json();
}

export async function getDistricts(cityId: number): Promise<District[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/cities/${cityId}/districts`
    );

    if (!response.ok) {
        throw new Error("Ýlçeler alýnamadý.");
    }

    return response.json();
}