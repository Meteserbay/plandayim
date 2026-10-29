export interface AdminBusinessListItem {
    id: number;
    name: string;
    slug: string;
    cityName: string;
    districtName: string;
    primaryCategory?: string | null;
    isActive: boolean;
    isVerified: boolean;
    ownerEmail?: string | null;
    createdAtUtc: string;
}

export interface AdminBusinessList {
    items: AdminBusinessListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface AdminBusinessDetail {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    phoneNumber: string;
    whatsAppNumber?: string | null;
    email?: string | null;
    websiteUrl?: string | null;
    address?: string | null;
    cityId: number;
    districtId: number;
    categoryIds: number[];
    primaryCategoryId?: number | null;
    serviceAreaDistrictIds: number[];
    isActive: boolean;
    isVerified: boolean;
    ownerUserId?: number | null;
    ownerEmail?: string | null;
    ownerFullName?: string | null;
}

export interface UpdateAdminBusinessRequest {
    name: string;
    slug: string;
    description?: string | null;
    phoneNumber: string;
    whatsAppNumber?: string | null;
    email?: string | null;
    websiteUrl?: string | null;
    address?: string | null;
    cityId: number;
    districtId: number;
    categoryIds: number[];
    primaryCategoryId: number;
    serviceAreaDistrictIds: number[];
}
