/* eslint-disable prefer-const */
import { useState, useEffect } from "react";
import './App.css';
import './index.css';
import { useNavigate } from "react-router-dom";
import BaseUser from "./User/BaseUser";
import Header from "./Header";
import UserManager from "./User/UserManager";
import { createClient } from "@supabase/supabase-js";
import HelpButton from "./HelpButton";
export default function LoginScreen() {
    const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4"
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newBirthday, setNewBirthday] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordPopup, setForgotPasswordPopup] = useState(false);
    const [createAccountPopup, setCreateAccountPopup] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newEmailAddress, setNewEmailAddress] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");
    const [email, setEmail] = useState("");

    const navigate = useNavigate();


    const [serverStatus, setServerStatus] = useState<"Connected" | "Disconnected" | "Checking...">("Checking...");
    const scramblePassword = (password: string): string => {
        const reversed = password.split("").reverse().join("");
        const prefix = "secure_";
        const suffix = "_end";
        return `${prefix}${reversed}${suffix}`;
    };
    const unscramblePassword = (scrambledPassword: string): string => {
        if (scrambledPassword.startsWith("secure_") && scrambledPassword.endsWith("_end")) {
            const trimmed = scrambledPassword.slice(7, -4);
            return trimmed.split("").reverse().join("");
        }
        return scrambledPassword;
    };

    const {
        users,
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

        let potentialUser: BaseUser | undefined = users.find(
            (anyUser) => anyUser.username === username
        );

        if (potentialUser) {
            const storedPassword = potentialUser.password.GetPassword();
            const unscrambledStoredPassword = unscramblePassword(storedPassword);

            if (unscrambledStoredPassword === password) {
                // Get the password creation date
                const creationDate = new Date(potentialUser.password.createdAt); // Assuming created_at is a field
                const currentDate = new Date();

                // Calculate the difference between the current date and one year from the creation date
                const oneYearLater = new Date(creationDate);
                oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

                // Calculate the difference in days
                const timeDifference = oneYearLater.getTime() - currentDate.getTime();
                const daysRemaining = timeDifference / (1000 * 3600 * 24); // Convert milliseconds to days

                // If it's within 14 days of one year, show an alert
                if (daysRemaining <= 14 && daysRemaining > 0) {
                    alert(`Your password will expire in ${Math.round(daysRemaining)} days. Please update it.`);
                    setError("Password is about to expire.");
                    return;
                }

                // Proceed with login if the password is valid and not expired
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
        } else {
            setError("Invalid username or password");
        }
    };





    const handleCreateAccount = async () => {
        if (!newFirstName || !newLastName || !newUsername || !newEmailAddress || !newPassword || !newBirthday) {
            alert("Please fill in all fields.");
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            alert("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
            return;
        }

        const scrambledPassword = scramblePassword(newPassword);
        const user = {
            username: newUsername,
            email: newEmailAddress,
            first_name: newFirstName,
            last_name: newLastName,
            role: newRole,
            password: scrambledPassword,
            birthday: newBirthday,
            is_active: false, //I changed it to false so that I can get the approval by the admin first. DR
        };

        try {
            const { data, error } = await supabase
                .from("User_Credentials_Test")
                .insert([user]);

            console.log("Supabase response:", data, error);

            if (error) {
                console.error("Error creating account:", error.message, error.details);
                alert("Failed to create account. Please try again.");
            } else {
                console.log("Inserted Data:", data);
                alert("Account created successfully!");

                setCreateAccountPopup(false);
                setNewFirstName("");
                setNewLastName("");
                setNewUsername("");
                setNewEmailAddress("");
                setNewPassword("");
                setNewBirthday("");
                setNewRole("user");
            }
            if (!error) {
                console.log("Inserted Data:", data);
                alert("Account created successfully!");



            }

        } catch (error) {
            console.error("Unexpected error:", error);
            alert("An unexpected error occurred. Please try again.");
        }


    };

    const handleForgotPassword = async () => {
        if (!username || !email) {
            setError("Please provide both username and email.");
            return;
        }

        try {
            const { data: users, error } = await supabase
                .from("User_Credentials_Test")
                .select("first_name, last_name, email, username, password")
                .eq("username", username)
                .eq("email", email);

            if (error) throw error;

            if (users && users.length > 0) {
                const user = users[0];
                const unscrambledPassword = unscramblePassword(user.password);

                alert(`
                First Name: ${user.first_name}
                Last Name: ${user.last_name}
                Email: ${user.email}
                Username: ${user.username}
                Password: ${unscrambledPassword}
            `);
                setForgotPasswordPopup(false);
                setUsername("");
                setEmail("");
            } else {
                setError("No matching user found with the provided username and email.");
            }
        } catch (err) {
            console.error("Error retrieving password:", err);
            setError("An error occurred while retrieving the password.");
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
                    style={{ textDecoration: "underline", color: "blue", fontSize: "16px", marginRight: "10px" }}
                >
                    Forgot Password?
                </a>
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCreateAccountPopup(true); }}
                    style={{ textDecoration: "underline", color: "blue", fontSize: "16px" }}
                >
                    Create Account
                </a>
            </div>

            {/* Forgot Password Popup */}
            {forgotPasswordPopup && (
                <div
                    className="popup"
                    style={{
                        border: "1px solid #ccc",
                        padding: "20px",
                        borderRadius: "10px",
                        background: "#f9f9f9",
                    }}
                >
                    <h2>Reset Password</h2>
                    <input
                        type="text"
                        placeholder="User Name"
                        value={username} // Bind to username state
                        onChange={(e) => setUsername(e.target.value)} // Update state on change
                        style={{ marginBottom: "10px" }}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email} // Bind to email state
                        onChange={(e) => setEmail(e.target.value)} // Update state on change
                        style={{ marginBottom: "10px" }}
                    />

                    <div>
                        <a
                            href="#"
                            onClick={async (e) => {
                                e.preventDefault();
                                await handleForgotPassword(); // Trigger forgot password logic
                            }}
                            style={{
                                textDecoration: "none",
                                color: "blue",
                                fontSize: "14px",
                                marginRight: "10px",
                            }}
                        >
                            Submit
                        </a>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setForgotPasswordPopup(false); // Close the popup
                            }}
                            style={{
                                textDecoration: "none",
                                color: "blue",
                                fontSize: "14px",
                            }}
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
                        type="email"
                        placeholder="Email Address"
                        value={newEmailAddress}
                        onChange={(e) => setNewEmailAddress(e.target.value)}
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

