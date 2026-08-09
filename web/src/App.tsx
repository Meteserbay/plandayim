import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import BusinessDetailPage from "./pages/BusinessDetailPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
                path="/business/:slug"
                element={<BusinessDetailPage />}
            />
        </Routes>
    );
}

export default App;