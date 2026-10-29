using System.Globalization;
using System.Text;

namespace Plandayim.Infrastructure.Common;

public static class SlugGenerator
{
    private static readonly Dictionary<char, string> TurkishMap = new()
    {
        ['ç'] = "c",
        ['ğ'] = "g",
        ['ı'] = "i",
        ['ö'] = "o",
        ['ş'] = "s",
        ['ü'] = "u"
    };

    public static string Generate(string value)
    {
        var lower = value.Trim().ToLower(new CultureInfo("tr-TR"));
        var builder = new StringBuilder(lower.Length);
        var lastWasDash = true;

        foreach (var character in lower)
        {
            if (TurkishMap.TryGetValue(character, out var replacement))
            {
                builder.Append(replacement);
                lastWasDash = false;
            }
            else if (character is >= 'a' and <= 'z' or >= '0' and <= '9')
            {
                builder.Append(character);
                lastWasDash = false;
            }
            else if (!lastWasDash)
            {
                builder.Append('-');
                lastWasDash = true;
            }
        }

        var slug = builder.ToString().TrimEnd('-');

        return slug.Length == 0 ? "isletme" : slug;
    }
}
