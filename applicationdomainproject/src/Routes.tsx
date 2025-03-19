import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import AdminHub from "./AdminHub";
import AccountView from "./AccountView";
import AdminPanel from "./AdminPanel";
export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/admin" element={<AdminHub />} />
                <Route path="/accounts" element={<AccountView />} />
                <Route path="/admin/usermanagement" element={<AdminPanel />} />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}