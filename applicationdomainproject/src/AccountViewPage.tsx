import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Supabase setup
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Account {
    id: number;
    account_name: string;
    account_number: number;
    account_description: string;
    account_catagory: string;
    balance: number;
    // Add any other fields you want to show
}

const AccountViewPage = () => {
    const { id } = useParams<{ id: string }>(); // Get account ID from URL params
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccount = async () => {
            if (!id) return; // If no ID, don't try to fetch
            const { data, error } = await supabase
                .from("Chart_Of_Accounts")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching account:", error);
                setLoading(false);
            } else {
                setAccount(data);
                setLoading(false);
            }
        };
        fetchAccount();
    }, [id]); // Fetch account whenever the ID changes

    if (loading) {
        return <p>Loading...</p>; // Display loading message while fetching data
    }

    if (!account) {
        return <p>Account not found</p>; // Display if no account data found
    }

    return (
        <div className="container">
            <h1>Account {account.id} Details</h1>
            <form>
                <div>
                    <label>Account Name:</label>
                    <input type="text" value={account.account_name} />
                </div>
                <div>
                    <label>Account Number:</label>
                    <input type="text" value={account.account_number}  />
                </div>
                <div>
                    <label>Description:</label>
                    <input type="text" value={account.account_description}  />
                </div>
                <div>
                    <label>Category:</label>
                    <input type="text" value={account.account_catagory}  />
                </div>
                <div>
                    <label>Balance:</label>
                    <input type="number" value={account.balance}  />
                </div>
                {/* Add other account details you want to display */}
            </form>

            <button onClick={() => navigate(-1)} className="view-button">
                Back to Accounts
            </button>
        </div>
    );
};

export default AccountViewPage;
