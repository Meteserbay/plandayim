using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Plandayim.Application.Common;

namespace Plandayim.Api.ErrorHandling;

public sealed class ApiExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<ApiExceptionHandler> _logger;

    public ApiExceptionHandler(
        IProblemDetailsService problemDetailsService,
        ILogger<ApiExceptionHandler> logger)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            RequestValidationException =>
                (StatusCodes.Status400BadRequest, exception.Message),
            KeyNotFoundException =>
                (StatusCodes.Status404NotFound, "Kayıt bulunamadı."),
            ArgumentException =>
                (StatusCodes.Status400BadRequest, "Gönderilen bilgiler geçersiz."),
            // InvalidOperationException bilerek eşlenmez: EF Core sorgu
            // hataları da bu tipte olduğu için 500 olarak loglanmalı.
            _ =>
                (StatusCodes.Status500InternalServerError, "Beklenmeyen bir hata oluştu.")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception");
        }

        httpContext.Response.StatusCode = statusCode;

        return await _problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                Exception = exception,
                ProblemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = title
                }
            });
    }
}
