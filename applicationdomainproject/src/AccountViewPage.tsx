import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import HelpButton from "./HelpButton.tsx";

// Supabase setup
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Transaction {
    id: number;
    description: string;
    debit: number;
    credit: number;
    created_at: string;
}

interface RawTransaction {
    journal_id: number;
    debit: number;
    credit: number;
    account_id: number;
    created_at: string | null;

    Journal_Entries?: {
        description: string;
    }[];
}




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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [balance, setBalance] = useState(0);


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
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!account?.account_number) return;

            const { data, error } = await supabase
                .from("Journal_Entry_Lines")
                .select(`
                journal_id,
                debit,
                credit,
                account_id,
                Journal_Entries (
                    description,
                    created_at
                )
            `)
                .eq("account_id", account.account_number)
                .order("journal_id", { ascending: false });

            if (error) {
                console.error("Error fetching transactions:", error.message);
                return;
            }

            const formatted = (data as RawTransaction[]).map((entry) => {
                const journal = entry.Journal_Entries as { description?: string; created_at?: string } | null;

                return {
                    id: entry.journal_id,
                    description: journal?.description ?? "No description",
                    debit: entry.debit,
                    credit: entry.credit,
                    created_at: entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString()
                        : "Unknown date",
                };
            });
            console.log("Raw data entries:", data);



            setTransactions(formatted || []);
            const totalDebit = formatted.reduce((acc, tx) => acc + (tx.debit || 0), 0);
            const totalCredit = formatted.reduce((acc, tx) => acc + (tx.credit || 0), 0);
            const balance = totalDebit - totalCredit;

// Optional: if you want to use them in JSX, save them in state:
            setTotalDebit(totalDebit);
            setTotalCredit(totalCredit);
            setBalance(balance);

            setLoading(false);
        };

        fetchTransactions();
    }, [account]);


    const fetchAccountLogs = async () => {
        if (!id) return;
        const { data, error } = await supabase
            .from("Chart_Of_Accounts_Change_Log")
            .select("*")
            .eq("account_id", id) // Fetch logs for this account
            .order("created_at", { ascending: false })
            .limit(10);

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
                                        <td>{log.created_at ? new Date(log.created_at).toLocaleDateString() : "Date"}</td>
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
                {transactions.length === 0 ? (
                    <tr>
                        <td colSpan={4}>No transactions found</td>
                    </tr>
                ) : (
                    transactions.map((txn) => (
                        <tr key={txn.id}>
                            <td>
                                {txn.created_at && !isNaN(Date.parse(txn.created_at))
                                    ? new Date(txn.created_at).toLocaleDateString()
                                    : "Date"}
                            </td>
                            <td>{txn.description}</td>
                            <td>{txn.debit ? `$${txn.debit}` : "-"}</td>
                            <td>{txn.credit ? `$${txn.credit}` : "-"}</td>
                        </tr>
                    ))
                )}
                </tbody>
                <tfoot>
                <tr>
                    <td><strong>Total</strong></td>
                    <td></td>
                    <td><strong>${totalDebit.toFixed(2)}</strong></td>
                    <td><strong>${totalCredit.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td><strong>Balance</strong></td>
                    <td colSpan={3}><strong>${balance.toFixed(2)}</strong></td>
                </tr>
                </tfoot>

            </table>

        </div>
    );
};

export default AccountViewPage;