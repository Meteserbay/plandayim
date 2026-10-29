import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { UnauthorizedError } from "../../api/admin";
import {
    deleteImage,
    deleteLogo,
    getImages,
    reorderImages,
    setCoverImage,
    uploadImage,
    uploadLogo,
} from "../../api/owner";
import type { OwnerImages } from "../../types/owner";

const acceptedTypes = "image/jpeg,image/png,image/webp";
const maxBytes = 5 * 1024 * 1024;

interface ImagesTabProps {
    businessId: number;
    onError: (error: unknown) => void;
}

function ImagesTab({ businessId, onError }: ImagesTabProps) {
    const [data, setData] = useState<OwnerImages | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const galleryInput = useRef<HTMLInputElement | null>(null);
    const logoInput = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        let isCancelled = false;

        getImages(businessId)
            .then((result) => {
                if (!isCancelled) {
                    setData(result);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    onError(error);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [businessId, onError]);

    async function run(key: string, action: () => Promise<OwnerImages>) {
        setMessage("");
        setBusy(key);

        try {
            setData(await action());
            setConfirmDeleteId(null);
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                onError(error);
                return;
            }

            setMessage(error instanceof Error ? error.message : "İşlem yapılamadı.");
        } finally {
            setBusy(null);
        }
    }

    // Seçilen dosyaları sunucuya göndermeden önce boyutu kontrol eder;
    // tür kontrolünün asıl yeri sunucudur.
    function pickFiles(event: ChangeEvent<HTMLInputElement>): File[] {
        const files = [...(event.target.files ?? [])];
        event.target.value = "";

        const tooLarge = files.find((file) => file.size > maxBytes);

        if (tooLarge) {
            setMessage(`"${tooLarge.name}" 5 MB'tan büyük.`);
            return [];
        }

        return files;
    }

    async function handleGalleryFiles(event: ChangeEvent<HTMLInputElement>) {
        const files = pickFiles(event);

        // Dosyalar sırayla yüklenir; biri hata verirse kalanlar durur.
        for (const file of files) {
            let failed = false;

            await run("upload", async () => {
                try {
                    return await uploadImage(businessId, file);
                } catch (error) {
                    failed = true;
                    throw error;
                }
            });

            if (failed) {
                break;
            }
        }
    }

    async function handleLogoFile(event: ChangeEvent<HTMLInputElement>) {
        const [file] = pickFiles(event);

        if (file) {
            await run("logo", () => uploadLogo(businessId, file));
        }
    }

    function move(index: number, direction: -1 | 1) {
        if (!data) {
            return;
        }

        const ids = data.images.map((image) => image.id);
        const target = index + direction;

        [ids[index], ids[target]] = [ids[target], ids[index]];

        void run(`move-${ids[target]}`, () => reorderImages(businessId, ids));
    }

    if (!data) {
        return <p className="admin-muted owner-section">Yükleniyor...</p>;
    }

    const isFull = data.images.length >= data.maxImages;

    return (
        <section className="owner-section">
            <div className="owner-section-header">
                <h2>Görseller</h2>
            </div>

            <p className="admin-muted owner-intro">
                JPEG, PNG veya WebP; her biri en fazla 5 MB. Kapak görseli
                profilinin en üstünde ve arama sonuçlarında görünür.
            </p>

            {message && (
                <p className="form-error owner-message" role="alert">
                    {message}
                </p>
            )}

            <div className="detail-card owner-logo">
                <div className="owner-logo-preview">
                    {data.logoUrl ? (
                        <img src={data.logoUrl} alt="İşletme logosu" />
                    ) : (
                        <span>Logo yok</span>
                    )}
                </div>

                <div>
                    <h3 className="owner-card-title">Logo</h3>

                    <div className="admin-actions">
                        <button
                            type="button"
                            className="admin-button admin-button-approve"
                            disabled={busy !== null}
                            onClick={() => logoInput.current?.click()}
                        >
                            {busy === "logo"
                                ? "Yükleniyor..."
                                : data.logoUrl
                                  ? "Logoyu değiştir"
                                  : "Logo yükle"}
                        </button>

                        {data.logoUrl && (
                            <button
                                type="button"
                                className="admin-button"
                                disabled={busy !== null}
                                onClick={() =>
                                    run("logo-delete", () => deleteLogo(businessId))
                                }
                            >
                                Kaldır
                            </button>
                        )}
                    </div>

                    <input
                        ref={logoInput}
                        type="file"
                        accept={acceptedTypes}
                        hidden
                        onChange={handleLogoFile}
                    />
                </div>
            </div>

            <div className="detail-card">
                <div className="owner-section-header">
                    <h3 className="owner-card-title">
                        Galeri ({data.images.length}/{data.maxImages})
                    </h3>

                    <button
                        type="button"
                        className="admin-button admin-button-approve"
                        disabled={busy !== null || isFull}
                        onClick={() => galleryInput.current?.click()}
                    >
                        {busy === "upload" ? "Yükleniyor..." : "+ Görsel ekle"}
                    </button>

                    <input
                        ref={galleryInput}
                        type="file"
                        accept={acceptedTypes}
                        multiple
                        hidden
                        onChange={handleGalleryFiles}
                    />
                </div>

                {data.images.length === 0 ? (
                    <div className="empty-state">
                        Henüz görsel yok. İşlerinden örnekler eklemek profilini
                        çok daha çekici yapar.
                    </div>
                ) : (
                    <div className="owner-gallery">
                        {data.images.map((image, index) => (
                            <figure key={image.id} className="owner-gallery-item">
                                <div className="owner-gallery-image">
                                    <img src={image.url} alt={image.altText ?? ""} />

                                    {image.isCover && (
                                        <span className="owner-cover-badge">Kapak</span>
                                    )}
                                </div>

                                {confirmDeleteId === image.id ? (
                                    <figcaption className="admin-actions">
                                        <button
                                            type="button"
                                            className="admin-button admin-button-reject"
                                            disabled={busy !== null}
                                            onClick={() =>
                                                run(`delete-${image.id}`, () =>
                                                    deleteImage(businessId, image.id)
                                                )
                                            }
                                        >
                                            Evet, sil
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-button"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            Vazgeç
                                        </button>
                                    </figcaption>
                                ) : (
                                    <figcaption className="admin-actions">
                                        <button
                                            type="button"
                                            className="admin-button icon-button"
                                            aria-label="Sola taşı"
                                            disabled={busy !== null || index === 0}
                                            onClick={() => move(index, -1)}
                                        >
                                            ←
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-button icon-button"
                                            aria-label="Sağa taşı"
                                            disabled={
                                                busy !== null ||
                                                index === data.images.length - 1
                                            }
                                            onClick={() => move(index, 1)}
                                        >
                                            →
                                        </button>

                                        {!image.isCover && (
                                            <button
                                                type="button"
                                                className="admin-button"
                                                disabled={busy !== null}
                                                onClick={() =>
                                                    run(`cover-${image.id}`, () =>
                                                        setCoverImage(businessId, image.id)
                                                    )
                                                }
                                            >
                                                Kapak yap
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="admin-button admin-button-reject"
                                            disabled={busy !== null}
                                            onClick={() => setConfirmDeleteId(image.id)}
                                        >
                                            Sil
                                        </button>
                                    </figcaption>
                                )}
                            </figure>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default ImagesTab;
