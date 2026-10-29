using System.ComponentModel.DataAnnotations;

namespace Plandayim.Application.BusinessApplications;

/// <summary>
/// Onay sırasında admin'in girdiği firma bilgileri.
/// Sadece "işletme ekle" başvurularında kullanılır; sahiplenme
/// başvurularında gövde boş gönderilebilir.
/// </summary>
public sealed class ApproveBusinessApplicationRequest
{
    public long? CityId { get; init; }

    public long? DistrictId { get; init; }

    public IReadOnlyList<long> CategoryIds { get; init; } = [];

    public long? PrimaryCategoryId { get; init; }

    public IReadOnlyList<long> ServiceAreaDistrictIds { get; init; } = [];

    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olabilir.")]
    public string? Description { get; init; }

    [MaxLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir.")]
    public string? Address { get; init; }
}
