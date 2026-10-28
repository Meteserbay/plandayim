import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { adminLogin } from "../api/admin";

function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        try {
            setIsSubmitting(true);
            await adminLogin(email, password);
            navigate("/admin", { replace: true });
        } catch (loginError) {
            setError(
                loginError instanceof Error
                    ? loginError.message
                    : "Giriş yapılamadı."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="admin-login-page">
            <form
                className="detail-card admin-login-card"
                onSubmit={handleSubmit}
            >
                <Link to="/" className="brand">
                    Plandayım
                </Link>

                <h1>Admin girişi</h1>

                <div className="field">
                    <label htmlFor="email">E-posta</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Şifre</label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />
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
                    {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
            </form>
        </div>
    );
}

export default AdminLoginPage;
