export const BusinessApplicationType = {
    AddBusiness: 1,
    ClaimBusiness: 2,
} as const;

export type BusinessApplicationType =
    (typeof BusinessApplicationType)[keyof typeof BusinessApplicationType];

export const BusinessApplicationStatus = {
    Pending: 1,
    Approved: 2,
    Rejected: 3,
} as const;

export type BusinessApplicationStatus =
    (typeof BusinessApplicationStatus)[keyof typeof BusinessApplicationStatus];

export interface CreateBusinessApplicationRequest {
    businessId?: number | null;
    businessName: string;
    contactName: string;
    phoneNumber: string;
    email: string;
    message?: string | null;
    type: BusinessApplicationType;
}

export interface BusinessApplication {
    id: number;
    type: BusinessApplicationType;
    status: BusinessApplicationStatus;
    businessId?: number | null;
    businessSlug?: string | null;
    businessName: string;
    contactName: string;
    phoneNumber: string;
    email: string;
    message?: string | null;
    applicantUserId?: number | null;
    applicantEmail?: string | null;
    createdAtUtc: string;
    updatedAtUtc?: string | null;
}

export interface ApproveBusinessApplicationRequest {
    cityId?: number;
    districtId?: number;
    categoryIds?: number[];
    primaryCategoryId?: number;
    serviceAreaDistrictIds?: number[];
    description?: string | null;
    address?: string | null;
}
