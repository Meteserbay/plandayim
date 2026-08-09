export interface BusinessCampaign {
    title: string;
    code: string;
    description: string;
    startsAtUtc?: string | null;
    endsAtUtc?: string | null;
}

export interface BusinessImage {
    url: string;
    altText?: string | null;
    sortOrder: number;
    isCover: boolean;
}

export interface BusinessDetail {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    phoneNumber: string;
    whatsAppNumber?: string | null;
    email?: string | null;
    websiteUrl?: string | null;
    address?: string | null;
    logoUrl?: string | null;

    cityId: number;
    cityName: string;

    districtId: number;
    districtName: string;

    latitude?: number | null;
    longitude?: number | null;

    isVerified: boolean;

    categories: string[];
    serviceAreas: string[];
    campaigns: BusinessCampaign[];
    images: BusinessImage[];
}

export interface BusinessListItem {
    id: number;
    name: string;
    slug: string;
    phoneNumber: string;
    whatsAppNumber?: string | null;
    address?: string | null;

    logoUrl?: string | null;
    coverImageUrl?: string | null;

    cityId: number;
    cityName: string;

    districtId: number;
    districtName: string;

    isVerified: boolean;

    primaryCategory?: string | null;

    hasActiveCampaign: boolean;
}