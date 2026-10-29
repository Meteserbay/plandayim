import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { login, register } from "../api/account";
import { safeReturnPath, useAccount } from "../account/AccountContext";

interface AccountAuthPageProps {
    mode: "login" | "register";
}

function AccountAuthPage({ mode }: AccountAuthPageProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAccount } = useAccount();

    const returnPath = safeReturnPath(searchParams.get("donus"));
    const isRegister = mode === "register";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            setIsSubmitting(true);

            const account = isRegister
                ? await register(fullName, email, password)
                : await login(email, password);

            setAccount(account);
            navigate(returnPath, { replace: true });
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Bir hata oluştu."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const switchQuery = searchParams.get("donus")
        ? `?donus=${encodeURIComponent(returnPath)}`
        : "";

    return (
        <div className="admin-login-page">
            <form
                className="detail-card admin-login-card"
                onSubmit={handleSubmit}
            >
                <Link to="/" className="brand">
                    Plandayım
                </Link>

                <div>
                    <h1>{isRegister ? "Hesap oluştur" : "Giriş yap"}</h1>

                    <p className="admin-muted">
                        {isRegister
                            ? "İşletmeni eklemek veya sahiplenmek için hesap oluştur."
                            : "İşletme panelin için giriş yap."}
                    </p>
                </div>

                {isRegister && (
                    <div className="field">
                        <label htmlFor="fullName">Ad soyad</label>

                        <input
                            id="fullName"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            autoComplete="name"
                            required
                            maxLength={150}
                        />
                    </div>
                )}

                <div className="field">
                    <label htmlFor="email">E-posta</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                        maxLength={254}
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Şifre</label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={
                            isRegister ? "new-password" : "current-password"
                        }
                        required
                        minLength={isRegister ? 8 : undefined}
                        maxLength={128}
                    />

                    {isRegister && (
                        <span className="field-hint">En az 8 karakter.</span>
                    )}
                </div>

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    className="search-button"
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Lütfen bekle..."
                        : isRegister
                          ? "Hesap Oluştur"
                          : "Giriş Yap"}
                </button>

                <p className="auth-switch">
                    {isRegister ? (
                        <>
                            Zaten hesabın var mı?{" "}
                            <Link to={`/hesap/giris${switchQuery}`}>Giriş yap</Link>
                        </>
                    ) : (
                        <>
                            Hesabın yok mu?{" "}
                            <Link to={`/hesap/kayit${switchQuery}`}>
                                Hesap oluştur
                            </Link>
                        </>
                    )}
                </p>
            </form>
        </div>
    );
}

export default AccountAuthPage;
