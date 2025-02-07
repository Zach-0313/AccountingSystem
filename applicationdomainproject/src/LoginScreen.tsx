/* eslint-disable prefer-const */

import { useState } from "react";
import './App.css'
import './index.css'
import AdminPanel from "./AdminPanel";
import BaseUser from "./User/BaseUser";
import BasePassword from "./User/BasePassword";


export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [users] = useState<BaseUser[]>([
        new BaseUser("1", "adminJoe", new BasePassword("adminpass"), "Joe", "Smith", "1985-04-10", "joe@example.com", "admin"),
        new BaseUser("2", "sammyUser", new BasePassword("userpass"), "Sammy", "Smith", "1990-06-22", "sammy@example.com", "user"),
        new BaseUser("3", "daleManager", new BasePassword("managerpass"), "Dale", "Jones", "1988-09-14", "dale@example.com", "manager"),
    ]);
    const handleLogin = () => {
        //compare to database here
        let potentialUser: BaseUser | undefined = users.find(anyUser => anyUser.username === username);
        if (potentialUser && potentialUser.password.IsPassword(password))
        {
            setIsLoggedIn(true)
        }
        else {
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
function LoginScreen() {
    return (
        <section>
            <h1>Application Domain</h1>
            <p>
                <h4>Username</h4>
                <input type="text" name="name" />
                <h4>Password</h4>
                <input type="text" name="name" />
            </p>
       </section>



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
