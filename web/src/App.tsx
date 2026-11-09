import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import BusinessApplicationPage from "./pages/BusinessApplicationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminApplicationsPage from "./pages/AdminApplicationsPage";
import AdminBusinessesPage from "./pages/AdminBusinessesPage";
import AdminBusinessEditPage from "./pages/AdminBusinessEditPage";
import AccountAuthPage from "./pages/AccountAuthPage";
import OwnerPanelPage from "./pages/OwnerPanelPage";
import NotFoundPage from "./pages/NotFoundPage";
import KvkkPage from "./legal/KvkkPage";
import PrivacyPage from "./legal/PrivacyPage";
import TermsPage from "./legal/TermsPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
                path="/business/:slug"
                element={<BusinessDetailPage />}
            />
            <Route
                path="/firmalar-icin"
                element={<BusinessApplicationPage />}
            />
            <Route path="/admin/giris" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminApplicationsPage />} />
            <Route path="/admin/firmalar" element={<AdminBusinessesPage />} />
            <Route
                path="/admin/firmalar/:id"
                element={<AdminBusinessEditPage />}
            />
            <Route
                path="/hesap/giris"
                element={<AccountAuthPage key="login" mode="login" />}
            />
            <Route
                path="/hesap/kayit"
                element={<AccountAuthPage key="register" mode="register" />}
            />
            <Route path="/panel" element={<OwnerPanelPage />} />
            <Route path="/kvkk" element={<KvkkPage />} />
            <Route path="/gizlilik" element={<PrivacyPage />} />
            <Route path="/kullanim-kosullari" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;