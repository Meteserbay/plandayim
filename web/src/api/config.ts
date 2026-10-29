// API adresi ortama göre .env dosyasındaki VITE_API_BASE_URL ile verilir.
// Ayarlanmamışsa yerel geliştirme adresi kullanılır.
export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5171";
