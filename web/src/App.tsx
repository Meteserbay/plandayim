import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import BusinessApplicationPage from "./pages/BusinessApplicationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminApplicationsPage from "./pages/AdminApplicationsPage";

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
        </Routes>
    );
}

export default App;