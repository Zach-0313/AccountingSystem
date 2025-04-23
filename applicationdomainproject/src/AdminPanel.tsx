import { useState, useEffect } from "react";
import './App.css';
import './index.css';
import BaseUser from "./User/BaseUser";
import BasePassword from "./User/BasePassword";
import { createClient } from "@supabase/supabase-js";
import Header from "./Header";
import { Link } from "react-router-dom";
import HelpButton from "./HelpButton.tsx";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZngxcnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
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
    const [isActive, setIsActive] = useState<boolean>(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [adminRole, setAdminRole] = useState<boolean>(false);

    useEffect(() => {
        const getUserTable = async () => {
            const res = await supabase.from("User_Credentials").select("id, user");
            if (res.error) {
                console.error("Error fetching users:", res.error);
                return;
            }
            const currentUserRole = "admin";
            setAdminRole(currentUserRole === "admin");

            const newUsers = res.data?.map(entry => BaseUser.fromJSON(entry.user)) || [];

            setUsers(prevUsers => [
                ...new Map([...prevUsers, ...newUsers].map(user => [user.id, user])).values()
            ]);
        };

        getUserTable();
    }, []);

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
            await supabase.from("User_Credentials").update({ user: newUser.toJSON() }).eq("id", editingUserId);
            setEditingUserId(null);
        } else {
            await supabase.from("User_Credentials").insert([{ id: newUser.id, user: newUser.toJSON() }]);
        }

        setUsers(prevUsers => [
            ...new Map([...prevUsers, newUser].map(user => [user.id, user])).values()
        ]);

        setUsername(""); setPassword(""); setFirstName(""); setLastName("");
        setDateOfBirth("0000-00-00"); setEmail(""); setRole("user"); setIsActive(true);
    };

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

    const toggleActive = async (id: string) => {
        const userToUpdate = users.find(user => user.id === id);
        if (userToUpdate) {
            const updatedUser = new BaseUser(
                userToUpdate.id,
                userToUpdate.username,
                userToUpdate.password,
                userToUpdate.firstName,
                userToUpdate.lastName,
                userToUpdate.dob,
                userToUpdate.email,
                userToUpdate.role,
                !userToUpdate.is_active
            );
            const { error } = await supabase.from("User_Credentials").update({ user: updatedUser.toJSON() }).eq("id", id);
            if (error) {
                console.error("Error toggling active status:", error);
                return;
            }

            setUsers(prevUsers => prevUsers.map(user => user.id === id ? updatedUser : user));
        }
    };

    const getTimeOfDayGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return "Good Morning";
        if (currentHour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div>
            <Header label="User Management" />

            <div style={{ maxHeight: "80vh", overflowY: "auto", padding: "20px" }}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div className="create-user">
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
                    </div>
                    <div><label>Active:</label><input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} /></div>
                    <button type="submit">{editingUserId ? "Update User" : "Create User"}</button>
                </form>

                <h3>Users</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Username</th><th>Password</th><th>First Name</th><th>Last Name</th>
                        <th>Date of Birth</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => {
                        const greeting = getTimeOfDayGreeting();
                        const subject = `Hello ${user.firstName} ${user.lastName}`;
                        const body = `${greeting}, ${user.firstName} ${user.lastName}.`;

                        return (
                            <tr key={user.id}>
                                <td>
                                    <Link to={`/add-account/${user.id}`} style={{ textDecoration: 'none', color: 'blue' }}>
                                        {user.username}
                                    </Link>
                                </td>

                                <td>{user.password.GetPassword()}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.dob}</td>
                                <td>
                                    <a
                                        href={`mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                                        style={{ textDecoration: 'none', color: 'blue' }}
                                    >
                                        {user.email}
                                    </a>
                                </td>
                                <td>{user.role}</td>
                                <td>{user.is_active ? "Yes" : "No"}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)}>Edit</button>
                                    <button
                                        onClick={() => toggleActive(user.id)}
                                        style={{
                                            backgroundColor: user.is_active ? "green" : "red",
                                            color: "white",
                                            padding: "5px 10px",
                                            borderRadius: "5px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {user.is_active ? "Active" : "Toggle to Activate"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <Link to="/admin">
                    <button style={buttonStyle}>Back to Admin Hub</button>
                </Link>
            </div>

            <HelpButton />
        </div>
    );
};

const buttonStyle = { backgroundColor: "#e44d26", color: "white", border: "none", padding: "10px 20px", cursor: "pointer", borderRadius: "5px" };
const formStyle = { marginTop: "60px", marginBottom: "20px" };

export default AdminPanel;
