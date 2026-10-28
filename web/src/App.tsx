import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import BusinessApplicationPage from "./pages/BusinessApplicationPage";

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
        </Routes>
    );
}

export default App;