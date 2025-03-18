/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import './App.css'
import './index.css'
import AdminPanel from "./AdminPanel";
import BaseUser from "./User/BaseUser";
import BasePassword from "./User/BasePassword";
import React from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from 'bcryptjs';


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

            async function authenticateUser(username: string | undefined, password: string | undefined) {
                // Fetch user by username
                const { data: users, error } = await supabase
                    .from('User_Credentials')
                    .select('*')
                    .eq('username', username)
                    .limit(1);

                console.log('Fetched user:', users, 'Error:', error);

                if (error || !users || users.length === 0) {
                    console.error('User not found or error fetching user:', error);
                    throw new Error ('Invalid credentials.');
                    setError("Invalid username and password");
                }
                else {
                    setIsLoggedIn(true);
                }

                const user = users[0];

                // Check if account is suspended
                if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
                    throw new Error('Account is suspended. Please try again later.');
                }

                // Debug password comparison
                console.log('Entered password:', password);
                console.log('Stored password hash:', user.password_hash);

                // Verify password
                const isPasswordValid = await bcrypt.compare(password as string, user.password_hash);
                console.log('Password validation result:', isPasswordValid);

                if (!isPasswordValid) {
                    await handleFailedLogin(user);
                    throw new Error('Invalid credentials.');
                }

                // Reset failed attempts on successful login
                await resetFailedAttempts(user.id);

                console.log('Login successful for user:', username);
                return user;


        }

        async function handleFailedLogin(user: any) {
            const updatedAttempts = user.failed_attempts + 1;

            if (updatedAttempts >= 3) {
                const suspensionDuration = 1 * 60 * 1000; // 1 minute for testing purposes
                const suspendedUntil = new Date(Date.now() + suspensionDuration).toISOString();
                await supabase
                    .from('users')
                    .update({ failed_attempts: 0, suspended_until: suspendedUntil })
                    .eq('id', user.id);
            } else {
                await supabase
                    .from('users')
                    .update({ failed_attempts: updatedAttempts })
                    .eq('id', user.id);
            }
        }

        async function resetFailedAttempts(userId: string) {
            await supabase
                .from('users')
                .update({ failed_attempts: 0, suspended_until: null })
                .eq('id', userId);
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
