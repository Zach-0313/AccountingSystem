/* eslint-disable prefer-const */
import { useState, useEffect } from "react";
import './App.css';
import './index.css';
import AdminHub from "./AdminHub";
import AccountView from './AccountView.tsx'

import BaseUser from "./User/BaseUser";
import Header from "./Header";
import UserManager from "./User/UserManager";

export default function LoginScreen() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [serverStatus, setServerStatus] = useState<"Connected" | "Disconnected" | "Checking...">("Checking...");

    const {
        users, // Users are fetched from UserManager
        loading,
        error: userManagerError
    } = UserManager();

    // Check if the server is connected by waiting for user data to be loaded
    useEffect(() => {
        const checkServerConnection = async () => {
            try {
                if (loading) {
                    setServerStatus("Checking...");
                } else if (userManagerError) {
                    setServerStatus("Disconnected");
                } else {
                    setServerStatus("Connected");
                }
            } catch {
                setServerStatus("Disconnected");
            }
        };
        checkServerConnection();
    }, [loading, userManagerError]);

    // Handle Login
    const handleLogin = async () => {
        if (!users || users.length === 0) {
            setError("No users found in the database.");
            return;
        }

        console.log("Login Checking Against:", users.length + " users");

        let potentialUser: BaseUser | undefined = users.find(
            (anyUser) => anyUser.username === username
        );

        console.log("Potential Username: " + potentialUser?.username);
        console.log("Potential Password: " + potentialUser?.password.GetPassword());

        if (potentialUser && potentialUser.password.IsPassword(password)) {
            if (potentialUser.password.isExpired()) {
                alert("Password is Expired");
                setError("Expired Password");
            }
            if (potentialUser.is_active) {
                setIsLoggedIn(true);
                if (potentialUser.role == "admin") {
                    setIsAdmin(true);
                }
            }
            else setError("User is deactivated");
        } else {
            setError("Invalid username or password");
        }
    };

    if (isLoggedIn) {
        if (isAdmin) {
            console.log("Logging in to ADMIN");
            return <AdminHub />;
        }
        return <AccountView />;
    }

    return (
        <section>
            <Header label="Login" />
            <h1>Owlight Financials</h1>

            <div className="input-container">
            <h4>Username</h4>
            <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <h4>Password</h4>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            {/* Show Password Checkbox */}
            <p>
                <label>
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                    />
                    Show Password
                </label>
            </p>

            {/* Error Message */}
            {error && <p className="error">{error}</p>}

            {/* Login Button */}
            <input type="button" value="Login" onClick={handleLogin} />

            {/* Server Connection Status */}
            <p className={`server-status ${serverStatus === "Connected" ? "connected" : "disconnected"}`}>
                Server Status: {serverStatus}
            </p>
        </section>
    );
}
