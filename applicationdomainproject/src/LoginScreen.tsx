import { useState } from "react";
import './App.css'
import './index.css'
import AdminPanel from "./AdminPanel";

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const handleLogin = () => {
        //compare to database here
        if (username === "admin" && password === "password123") {
            setIsLoggedIn(true)
        } else {
            setError("Invalid username or password");
        }
    };

    if (isLoggedIn) {
        return <AdminPanel />;
    }
        return (
            <section>
                <h1>Application Domain</h1>
                    <p>
                        <p>
                            <h4>Username</h4>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            <h4>Password</h4>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                        </p>
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            />
                        Show Password
                    </label>
                    {error && <p>{error}</p>}
                    </p>
                <input
                    type="button"
                    value="Login"
                    onClick={handleLogin}
                />
            </section>
        );
}
