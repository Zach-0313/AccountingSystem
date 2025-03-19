/* eslint-disable prefer-const */
import { useState, useEffect } from "react";
import './App.css';
import './index.css';
import { useNavigate } from "react-router-dom";
import BaseUser from "./User/BaseUser";
import Header from "./Header";
import UserManager from "./User/UserManager";

export default function LoginScreen() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

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
                return;
            }
            if (potentialUser.is_active) {
                if (potentialUser.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/accounts");
                }
            } else {
                setError("User is deactivated");
            }
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <section>
            <Header label="Login" />
            <h1>Owlight Financials</h1>
            <h4>Username</h4>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <h4>Password</h4>
            <div>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            <label>
                <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                />
                Show Password
            </label>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div>
            <button onClick={handleLogin}>Login</button>
            </div>
            <p style={{ marginTop: "10px", fontWeight: "bold", color: serverStatus === "Connected" ? "green" : "red" }}>
                Server Status: {serverStatus}
            </p>
        </section>
    );
}
