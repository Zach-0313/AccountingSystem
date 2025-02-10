/* eslint-disable prefer-const */
import { useState, useEffect } from "react";
import './App.css'
import './index.css'
import AdminPanel from "./AdminPanel";
import BaseUser from "./User/BaseUser";
import BasePassword from "./User/BasePassword";
import { createClient } from "@supabase/supabase-js";
import React from "react";

// Supabase setup
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LoginScreen() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [serverStatus, setServerStatus] = useState<"Connected" | "Disconnected" | "Checking...">("Checking...");
    let userData: BaseUser[] = []; 

    // Check if the server is connected
    useEffect(() => {
        const checkServerConnection = async () => {
            try {
                const { error } = await supabase.from("User_Credentials").select("id").limit(1);
                if (error) {
                    setServerStatus("Disconnected");
                } else {
                    setServerStatus("Connected");
                }
            } catch {
                setServerStatus("Disconnected");
            }
        };
        checkServerConnection();
    }, []);

    // Fetch users from database
    const getUserTable = async () => {
        const res = await supabase.from("User_Credentials").select("user");

        if (res.error) {
            console.error("Error fetching data:", res.error);
            return;
        }

        console.log(res);

        // Convert JSON to BaseUser objects
        let newUsers = res.data?.map(data => BaseUser.fromJSON(data.user)) || [];

        // Remove duplicates based on `id`
        userData = [
            ...new Map([...userData, ...newUsers].map(user => [user.id, user])).values()
        ];

        console.log("Unique User Count:", userData.length);
    }

    // Handle Login
    const handleLogin = async () => {
        await getUserTable();
        console.log("Login Checking Against:", userData.length + " users");

        let potentialUser: BaseUser | undefined = userData.find(anyUser => anyUser.username === username);
        console.log("Potential Login Username: " + potentialUser?.username);
        console.log("Potential Login Password: " + potentialUser?.password.GetPassword());

        if (potentialUser && potentialUser.password.IsPassword(password)) {
            setIsLoggedIn(true);
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
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="button"
                value="Login"
                onClick={handleLogin}
            />

            {/* Server Connection Status */}
            <p style={{ marginTop: "10px", fontWeight: "bold", color: serverStatus === "Connected" ? "green" : "red" }}>
                Server Status: {serverStatus}
            </p>
        </section>
    );
}
