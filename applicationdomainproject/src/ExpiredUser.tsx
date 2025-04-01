import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from "react-router-dom";
import HelpButton from "./HelpButton.tsx";
import BaseUser from './User/BaseUser.ts';


const ExpiredUsers = () => {
    const [expiredUsers, setExpiredUsers] = useState<BaseUser[]>([]);
    const [soonToExpireUsers, setSoonToExpireUsers] = useState<BaseUser[]>([]);
    const [currentUser, setCurrentUser] = useState<BaseUser | null>(null); // Track the logged-in user
    const [users, setUsers] = useState<BaseUser[]>([]);

    const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.user?.id;

            if (userId) {
                const { data: userData, error } = await supabase
                    .from('User_Credentials')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (!error) {
                    setCurrentUser(userData);
                }
            }
        };
        const fetchUsers = async () => {

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

            const currentDate = new Date();
            const expiredUsersList: BaseUser[] = [];
            const soonToExpireUsersList: BaseUser[] = [];

            users?.forEach((user: BaseUser) => {
                
                    const createdDate = new Date(user.createdAt);
                    console.log(user);
                    const expire: Date = user.password.expireOn ?? new Date();
                const expiryDate = new Date(expire);
                expiryDate.setFullYear(createdDate.getFullYear() + 1);
                const diffTime = expire.getTime() - currentDate.getTime();
                    const diffDays = diffTime / (1000 * 3600 * 24);

                    if (diffDays < 0) {
                        expiredUsersList.push(user);
                    } else if (diffDays <= 14) {
                        soonToExpireUsersList.push(user);
                    }
                
            });

            setExpiredUsers(expiredUsersList);
            setSoonToExpireUsers(soonToExpireUsersList);


        }
        fetchCurrentUser();
        fetchUsers();
    }, []);

    const getRowColor = (user: BaseUser) => {
        const createdDate = new Date(user.createdAt);
        console.log(user);
        const expire: Date = user.password.expireOn ?? new Date();
        const expiryDate = new Date(expire);
        expiryDate.setFullYear(createdDate.getFullYear() + 1);
        const currentDate = new Date();
        const diffTime = expire.getTime() - currentDate.getTime();
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
    console.log(soonToExpireUsers);

                    console.log(expiredUsers);
    return (
        <div>
            {currentUser?.role !== 'admin' && (
                <>
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
                                <p>{user.username} - {user.email} (Expires in {Math.ceil((new Date(user.createdAt).setFullYear(new Date(user.createdAt).getFullYear() + 1) - new Date().getTime()) / (1000 * 3600 * 24))} days)</p>
                            </li>
                        ))}
                    </ul>
                </>
            )}

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
                        <td>{user.password.password}</td>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.dob}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Link to="/admin">
                <button style={buttonStyle}>Back to Admin Hub</button>
            </Link>
            {/* Help Button */}
            <HelpButton />
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
