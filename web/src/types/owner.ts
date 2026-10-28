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

export interface BusinessStats {
    days: number;
    totals: InteractionTotals;
    previousTotals: InteractionTotals;
    daily: DailyInteractions[];
}
