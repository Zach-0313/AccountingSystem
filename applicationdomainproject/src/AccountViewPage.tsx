import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import HelpButton from "./HelpButton.tsx";

// Supabase setup
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

const AccountViewPage = () => {
    const { id } = useParams<{ id: string }>(); // Get account ID from URL params
    const navigate = useNavigate(); // useNavigate must be inside a React component
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [accountLogs, setAccountLogs] = useState<AccountLog[]>([]);
    const [accountNumber, setAccountNumber] = useState<number>();
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
                setAccountNumber(account?.account_number);
                setLoading(false);
            }
        };
        fetchAccount();
    }, [id]);

    const fetchAccountLogs = async () => {
        if (!id) return;
        const { data, error } = await supabase
            .from("Chart_Of_Accounts_Change_Log")
            .select("*")
            .eq("account_id", id) // Fetch logs for this account
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching account logs:", error);
        } else {
            setAccountLogs(data);
            setIsPopupOpen(true); // Open popup after fetching data
        }
    };

    const closePopup = () => setIsPopupOpen(false);

    if (loading) return <p>Loading...</p>;
    if (!account) return <p>Account not found</p>;

    const PublishAccountLog = async (account: Account, change: string) => {
        const { error } = await supabase
            .from('Chart_Of_Accounts_Change_Log')
            .insert([
                {
                    account_name: account.account_name,
                    account_id: account.id,
                    account_description: account.account_description,
                    normal_side: account.normal_side,
                    account_catagory: account.account_catagory,
                    account_subcatagory: account.account_subcatagory,
                    initial_balance: account.initial_balance,
                    debit: account.debit,
                    credit: account.credit,
                    balance: account.balance,
                    user_id: account.user_id,
                    order: account.order,
                    statement: account.statement,
                    edited_by: change
                }
            ]);

        if (error) {
            console.error("Error inserting account log:", error);
        } else {
            navigate(-1); // Navigate back on success
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!account) return <p>Account not found</p>;

    return (
        <div className="container">
            <h1>Account {account.account_number} Details</h1>
            <form>
                <div>
                    <label>Account Name:</label>
                    <input type="text" value={account.account_name} readOnly />
                </div>
                <div>
                    <label>Account Number:</label>
                    <input type="text" value={account.account_number} readOnly />
                </div>
                <div>
                    <label>Description:</label>
                    <input type="text" value={account.account_description} readOnly />
                </div>
                <div>
                    <label>Category:</label>
                    <input type="text" value={account.account_catagory} readOnly />
                </div>
                <div>
                    <label>Balance:</label>
                    <input type="number" value={account.balance} readOnly />
                </div>
            </form>

            <button className="view-button" onClick={fetchAccountLogs}>
                View Account History
            </button>
            <button onClick={() => PublishAccountLog(account, "viewed")} className="view-button">
                Back to Accounts
            </button>

            {isPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h2>Account Change History</h2>
                        <button className="close-button" onClick={closePopup}>×</button>
                        {accountLogs.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                        <th>Balance</th>
                                        <th>Action Performed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                            <td>{log.debit}</td>
                                            <td>{log.credit}</td>
                                            <td>{log.balance}</td>
                                            <td>{log.edited_by}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No history found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountViewPage;