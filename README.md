# Plandayim

Turkiye'nin organizasyon firmalarini musterilerle bulusturan modern platform.

## Tech Stack

- ASP.NET Core 9
- Entity Framework Core
- SQL Server
- React
- TypeScript

## Admin paneli

Panel `http://localhost:5173/admin` adresinde. Tek bir admin hesabı vardır ve
bilgileri kaynak koda yazılmaz. Geliştirme ortamında user-secrets ile ayarla:

```bash
dotnet user-secrets set "Admin:Email" "admin@ornek.com" --project src/Plandayim.Api
dotnet user-secrets set "Admin:Password" "guclu-bir-sifre" --project src/Plandayim.Api
```

Sunucuda `Admin__Email` ve `Admin__Password` ortam değişkenlerini kullan.
Giriş denemeleri IP başına dakikada 5 ile sınırlıdır.

## Ortam ayarları

Yerel geliştirmede hiçbirini ayarlamak gerekmez; varsayılanlar `localhost`
adreslerini kullanır. Yayına alırken:

| Ayar | Nerede | Açıklama |
|---|---|---|
| `VITE_API_BASE_URL` | `web/.env.local` (örnek: `web/.env.example`) | Frontend'in istek attığı API adresi |
| `Cors:AllowedOrigins` | API ayarları | Sitenin adresi(leri); çerezli istekler sadece bu adreslerden kabul edilir |
| `Storage:PublicBaseUrl` | API ayarları | Yüklenen görsellerin dışarıdan erişilen adresi (`https://api.ornek.com/uploads`) |
| `Storage:RootPath` | API ayarları | Görsellerin diske yazılacağı klasör (varsayılan `wwwroot/uploads`) |

## Status

🚧 In Development