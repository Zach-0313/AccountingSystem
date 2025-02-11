import { useState, useEffect } from "react";
import './App.css';
import './index.css';
import LoginScreen from "./LoginScreen";
import BaseUser from "./User/BaseUser";
import BasePassword from "./User/BasePassword";
import {createClient} from "@supabase/supabase-js"; // Ensure you import Supabase client

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AdminPanel = () => {
    const [users, setUsers] = useState<BaseUser[]>([]);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [dateOfBirth, setDateOfBirth] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [role, setRole] = useState<"admin" | "user" | "manager">("user");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    // 🔹 Fetch Users from Supabase on Mount
    useEffect(() => {
        const getUserTable = async () => {
            const res = await supabase.from("User_Credentials").select("id, user");
            if (res.error) {
                console.error("Error fetching users:", res.error);
                return;
            }
            
            const newUsers = res.data?.map(entry => BaseUser.fromJSON(entry.user)) || [];
            
            // Ensure unique users using a Map
            setUsers(prevUsers => [
                ...new Map([...prevUsers, ...newUsers].map(user => [user.id, user])).values()
            ]);
        };

        getUserTable();
    }, []);

    // 🔹 Handle Create or Update User
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newUser = new BaseUser(
            editingUserId || (users.length + 1).toString(),
            username,
            new BasePassword(password),
            firstName,
            lastName,
            dateOfBirth,
            email,
            role,
            isActive
        );

        if (editingUserId) {
            // Update user in Supabase
            await supabase.from("User_Credentials").update({ user: newUser.toJSON() }).eq("id", editingUserId);
            setEditingUserId(null);
        } else {
            // Insert new user
            await supabase.from("User_Credentials").insert([{ id: newUser.id, user: newUser.toJSON() }]);
        }

        // Refresh user list
        setUsers(prevUsers => [
            ...new Map([...prevUsers, newUser].map(user => [user.id, user])).values()
        ]);

        // Reset form fields
        setUsername(""); setPassword(""); setFirstName(""); setLastName("");
        setDateOfBirth("0000-00-00"); setEmail(""); setRole("user"); setIsActive(true);
    };

    // 🔹 Handle Edit User
    const handleEdit = (user: BaseUser) => {
        setUsername(user.username);
        setPassword(user.password.GetPassword());
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setDateOfBirth(user.dob);
        setEmail(user.email);
        setRole(user.role);
        setIsActive(user.is_active);
        setEditingUserId(user.id);
    };

    // 🔹 Toggle Active State
    const toggleActive = async (id: string) => {

        // Update Supabase
        const userToUpdate = users.find(user => user.id === id);
        if (userToUpdate) {
            await supabase.from("User_Credentials").update({id: id}).match({id: id});
        }
    };

    // 🔹 Handle Logout
    const handleLogout = () => setIsLoggedIn(false);

    if (!isLoggedIn) return <LoginScreen />;

    return (
        <div>
            {/* Header */}
            <header style={headerStyle}>
                <h2>Admin Panel</h2>
                {isLoggedIn && <button onClick={handleLogout} style={buttonStyle}>Logout</button>}
            </header>

            {isLoggedIn ? (
                <>
                    {/* Form */}
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <div><label>Username:</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} required /></div>
                        <div><label>Password:</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                        <div><label>First Name:</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
                        <div><label>Last Name:</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
                        <div><label>Date of Birth:</label><input type="text" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required /></div>
                        <div><label>Email:</label><input type="text" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                        <div><label>Role:</label>
                            <select value={role} onChange={e => setRole(e.target.value as "admin" | "user" | "manager")}>
                                <option value="admin">Admin</option><option value="user">User</option><option value="manager">Manager</option>
                            </select>
                        </div>
                        <div><label>Active:</label><input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} /></div>
                        <button type="submit">{editingUserId ? "Update User" : "Create User"}</button>
                    </form>

                    {/* User Table */}
                    <h3>Users</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th><th>Password</th><th>First Name</th><th>Last Name</th>
                                <th>Date of Birth</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.password.GetPassword()}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.dob}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.is_active ? "Yes" : "No"}</td>
                                    <td>
                                        <button onClick={() => handleEdit(user)}>Edit</button>
                                        <button onClick={() => toggleActive(user.id)}>Toggle Active</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <h2>You have been logged out. Please log in again.</h2>
            )}
        </div>
    );
};

const headerStyle = { position: "fixed" as 'fixed', top: 0, left: 0, width: "100%", padding: "10px", backgroundColor: "#333", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000 };
const buttonStyle = { backgroundColor: "#e44d26", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: "5px" };
const formStyle = { marginTop: "60px", marginBottom: "20px" };

export default AdminPanel;
