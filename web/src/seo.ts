import { useEffect } from "react";

export const SITE_NAME = "Plandayım";

export const DEFAULT_DESCRIPTION =
    "Düğün, nişan, kına, doğum günü ve tüm organizasyonların için " +
    "fotoğrafçı, mekân, catering ve daha fazlasını şehrinde bul. " +
    "Firmaları karşılaştır, doğrudan iletişime geç.";

interface PageMeta {
    // Boş bırakılırsa ana sayfa başlığı kullanılır.
    title?: string;
    description?: string;
    // Giriş, panel ve admin gibi sayfalar arama motorlarında listelenmez.
    noIndex?: boolean;
}

function setMetaTag(name: string, content: string | null) {
    let tag = document.head.querySelector<HTMLMetaElement>(
        `meta[name="${name}"]`
    );

    if (content === null) {
        tag?.remove();
        return;
    }

    if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
    }

    tag.content = content;
}

// Sayfanın tarayıcı sekmesindeki başlığını, açıklamasını ve arama motoru
// iznini ayarlar.
export function usePageMeta({ title, description, noIndex }: PageMeta) {
    useEffect(() => {
        document.title = title
            ? `${title} | ${SITE_NAME}`
            : `${SITE_NAME} – Organizasyon firmalarını tek yerde bul`;

        setMetaTag("description", description ?? DEFAULT_DESCRIPTION);
        setMetaTag("robots", noIndex ? "noindex" : null);
    }, [title, description, noIndex]);
}
