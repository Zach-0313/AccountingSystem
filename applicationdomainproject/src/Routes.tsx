import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import AdminHub from "./AdminHub";
import AccountView from "./AccountView";
import AdminPanel from "./AdminPanel";
import AccountViewPage from "./AccountViewPage";
import AccountsJournalizing from "./AccountsJournalizing";
import ExpiredUser from "./ExpiredUser.tsx";
import AddAccountForm from "./AddAccountForm.tsx";
import ReportScreen from "./ReportsScreen.tsx";


import PendingJournalEntries from "./PendingJournalEntries";
export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/admin" element={<AdminHub />} />
                <Route path="/admin/usermanagement" element={<AdminPanel />} />
                <Route path="/accounts" element={<AccountView />} />
                <Route path="/accounts/journalizing" element={<AccountsJournalizing />} />
                <Route path="/accounts/Reports" element={<ReportScreen /> } />
                <Route path="/accounts/:id" element={<AccountViewPage />} />
                <Route path="/admin/ExpiredUser" element={<ExpiredUser />} />
                <Route path="/add-account/:userId" element={<AddAccountForm />} />
                <Route path="/admin/AddAccount" element={<AddAccountForm />} />
                <Route path="/admin/approveJournalEntries" element={<PendingJournalEntries /> } />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}