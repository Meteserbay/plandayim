import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    UnauthorizedError,
    approveBusinessApplication,
    getBusinessApplications,
    rejectBusinessApplication,
} from "../api/admin";
import AdminLayout from "../components/AdminLayout";
import ApproveBusinessForm from "../components/ApproveBusinessForm";
import {
    BusinessApplicationStatus,
    BusinessApplicationType,
    type BusinessApplication,
} from "../types/businessApplication";

const statusFilters: { label: string; value?: BusinessApplicationStatus }[] = [
    { label: "Bekleyen", value: BusinessApplicationStatus.Pending },
    { label: "Onaylanan", value: BusinessApplicationStatus.Approved },
    { label: "Reddedilen", value: BusinessApplicationStatus.Rejected },
    { label: "Tümü" },
];

const statusLabels: Record<BusinessApplicationStatus, string> = {
    [BusinessApplicationStatus.Pending]: "Bekliyor",
    [BusinessApplicationStatus.Approved]: "Onaylandı",
    [BusinessApplicationStatus.Rejected]: "Reddedildi",
};

// Onay/red butonları iki adımlıdır: önce "Emin misin?" sorulur.
type PendingAction = { id: number; action: "approve" | "reject" };

function formatDate(value: string) {
    // API UTC tarihleri saat dilimi işareti olmadan döndürüyor.
    const utc = value.endsWith("Z") ? value : `${value}Z`;

    return new Date(utc).toLocaleString("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function AdminApplicationsPage() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<
        BusinessApplicationStatus | undefined
    >(BusinessApplicationStatus.Pending);
    const [applications, setApplications] = useState<BusinessApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const handleError = useCallback(
        (caughtError: unknown) => {
            if (caughtError instanceof UnauthorizedError) {
                navigate("/admin/giris", { replace: true });
                return;
            }

            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "Bir hata oluştu."
            );
        },
        [navigate]
    );

    useEffect(() => {
        let isCancelled = false;

        setIsLoading(true);
        setError("");

        getBusinessApplications(statusFilter)
            .then((result) => {
                if (!isCancelled) {
                    setApplications(result);
                }
            })
            .catch((caughtError) => {
                if (!isCancelled) {
                    handleError(caughtError);
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
    }, [statusFilter, handleError]);

    function replaceApplication(updated: BusinessApplication) {
        setApplications((current) =>
            current
                .map((item) => (item.id === updated.id ? updated : item))
                // Filtreye artık uymayan başvuru listeden çıkar.
                .filter(
                    (item) =>
                        statusFilter === undefined ||
                        item.status === statusFilter
                )
        );
        setPendingAction(null);
        setApprovingId(null);
    }

    async function runAction(
        application: BusinessApplication,
        action: PendingAction["action"]
    ) {
        setError("");
        setBusyId(application.id);

        try {
            const updated =
                action === "approve"
                    ? await approveBusinessApplication(application.id)
                    : await rejectBusinessApplication(application.id);

            replaceApplication(updated);
        } catch (caughtError) {
            handleError(caughtError);
        } finally {
            setBusyId(null);
        }
    }

    function renderActions(application: BusinessApplication) {
        if (application.status !== BusinessApplicationStatus.Pending) {
            return null;
        }

        const isBusy = busyId === application.id;
        const isAddBusiness =
            application.type === BusinessApplicationType.AddBusiness;

        if (approvingId === application.id) {
            return (
                <ApproveBusinessForm
                    application={application}
                    onApproved={replaceApplication}
                    onCancel={() => setApprovingId(null)}
                    onError={(caughtError) => {
                        if (caughtError instanceof UnauthorizedError) {
                            handleError(caughtError);
                        }
                    }}
                />
            );
        }

        if (pendingAction?.id === application.id) {
            const isApprove = pendingAction.action === "approve";

            return (
                <div className="admin-actions">
                    <span className="admin-confirm-text">
                        {isApprove
                            ? "Sahiplenme başvurusu onaylansın mı?"
                            : "Başvuru reddedilsin mi?"}
                    </span>

                    <button
                        type="button"
                        className={
                            isApprove
                                ? "admin-button admin-button-approve"
                                : "admin-button admin-button-reject"
                        }
                        disabled={isBusy}
                        onClick={() =>
                            runAction(application, pendingAction.action)
                        }
                    >
                        {isBusy ? "İşleniyor..." : "Evet"}
                    </button>

                    <button
                        type="button"
                        className="admin-button"
                        disabled={isBusy}
                        onClick={() => setPendingAction(null)}
                    >
                        Vazgeç
                    </button>
                </div>
            );
        }

        return (
            <div className="admin-actions">
                <button
                    type="button"
                    className="admin-button admin-button-approve"
                    onClick={() => {
                        setPendingAction(null);

                        if (isAddBusiness) {
                            setApprovingId(application.id);
                        } else {
                            setPendingAction({
                                id: application.id,
                                action: "approve",
                            });
                        }
                    }}
                >
                    {isAddBusiness ? "Onayla ve firma oluştur" : "Onayla"}
                </button>

                <button
                    type="button"
                    className="admin-button admin-button-reject"
                    onClick={() => {
                        setApprovingId(null);
                        setPendingAction({
                            id: application.id,
                            action: "reject",
                        });
                    }}
                >
                    Reddet
                </button>
            </div>
        );
    }

    return (
        <AdminLayout>
            <h1 className="section-title">İşletme başvuruları</h1>

            <div className="admin-tabs" role="tablist">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.label}
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === filter.value}
                        className={
                            statusFilter === filter.value
                                ? "admin-tab admin-tab-active"
                                : "admin-tab"
                        }
                        onClick={() => {
                            setPendingAction(null);
                            setApprovingId(null);
                            setStatusFilter(filter.value);
                        }}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {isLoading ? (
                <p className="admin-muted">Yükleniyor...</p>
            ) : applications.length === 0 ? (
                <div className="empty-state">
                    Bu listede başvuru yok.
                </div>
            ) : (
                <div className="admin-list">
                    {applications.map((application) => (
                        <article
                            className="detail-card admin-application"
                            key={application.id}
                        >
                            <div className="admin-application-header">
                                <div>
                                    <h3>
                                        {application.businessSlug ? (
                                            <Link
                                                to={`/business/${application.businessSlug}`}
                                                target="_blank"
                                            >
                                                {application.businessName} ↗
                                            </Link>
                                        ) : (
                                            application.businessName
                                        )}
                                    </h3>

                                    <p className="admin-muted">
                                        #{application.id} ·{" "}
                                        {formatDate(application.createdAtUtc)}
                                    </p>
                                </div>

                                <div className="tag-list">
                                    <span className="tag">
                                        {application.type ===
                                        BusinessApplicationType.AddBusiness
                                            ? "Firma ekleme"
                                            : "Sahiplenme"}
                                    </span>

                                    <span
                                        className={`tag admin-status-${application.status}`}
                                    >
                                        {statusLabels[application.status]}
                                    </span>
                                </div>
                            </div>

                            <dl className="admin-details">
                                <dt>Başvuran</dt>
                                <dd>{application.contactName}</dd>

                                <dt>Telefon</dt>
                                <dd>
                                    <a href={`tel:${application.phoneNumber}`}>
                                        {application.phoneNumber}
                                    </a>
                                </dd>

                                <dt>E-posta</dt>
                                <dd>
                                    <a href={`mailto:${application.email}`}>
                                        {application.email}
                                    </a>
                                </dd>

                                <dt>Hesap</dt>
                                <dd>
                                    {application.applicantEmail ?? (
                                        <span className="admin-muted">
                                            Hesapsız başvuru (onaylanırsa
                                            firmaya sahip atanmaz)
                                        </span>
                                    )}
                                </dd>

                                {application.message && (
                                    <>
                                        <dt>Mesaj</dt>
                                        <dd className="admin-message">
                                            {application.message}
                                        </dd>
                                    </>
                                )}
                            </dl>

                            {renderActions(application)}
                        </article>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminApplicationsPage;
