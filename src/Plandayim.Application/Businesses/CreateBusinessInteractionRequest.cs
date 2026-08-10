using Plandayim.Domain.Businesses;

namespace Plandayim.Application.Businesses;

public sealed class CreateBusinessInteractionRequest
{
    public BusinessInteractionType Type { get; init; }
}