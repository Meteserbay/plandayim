namespace Plandayim.Application.OwnerBusinesses;

public sealed record BusinessStatsDto(
    int Days,
    InteractionTotalsDto Totals,
    InteractionTotalsDto PreviousTotals,
    IReadOnlyList<DailyInteractionsDto> Daily);

public sealed record InteractionTotalsDto(
    int ProfileViews,
    int PhoneClicks,
    int WhatsAppClicks,
    int WebsiteClicks,
    int CampaignCodeCopies);

public sealed record DailyInteractionsDto(
    DateOnly Date,
    int ProfileViews,
    int ContactClicks);
