/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import UserManager from "./User/UserManager";
import BaseUser from "./User/BaseUser";
import BasePassword from "./User/BasePassword";
const AdminPanel = () => {
    // Get user management functionality from UserManager
    const {
        users,
        createOrUpdateUser,
        deleteUser,
        toggleActive,
        loading,
        error
    } = UserManager();

    // Form state for creating/updating users
    const [formUser, setFormUser] = useState<BaseUser>(
        new BaseUser("", "", new BasePassword(""), "", "", "1990-01-01", "", "user", true)
    );

    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    // Set form data if editing an existing user
    useEffect(() => {
        if (editingUserId) {
            const userToEdit = users.find((user) => user.id === editingUserId);
            if (userToEdit) {
                setFormUser(userToEdit);
            }
        }
    }, [editingUserId, users]);

    const handleInputChange = (field: string, value: any) => {
        setFormUser((prevUser) => {
          //  let updatedUser = { ...prevUser };

            switch (field) {
                case "username":
                    prevUser.username = value;
                    break;
                case "password":
                    prevUser.password.password = value;
                    break;
                case "firstName":
                    prevUser.firstName = value;
                    break;
                case "lastName":
                    prevUser.lastName = value;
                    break;
                case "email":
                    prevUser.email = value;
                    break;
                case "dateOfBirth":
                    prevUser.dateOfBirth = value;
                    break;
                case "role":
                    prevUser.role = value;
                    break;
                // Add cases for other fields here if necessary
                default:
            }

            return prevUser;
        });
    };


    const handleSaveUser = async () => {
        await createOrUpdateUser(formUser); // Create or update the user
        setFormUser(new BaseUser("", "", new BasePassword(""), "", "", "1990-01-01", "", "user", true)); // Reset form
        setEditingUserId(null); // Reset editing state
    };

    const handleDeleteUser = async (id: string) => {
        await deleteUser(id); // Delete user from the database and state
    };

    const handleEditUser = (id: string) => {
        setEditingUserId(id); // Set user to be edited
    };

    const handleToggleActive = (id: string) => {
        toggleActive(id); // Toggle the active status of the user
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div>
                <h2>{editingUserId ? "Edit User" : "Create User"}</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={formUser.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formUser.password.password}
                    onChange={(e) =>
                        handleInputChange("password", new BasePassword(e.target.value))}
                />
                <input
                    type="text"
                    placeholder="First Name"
                    value={formUser.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={formUser.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
                <input
                    type="date"
                    value={formUser.dob}
                    onChange={(e) => handleInputChange("dateOfBirth", new Date(e.target.value))}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formUser.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <select
                    value={formUser.role}
                    onChange={(e) => handleInputChange("role", e.target.value as "admin" | "user" | "manager")}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                </select>
                <label>
                    Active:
                    <input
                        type="checkbox"
                        checked={formUser.is_active}
                        onChange={() => handleInputChange("is_active", !formUser.is_active)}
                    />
                </label>
                <button onClick={handleSaveUser}>{editingUserId ? "Save Changes" : "Create User"}</button>
            </div>

            <h3>Users List</h3>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Email</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.password.password}</td>
                            <td>{user.email}</td>
                            <td>{user.is_active ? "Yes" : "No"}</td>
                            <td>
                                <button onClick={() => handleEditUser(user.id)}>Edit</button>
                                <button onClick={() => handleToggleActive(user.id)}>
                                    {user.is_active ? "Deactivate" : "Activate"}
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
