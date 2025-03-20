/* eslint-disable prefer-const */
import { useState, useEffect } from "react";
import './App.css';
import './index.css';
import { useNavigate } from "react-router-dom";
import BaseUser from "./User/BaseUser";
import Header from "./Header";
import UserManager from "./User/UserManager";
import {DatabaseManager} from "./DatabaseManager.tsx";
import HelpButton from "./HelpButton";

export default function LoginScreen() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newBirthday, setNewBirthday] = useState("");    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordPopup, setForgotPasswordPopup] = useState(false);
    const [createAccountPopup, setCreateAccountPopup] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user"); // Default role
    const navigate = useNavigate();

    const [serverStatus, setServerStatus] = useState<"Connected" | "Disconnected" | "Checking...">("Checking...");
    const scramblePassword = (password: string): string => {
        const reversed = password.split("").reverse().join(""); // Reverse the string
        const prefix = "secure_";
        const suffix = "_end";
        return `${prefix}${reversed}${suffix}`; // Add prefix and suffix
    };
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
    // Handle creating a new user
    const handleCreateAccount = async () => {
        if (!newUsername || !newPassword) {
            alert("Please fill in all fields.");
            return;
        }

        const dbManager = new DatabaseManager("users");
        const scrambledPassword = scramblePassword(newPassword);
        const newUser = {
            username: newUsername,
            password: scrambledPassword,
            role: newRole,
            birthday: newBirthday,
            is_active: true,
        };

        try {
            const result = await dbManager.insert(newUser);
            if (result) {
                alert("Account created successfully!");
                setCreateAccountPopup(false);
                setNewUsername("");
                setNewPassword("");
                setNewRole("user");
                setNewBirthday("");

            } else {
                alert("Failed to create account. Try again later.");
            }
        } catch (error) {
            console.error("Error creating account:", error);
            alert("An error occurred. Please try again.");
        }
    };


    return (
        <section>
            <Header label="Login" />
            <h1>Owlight Financials</h1>
            <div className="input-container">
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <div>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
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
            <div>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setForgotPasswordPopup(true); }}
                    style={{ textDecoration: "none", color: "blue", fontSize: "16px", marginRight: "10px" }}
                >
                    Forgot Password?
                </a>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCreateAccountPopup(true); }}
                    style={{ textDecoration: "none", color: "blue", fontSize: "16px" }}
                >
                    Create Account
                </a>
            </div>

            {/* Forgot Password Popup */}
            {forgotPasswordPopup && (
                <div className="popup" style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "10px", background: "#f9f9f9" }}>
                    <h2>Reset Password</h2>
                    <input type="text" placeholder="Enter your username" style={{ marginBottom: "10px" }} />
                    <div>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setForgotPasswordPopup(false); }}
                            style={{ textDecoration: "none", color: "blue", fontSize: "14px", marginRight: "10px" }}
                        >
                            Submit
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setForgotPasswordPopup(false); }}
                            style={{ textDecoration: "none", color: "blue", fontSize: "14px" }}
                        >
                            Close
                        </a>
                    </div>
                </div>
            )}

            {/* Create Account Popup */}
            {createAccountPopup && (
                <div className="popup" style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "10px", background: "#f9f9f9" }}>
                    <h2>Create Account</h2>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    />

                    <input
                        type="date"
                        placeholder="Birthday"
                        value={newBirthday}
                        onChange={(e) => setNewBirthday(e.target.value)}
                        style={{ marginBottom: "10px", display: "block" }}
                    />
                    <div>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleCreateAccount(); }}
                            style={{ textDecoration: "none", color: "blue", fontSize: "14px", marginRight: "10px" }}
                        >
                            Submit
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); setCreateAccountPopup(false); }}
                            style={{ textDecoration: "none", color: "blue", fontSize: "14px" }}
                        >
                            Close
                        </a>
                    </div>
                </div>
            )}

            {/* Help Button */}
            <HelpButton />*
        </section>

    );
}

