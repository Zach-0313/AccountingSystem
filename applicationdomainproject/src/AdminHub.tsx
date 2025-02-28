import AdminPanel from "./AdminPanel";
import Header from "./Header";
import LoginScreen from "./LoginScreen";
import { useState, useEffect } from "react";

const AdminHub = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
    const [gotoUserManager, setgotoUserManager] = useState<boolean>(false);

    const handleLogout = () => setIsLoggedIn(false);
    const handleUserManager = () => setgotoUserManager(true);

    if (!isLoggedIn) return <LoginScreen />;
        if(gotoUserManager) return <AdminPanel/>
        return (
            <div>
                <Header label="Admin Hub" logout={handleLogout} />
                <h4>User Management</h4>
                <input
                    type="button"
                    value="User Management"
                    onClick={handleUserManager}
                />
            </div>
        );
    
}
export default AdminHub;