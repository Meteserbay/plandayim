// Yasal metinlerde geçen veri sorumlusu bilgileri. Boş bırakılan alanlar
// metinlerde gösterilmez. KVKK aydınlatma metninde veri sorumlusunun kimliği
// ve iletişim bilgisi bulunmalıdır; en kısa sürede doldurulmalı ve metinler
// bir hukukçuya kontrol ettirilmelidir.
export const LEGAL_INFO = {
    controllerName: "",
    address: "",
    email: "",
    lastUpdated: "10 Kasım 2026",
};

// Başvuru ve sorular için metin içinde kullanılan iletişim ifadesi.
export function contactPhrase(): string {
    if (LEGAL_INFO.email) {
        return `${LEGAL_INFO.email} adresine e-posta ile`;
    }

    if (LEGAL_INFO.address) {
        return `${LEGAL_INFO.address} adresine yazılı olarak`;
    }

    return "Plandayım'a yazılı olarak";
}
