namespace Plandayim.Application.Common;

/// <summary>
/// Kullanıcıya gösterilebilecek (Türkçe) bir doğrulama hatası.
/// API katmanında 400 Bad Request olarak döner ve mesajı aynen iletilir.
/// </summary>
public sealed class RequestValidationException : Exception
{
    public RequestValidationException(string message)
        : base(message)
    {
    }
}
