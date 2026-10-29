export const BusinessApplicationType = {
    AddBusiness: 1,
    ClaimBusiness: 2,
} as const;

export type BusinessApplicationType =
    (typeof BusinessApplicationType)[keyof typeof BusinessApplicationType];

export interface CreateBusinessApplicationRequest {
    businessId?: number | null;
    businessName: string;
    contactName: string;
    phoneNumber: string;
    email: string;
    message?: string | null;
    type: BusinessApplicationType;
}
