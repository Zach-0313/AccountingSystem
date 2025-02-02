import { useState } from "react";
import './App.css'
import './index.css'
import LoginScreen from "./LoginScreen"

type User = {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    role: "admin" | "user" | "manager";
    is_active: boolean;
};
const AdminPanel = () => {

    //hardcoded data for users until backend is setup
    const [users, setUsers] = useState<User[]>([
        { id: 1, username: "adminUser", password: "adminPass", firstName: "Jane", lastName: "Smith", dateOfBirth: "1990-01-01", email: "email", role: "admin", is_active: true },
        { id: 2, username: "regularUser", password: "userPass", firstName: "John", lastName: "Jones", dateOfBirth: "1990-01-01", email: "email", role: "user", is_active: true },
        { id: 3, username: "modUser", password: "modPass", firstName: "Sammy", lastName: "James", dateOfBirth: "1990-01-01", email: "email", role: "manager", is_active: false },
    ]);

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [dateOfBirth, setDateOfBirth] = useState<string>("");
    const [email, setEmail] = useState<string>("")
    const [role, setRole] = useState<"admin" | "user" | "manager">("user");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [editingUserId, setEditingUserId] = useState<number | null>(null); // Track the user being edited
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Track login status

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUserId != null) {
            // Edit an existing user. Would push data to database here
            setUsers(
                users.map((user) =>
                    user.id === editingUserId
                        ? { ...user, username, password, firstName, lastName, dateOfBirth, email, role, is_active: isActive }
                        : user
                )
            );
            setEditingUserId(null); // Reset editing mode
        } else {
            // Add new user
            const newUser: User = {
                id: users.length + 1, // Assuming the next id is sequential
                username,
                password,
                firstName,
                lastName,
                dateOfBirth,
                email,
                role,
                is_active: isActive,
            };
            setUsers([...users, newUser]);
        }

        // Reset form fields
        setUsername("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setDateOfBirth("0000-00-00");
        setEmail("");
        setRole("user");
        setIsActive(true);
    };

    const handleEdit = (user: User) => {
        setUsername(user.username);
        setPassword(user.password);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setDateOfBirth(user.dateOfBirth);
        setEmail(user.email);
        setRole(user.role);
        setIsActive(user.is_active);
        setEditingUserId(user.id); // Set the user as being edited
    };

    const toggleActive = (id: number) => {
        setUsers(
            users.map((user) =>
                user.id === id ? { ...user, is_active: !user.is_active } : user
            )
        );
    };

    const handleLogout = () => {
        setIsLoggedIn(false); // Set login state to false (simulating logout)
    };

    if (!isLoggedIn) {
        return <LoginScreen />;
    }

    return (
        <div>
            {/* Header */}
            <header style={headerStyle}>
                <h2>Admin Panel</h2>
                {isLoggedIn && (
                    <button onClick={handleLogout} style={buttonStyle}>
                        Logout
                    </button>
                )}
            </header>

            {isLoggedIn ? (
                <>
                    <form onSubmit={handleSubmit} style={formStyle}>
                            <div>
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Date of Birth:</label>
                                <input
                                    type="text"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Role:</label>
                                <select value={role} onChange={(e) => setRole(e.target.value as "admin" | "user" | "manager")}>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                    <option value="manager">manager</option>
                                </select>
                            </div>
                            <div>
                                <label>Active:</label>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => setIsActive(!isActive)}
                                />
                            </div>
                            <button type="submit">{editingUserId ? "Update User" : "Create User"}</button>
                        </form>

                    <h3>Users</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Password</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Date of Birth</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.password}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.dateOfBirth}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.is_active ? "Yes" : "No"}</td>
                                    <td>
                                        <button onClick={() => handleEdit(user)}>Edit</button>
                                        <button onClick={() => toggleActive(user.id)}>
                                            Toggle Active
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <div>
                    <h2>You have been logged out. Please log in again to continue.</h2>
                </div>
            )}
            </div>
    );
};
            const headerStyle = {
                position: "fixed" as 'fixed', // Fix the header to the top
                top: 0,
                left: 0,
                width: "100%",
                padding: "0px 10px",
                backgroundColor: "#333",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 1000, // Ensure it's above other content
};

            const buttonStyle = {
            backgroundColor: "#e44d26",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
};
const formStyle = {
    marginTop: "60px", // Add space so the form isn't covered by the fixed header
    marginBottom: "20px",
};
export default AdminPanel;