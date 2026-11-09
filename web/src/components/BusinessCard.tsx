import { Link } from "react-router";
import type { BusinessListItem } from "../types/business";

function BusinessCard({ business }: { business: BusinessListItem }) {
    return (
        <article className="business-card">
            {business.coverImageUrl ? (
                <img
                    className="business-card-image"
                    src={business.coverImageUrl}
                    alt={business.name}
                />
            ) : (
                // Kapak görseli olmayan kartlar da aynı hizada dursun.
                <div className="business-card-placeholder" aria-hidden="true">
                    {business.name.charAt(0)}
                </div>
            )}

            <div className="business-card-body">
                <div className="business-card-header">
                    <h3>{business.name}</h3>

                    {business.isVerified && (
                        <span className="verified-mini">
                            ✓
                        </span>
                    )}
                </div>

                {business.primaryCategory && (
                    <p className="business-category">
                        {business.primaryCategory}
                    </p>
                )}

                <p className="business-meta">
                    {business.cityName} / {business.districtName}
                </p>

                {business.hasActiveCampaign && (
                    <div className="campaign-badge">
                        Plandayım avantajı var
                    </div>
                )}

                <Link
                    className="details-link"
                    to={`/business/${business.slug}`}
                >
                    Detayları Gör
                </Link>
            </div>
        </article>
    );
}

export default BusinessCard;
