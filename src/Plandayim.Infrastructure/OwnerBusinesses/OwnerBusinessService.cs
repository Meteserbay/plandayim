using Microsoft.EntityFrameworkCore;
using Plandayim.Application.Common;
using Plandayim.Application.OwnerBusinesses;
using Plandayim.Domain.Businesses;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Infrastructure.OwnerBusinesses;

public sealed class OwnerBusinessService : IOwnerBusinessService
{
    private static readonly int[] AllowedStatsDays = [7, 30, 90];

    // Türkiye yaz saati uygulamadığı için sabit UTC+3 kullanılır.
    private const int TurkeyUtcOffsetHours = 3;

    private readonly PlandayimDbContext _dbContext;

    public OwnerBusinessService(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BusinessStatsDto> GetStatsAsync(
        long userId,
        long businessId,
        int days,
        CancellationToken cancellationToken = default)
    {
        if (!AllowedStatsDays.Contains(days))
        {
            throw new RequestValidationException(
                "Geçersiz tarih aralığı. 7, 30 veya 90 gün seçilebilir.");
        }

        await EnsureOwnerAsync(userId, businessId, cancellationToken);

        var today = DateOnly.FromDateTime(
            DateTime.UtcNow.AddHours(TurkeyUtcOffsetHours));
        var firstDay = today.AddDays(-(days - 1));
        var previousFirstDay = firstDay.AddDays(-days);

        var periodStartUtc = ToUtc(firstDay);
        var previousStartUtc = ToUtc(previousFirstDay);

        // Seçilen dönem ve bir önceki eşit uzunluktaki dönem tek sorguda
        // günlük ve tür bazında gruplanır.
        var rows = await _dbContext.BusinessInteractions
            .AsNoTracking()
            .Where(x =>
                x.BusinessId == businessId &&
                x.CreatedAtUtc >= previousStartUtc)
            .GroupBy(x => new
            {
                Day = x.CreatedAtUtc.AddHours(TurkeyUtcOffsetHours).Date,
                x.Type
            })
            .Select(g => new InteractionCountRow(
                g.Key.Day,
                g.Key.Type,
                g.Count()))
            .ToListAsync(cancellationToken);

        var current = rows
            .Where(x => x.Day >= firstDay.ToDateTime(TimeOnly.MinValue))
            .ToList();
        var previous = rows
            .Where(x => x.Day < firstDay.ToDateTime(TimeOnly.MinValue))
            .ToList();

        var daily = Enumerable.Range(0, days)
            .Select(offset =>
            {
                var date = firstDay.AddDays(offset);
                var dayRows = current
                    .Where(x => DateOnly.FromDateTime(x.Day) == date)
                    .ToList();

                return new DailyInteractionsDto(
                    date,
                    Sum(dayRows, BusinessInteractionType.ProfileView),
                    Sum(dayRows, BusinessInteractionType.Phone) +
                    Sum(dayRows, BusinessInteractionType.WhatsApp) +
                    Sum(dayRows, BusinessInteractionType.Website));
            })
            .ToList();

        return new BusinessStatsDto(
            days,
            ToTotals(current),
            ToTotals(previous),
            daily);

        static int Sum(
            IEnumerable<InteractionCountRow> source,
            BusinessInteractionType type)
        {
            return source
                .Where(x => x.Type == type)
                .Sum(x => x.Count);
        }

        static InteractionTotalsDto ToTotals(
            IReadOnlyCollection<InteractionCountRow> source)
        {
            return new InteractionTotalsDto(
                Sum(source, BusinessInteractionType.ProfileView),
                Sum(source, BusinessInteractionType.Phone),
                Sum(source, BusinessInteractionType.WhatsApp),
                Sum(source, BusinessInteractionType.Website),
                Sum(source, BusinessInteractionType.CampaignCodeCopy));
        }

        DateTime ToUtc(DateOnly turkeyDate)
        {
            return turkeyDate
                .ToDateTime(TimeOnly.MinValue)
                .AddHours(-TurkeyUtcOffsetHours);
        }
    }

    private async Task EnsureOwnerAsync(
        long userId,
        long businessId,
        CancellationToken cancellationToken)
    {
        var isOwner = await _dbContext.Businesses
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == businessId && x.OwnerUserId == userId,
                cancellationToken);

        if (!isOwner)
        {
            throw new KeyNotFoundException("Business not found.");
        }
    }

    private sealed record InteractionCountRow(
        DateTime Day,
        BusinessInteractionType Type,
        int Count);
}
