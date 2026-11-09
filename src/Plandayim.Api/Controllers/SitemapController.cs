using System.Text;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Plandayim.Infrastructure.Persistence;

namespace Plandayim.Api.Controllers;

// Arama motorlarının yayındaki firma profillerini bulabilmesi için site
// haritası. Adresler isteğin geldiği alan adıyla üretilir (Cloudflare
// arkasında https://plandayim.com.tr).
[ApiController]
public sealed class SitemapController : ControllerBase
{
    private static readonly XNamespace Ns =
        "http://www.sitemaps.org/schemas/sitemap/0.9";

    private static readonly string[] StaticPaths =
        ["/", "/firmalar-icin", "/kvkk", "/gizlilik", "/kullanim-kosullari"];

    private readonly PlandayimDbContext _dbContext;

    public SitemapController(PlandayimDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("/sitemap.xml")]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var slugs = await _dbContext.Businesses
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Slug)
            .Select(x => x.Slug)
            .ToListAsync(cancellationToken);

        var urls = StaticPaths
            .Concat(slugs.Select(slug => $"/business/{Uri.EscapeDataString(slug)}"))
            .Select(path => new XElement(Ns + "url",
                new XElement(Ns + "loc", baseUrl + path)));

        var document = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            new XElement(Ns + "urlset", urls));

        return Content(
            document.Declaration + Environment.NewLine + document.Root,
            "application/xml",
            Encoding.UTF8);
    }
}
