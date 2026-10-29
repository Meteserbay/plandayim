export interface InteractionTotals {
    profileViews: number;
    phoneClicks: number;
    whatsAppClicks: number;
    websiteClicks: number;
    campaignCodeCopies: number;
}

export interface DailyInteractions {
    // "YYYY-MM-DD" (Türkiye saatiyle gün)
    date: string;
    profileViews: number;
    contactClicks: number;
}

export interface OwnerBusinessProfile {
    name: string;
    description?: string | null;
    phoneNumber: string;
    whatsAppNumber?: string | null;
    email?: string | null;
    websiteUrl?: string | null;
    address?: string | null;
}

export type UpdateBusinessProfileRequest = Omit<OwnerBusinessProfile, "name">;

export const CampaignVisibility = {
    Live: 1,
    Scheduled: 2,
    Expired: 3,
    Disabled: 4,
} as const;

export type CampaignVisibility =
    (typeof CampaignVisibility)[keyof typeof CampaignVisibility];

export interface OwnerCampaign {
    id: number;
    title: string;
    code: string;
    description: string;
    // "YYYY-MM-DD"
    startsOn?: string | null;
    endsOn?: string | null;
    isActive: boolean;
    visibility: CampaignVisibility;
}

export interface SaveCampaignRequest {
    title: string;
    code: string;
    description: string;
    startsOn?: string | null;
    endsOn?: string | null;
}

export interface BusinessStats {
    days: number;
    totals: InteractionTotals;
    previousTotals: InteractionTotals;
    daily: DailyInteractions[];
}
