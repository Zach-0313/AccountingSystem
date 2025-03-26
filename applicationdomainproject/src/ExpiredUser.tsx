import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from "react-router-dom";

interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    password: string;
    first_name: string;
    last_name: string;
    birthday: string;
    role: "admin" | "user" | "manager";
    is_active: boolean;
}

const ExpiredUsers = () => {
    const [expiredUsers, setExpiredUsers] = useState<User[]>([]);
    const [soonToExpireUsers, setSoonToExpireUsers] = useState<User[]>([]);

    const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch users with the correct field names from Supabase
                const { data, error } = await supabase
                    .from('User_Credentials_Test') // Replace with your actual table name
                    .select('id, username, email, created_at, password, first_name, last_name, birthday, role, is_active');

                if (error) {
                    throw error;
                }

                const currentDate = new Date();
                const expiredUsersList: User[] = [];
                const soonToExpireUsersList: User[] = [];

                data?.forEach((user: User) => {
                    const createdDate = new Date(user.created_at);
                    const expiryDate = new Date(createdDate);
                    expiryDate.setFullYear(createdDate.getFullYear() + 1);
                    const diffTime = expiryDate.getTime() - currentDate.getTime();
                    const diffDays = diffTime / (1000 * 3600 * 24);

                    if (diffDays <= 0) {
                        expiredUsersList.push(user);
                    } else if (diffDays <= 14) {
                        soonToExpireUsersList.push(user);
                    }
                });

                setExpiredUsers(expiredUsersList);
                setSoonToExpireUsers(soonToExpireUsersList);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [supabase]);

    const getRowColor = (user: User) => {
        const createdDate = new Date(user.created_at);
        const expiryDate = new Date(createdDate);
        expiryDate.setFullYear(createdDate.getFullYear() + 1);
        const currentDate = new Date();
        const diffTime = expiryDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        if (diffDays <= 0) {
            return "red";
        } else if (diffDays <= 14 && diffDays > 9) {
            return "green";
        } else if (diffDays <= 9 && diffDays > 0) {
            return "yellow";
        }
        return "white";
    };

    return (
        <div>
            <h5>Expired Users:</h5>
            <ul>
                {expiredUsers.map((user) => (
                    <li key={user.id}>
                        <p>{user.username} - {user.email} (Expired)</p>
                    </li>
                ))}
            </ul>

            <h5>Soon-to-be Expired Users (14 days remaining):</h5>
            <ul>
                {soonToExpireUsers.map((user) => (
                    <li key={user.id}>
                        <p>{user.username} - {user.email} (Expires in {Math.ceil((new Date(user.created_at).setFullYear(new Date(user.created_at).getFullYear() + 1) - new Date().getTime()) / (1000 * 3600 * 24))} days)</p>
                    </li>
                ))}
            </ul>

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
                </tr>
                </thead>
                <tbody>
                {expiredUsers.concat(soonToExpireUsers).map((user) => (
                    <tr key={user.id} style={{ backgroundColor: getRowColor(user) }}>
                        <td>{user.username}</td>
                        <td>{user.password}</td>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.birthday}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Link to="/admin">
                <button style={buttonStyle}>Back to Admin Hub</button>
            </Link>
        </div>
    );
};

const buttonStyle = {
    backgroundColor: "#e44d26",
    color: "white",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "5px"
};

export default ExpiredUsers;
