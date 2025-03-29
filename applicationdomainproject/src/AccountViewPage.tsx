import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Supabase setup
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


interface Transaction {
    id: number;
    account_id: number;
    description: string;
    debit: number;
    credit: number;
    created_at: string;
}

interface Account {
    id: number;
    account_name: string;
    account_number: number;
    account_description: string;
    account_catagory: string;
    balance: number;
}

const AccountViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const [account, setAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccount = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("Chart_Of_Accounts")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching account:", error);
            } else {
                setAccount(data);
            }
            setLoading(false);
        };

        const fetchTransactions = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("Transactions")
                .select("*")
                .eq("account_id", id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching transactions:", error);
            } else {
                setTransactions(data || []);
            }
        };

        fetchAccount();
        fetchTransactions();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!account) return <p>Account not found</p>;

    return (
        <div className="container">
            <h1>Account {account.account_number} Details</h1>
            <form>
                <div><label>Account Name:</label><input type="text" value={account.account_name} readOnly /></div>
                <div><label>Account Number:</label><input type="text" value={account.account_number} readOnly /></div>
                <div><label>Description:</label><input type="text" value={account.account_description} readOnly /></div>
                <div><label>Category:</label><input type="text" value={account.account_catagory} readOnly /></div>
                <div><label>Balance:</label><input type="number" value={account.balance} readOnly /></div>
            </form>
            <h2>Ledger Transactions</h2>
            <table>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                        <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                        <td>{transaction.description}</td>
                        <td>{transaction.debit ? `$${transaction.debit}` : "-"}</td>
                        <td>{transaction.credit ? `$${transaction.credit}` : "-"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={() => navigate(-1)} className="view-button">Back to Accounts</button>
        </div>
    );
};

export default AccountViewPage;
