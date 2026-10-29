import { useEffect, useState } from "react";
import { getBusinessStats } from "../../api/owner";
import type { BusinessStats, InteractionTotals } from "../../types/owner";
import DailyChart from "./DailyChart";

const dayOptions = [7, 30, 90];

const metrics: { key: keyof InteractionTotals; label: string }[] = [
    { key: "profileViews", label: "Profil görüntülenmesi" },
    { key: "phoneClicks", label: "Arama tıklaması" },
    { key: "whatsAppClicks", label: "WhatsApp tıklaması" },
    { key: "websiteClicks", label: "Web sitesi tıklaması" },
    { key: "campaignCodeCopies", label: "Kampanya kodu kopyalama" },
];

function describeChange(current: number, previous: number, days: number) {
    if (previous === 0) {
        return current === 0
            ? `Önceki ${days} günde de yok`
            : `Önceki ${days} günde yoktu`;
    }

    const change = Math.round(((current - previous) / previous) * 100);

    if (change === 0) {
        return `Önceki ${days} günle aynı`;
    }

    return `${change > 0 ? "▲" : "▼"} %${Math.abs(change)} önceki ${days} güne göre`;
}

interface StatsTabProps {
    businessId: number;
    onError: (error: unknown) => void;
}

function StatsTab({ businessId, onError }: StatsTabProps) {
    const [days, setDays] = useState(30);
    const [stats, setStats] = useState<BusinessStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        setIsLoading(true);

        getBusinessStats(businessId, days)
            .then((result) => {
                if (!isCancelled) {
                    setStats(result);
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    onError(error);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [businessId, days, onError]);

    return (
        <section className="owner-section">
            <div className="owner-section-header">
                <h2>İstatistikler</h2>

                <div className="admin-tabs" role="group" aria-label="Tarih aralığı">
                    {dayOptions.map((option) => (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={days === option}
                            className={
                                days === option
                                    ? "admin-tab admin-tab-active"
                                    : "admin-tab"
                            }
                            onClick={() => setDays(option)}
                        >
                            Son {option} gün
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && !stats ? (
                <p className="admin-muted">Yükleniyor...</p>
            ) : stats ? (
                <div className={isLoading ? "owner-stats is-refreshing" : "owner-stats"}>
                    <div className="stat-grid">
                        {metrics.map((metric) => (
                            <div className="detail-card stat-tile" key={metric.key}>
                                <span className="stat-label">{metric.label}</span>

                                <span className="stat-value">
                                    {stats.totals[metric.key].toLocaleString("tr-TR")}
                                </span>

                                <span className="stat-change">
                                    {describeChange(
                                        stats.totals[metric.key],
                                        stats.previousTotals[metric.key],
                                        stats.days
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="detail-card">
                        <h3 className="owner-card-title">Günlük etkileşim</h3>

                        <DailyChart data={stats.daily} />
                    </div>

                    <p className="admin-muted">
                        Kendi profilini ziyaret etmen istatistiklere sayılmaz.
                        İletişim tıklaması; arama, WhatsApp ve web sitesi
                        tıklamalarının toplamıdır.
                    </p>
                </div>
            ) : null}
        </section>
    );
}

export default StatsTab;
