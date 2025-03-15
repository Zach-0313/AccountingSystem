import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import "./App.css";
import LoginScreen from "./LoginScreen";
import Header from "./Header";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Account {
    id: number;
    date: string;
    created_at: string;
    account_name: string;
    account_number: number;
    account_description: string;
    normal_side: number;
    account_catagory: string;
    account_subcatagory: string;
    initial_balance: number;
    debit: number;
    credit: number;
    balance: number;
    user_id: number;
    order: string;
    statement: string;
    comment: string;
}

const AccountTable = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data, error } = await supabase.from("Chart_Of_Accounts").select("*");
            if (error) {
                console.error("Error fetching accounts:", error);
            } else {
                setAccounts(data || []);
            }
        };
        fetchAccounts();
    }, []);
    const handleLogout = () => setIsLoggedIn(false);

    if (!isLoggedIn) return <LoginScreen />;

    return (
        <div className="container">
            <Header label="Admin Panel" logout={handleLogout} />

            <h1>Accounts</h1>
            <table>
                <thead>
                    <tr>
                        <th>Account Name</th>
                        <th>Account Number</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr key={account.id}>
                            <td>{account.account_name}</td>
                            <td>{account.account_number}</td>
                            <td>{account.account_description}</td>
                            <td>{account.account_catagory}</td>
                            <td>{account.debit}</td>
                            <td>{account.credit}</td>
                            <td>{account.balance}</td>
                            <td>
                                <Link to={`/accounts/${account.id}`} className="view-button">View</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AccountDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Add loading state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccount = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("Chart_Of_Accounts") // Ensure table name is correct
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching account:", error);
                setLoading(false);  // Stop loading if there's an error
            } else {
                console.log("Fetched account data:", data);
                setAccount(data);
                setLoading(false);  // Stop loading after data is set
            }
        };
        fetchAccount();
    }, [id]);

    if (loading) {
        return <p>Loading...</p>;  // Show loading state while data is being fetched
    }

    if (!account) {
        return <p>Account not found</p>; // Display if no account found
    }

    return (
        <div className="container">
            <h1>Account Details</h1>

            {Object.entries(account).map(([key, value]) => (
                <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}</p>
            ))}
            <button onClick={() => navigate(-1)} className="view-button">Back to Accounts</button>
        </div>
    );
};

const AccountView = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AccountTable />} />
                <Route path="/accounts/:id" element={<AccountDetail />} />
            </Routes>
        </Router>
    );
};

export default AccountView;

