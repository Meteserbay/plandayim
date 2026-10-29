using System.ComponentModel.DataAnnotations;

namespace Plandayim.Application.OwnerBusinesses;

public enum CampaignVisibility
{
    Live = 1,
    Scheduled = 2,
    Expired = 3,
    Disabled = 4
}

// Tarihler Türkiye saatine göre gün olarak tutulur: başlangıç günü 00:00,
// bitiş günü 23:59 dahil.
public sealed record OwnerCampaignDto(
    long Id,
    string Title,
    string Code,
    string Description,
    DateOnly? StartsOn,
    DateOnly? EndsOn,
    bool IsActive,
    CampaignVisibility Visibility);

public sealed class SaveCampaignRequest
{
    [Required(ErrorMessage = "Kampanya başlığı zorunludur.")]
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir.")]
    public string Title { get; init; } = null!;

    [Required(ErrorMessage = "Kampanya kodu zorunludur.")]
    [RegularExpression(
        @"^[A-Za-z0-9-]{3,50}$",
        ErrorMessage = "Kod 3-50 karakter olmalı; sadece harf, rakam ve tire içerebilir.")]
    public string Code { get; init; } = null!;

    [Required(ErrorMessage = "Kampanya açıklaması zorunludur.")]
    [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir.")]
    public string Description { get; init; } = null!;

    public DateOnly? StartsOn { get; init; }

    public DateOnly? EndsOn { get; init; }
}
