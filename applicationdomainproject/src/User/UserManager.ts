import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import BaseUser from "./BaseUser";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const UserManager = () => {
    const [users, setUsers] = useState<BaseUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all users from the database
    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await supabase.from("User_Credentials").select("id, user");
                if (res.error) {
                    throw new Error(res.error.message);
                }
                const newUsers = res.data?.map(entry => BaseUser.fromJSON(entry.user)) || [];
                setUsers(newUsers);
            } catch {
                setError("Get User Error");
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    // Handle creating or updating a user
    const createOrUpdateUser = async (user: BaseUser) => {
        setLoading(true);
        setError(null);
        try {
            const userJson = user.toJSON();
            if (user.id) {
                // Update existing user
                const { error } = await supabase
                    .from("User_Credentials")
                    .update({ user: userJson })
                    .eq("id", user.id);

                if (error) {
                    throw new Error(error.message);
                }
            } else {
                // Create new user
                const { error } = await supabase
                    .from("User_Credentials")
                    .insert([{ id: user.id, user: userJson }]);

                if (error) {
                    throw new Error(error.message);
                }
            }
            // Refresh users after successful create or update
            setUsers(prevUsers => {
                console.log("SETTING USER");
                const index = prevUsers.findIndex(u => u.id === user.id);
                if (index >= 0) {
                    prevUsers[index] = user; // Update existing user
                } else {
                    prevUsers.push(user); // Add new user
                }
                return [...prevUsers];
            });
        } catch {
            setError("Create or Edit Error");
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting a user
    const deleteUser = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from("User_Credentials")
                .delete()
                .eq("id", id);

            if (error) {
                throw new Error(error.message);
            }
            // Remove the user from state after deletion
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        } catch {
            setError("Delete Error");
        } finally {
            setLoading(false);
        }
    };

    // Handle toggling user active status
    const toggleActive = async (id: string) => {
        setLoading(true);
        setError(null);
        const userToUpdate = users.find(user => user.id === id);
        if (!userToUpdate) return;

        try {
            const { error } = await supabase
                .from("User_Credentials")
                .update({ is_active: !userToUpdate.is_active })
                .eq("id", id);

            if (error) {
                throw new Error(error.message);
            }
        } catch {
            setError("Toggle Active Error");
        } finally {
            setLoading(false);
        }
    };

    return {
        users,
        createOrUpdateUser,
        deleteUser,
        toggleActive,
        loading,
        error
    };
};

export default UserManager;