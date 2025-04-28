import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Supabase setup
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Transaction {
    id: number;           // ID of Journal_Entry_Line (the real line ID)
    journal_id: number;    // ID of Journal_Entry (the journal entry)
    description: string;
    debit: number;
    credit: number;
    created_at: string;
    status: "Approved" | "Pending" | "Rejected";  // Optional: to show status
  }
  

interface RawTransaction {
  journal_id: number;
  debit: number;
  credit: number;
  account_id: number;
  created_at: string | null;
  Journal_Entries?: {
    description: string;
    status: string;
    created_at: string;
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

interface AccountLog {
  id: number;
  created_at: string;
  debit: number;
  credit: number;
  balance: number;
  edited_by: string;
}

const AccountViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [accountLogs, setAccountLogs] = useState<AccountLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [balance, setBalance] = useState(0);

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
        setLoading(false);
      } else {
        setAccount(data);
        setLoading(false);
      }
    };
    fetchAccount();
  }, [id]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account?.account_number) return;
  
      // Step 1: Fetch all Journal Entry Lines for this account
      const { data: linesData, error: linesError } = await supabase
      .from("Journal_Entry_Lines")
      .select("*")
      .eq("account_id", account.account_number)
      .order("created_at", { ascending: false });
    
    if (linesError) {
      console.error("Error fetching journal entry lines:", linesError);
      return;
    }
    
    if (!linesData || linesData.length === 0) {
      console.log("No journal entry lines found for this account.");
      setTransactions([]);
      setLoading(false);
      return;
    }
    
    // Get all unique non-null journal_ids
const uniqueJournalIds = [...new Set(
    linesData.map((line) => line.journal_id).filter((id) => id !== null)
  )];
  
  // Only fetch journal entries if there are some valid ids
  let journalEntryMap = new Map<number, { description: string; status: string; created_at: string }>();
  
  if (uniqueJournalIds.length > 0) {
    const { data: journalsData, error: journalsError } = await supabase
      .from("Journal_Entries")
      .select("journal_id, description, status, created_at")
      .in("journal_id", uniqueJournalIds);
  
    if (journalsError) {
      console.error("Error fetching journal entries:", journalsError);
      return;
    }
  
    journalsData?.forEach((entry) => {
      journalEntryMap.set(entry.journal_id, {
        description: entry.description,
        status: entry.status,
        created_at: entry.created_at,
      });
    });
  }
    
    // Now merge: if missing journal entry, use fallback defaults
    const mergedTransactions: Transaction[] = linesData.map((line) => {
      const journalEntry = journalEntryMap.get(line.journal_id);
    
      return {
        id: line.id,                      // <- line id is unique
        journal_id: line.journal_id,       // <- journal id to group lines
        description: journalEntry?.description ?? "No description",
        status: journalEntry?.status ?? "Approved",   // Default to Approved if missing
        debit: line.debit,
        credit: line.credit,
        created_at: (journalEntry?.created_at ?? line.created_at)
          ? new Date(journalEntry?.created_at ?? line.created_at).toLocaleDateString()
          : "Unknown",
      };
    });
    
    // Step 5: Filter only Approved for totals
    const approvedTransactions = mergedTransactions.filter(
      (tx) => tx.status === "Approved"
    );
    
    const totalDebit = approvedTransactions.reduce(
      (acc, tx) => acc + (tx.debit || 0),
      0
    );
    const totalCredit = approvedTransactions.reduce(
      (acc, tx) => acc + (tx.credit || 0),
      0
    );
    const balance = totalDebit - totalCredit;
    
    setTransactions(mergedTransactions);
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
      .eq("account_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching account logs:", error);
    } else {
      setAccountLogs(data);
      setIsPopupOpen(true);
    }
  };

  const closePopup = () => setIsPopupOpen(false);

  const PublishAccountLog = async (
    account: Account,
    debit: number,
    credit: number,
    balance: number,
    change: string
  ) => {
    const { error } = await supabase.from("Chart_Of_Accounts_Change_Log").insert([
      {
        account_name: account.account_name,
        account_id: account.id,
        account_description: account.account_description,
        normal_side: account.normal_side,
        account_catagory: account.account_catagory,
        account_subcatagory: account.account_subcatagory,
        initial_balance: account.initial_balance,
        debit: debit,
        credit: credit,
        balance: balance,
        user_id: account.user_id,
        order: account.order,
        statement: account.statement,
        edited_by: change,
      },
    ]);

    if (error) {
      console.error("Error inserting account log:", error);
    } else {
      navigate(-1);
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
      <button
        onClick={() =>
          PublishAccountLog(account, totalDebit, totalCredit, balance, "viewed")
        }
        className="view-button"
      >
        Back to Accounts
      </button>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Account Change History</h2>
            <button className="close-button" onClick={closePopup}>
              ×
            </button>
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
                      <td>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleDateString()
                          : "Date"}
                      </td>
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  {transactions.length === 0 ? (
    <tr>
      <td colSpan={5}>No transactions found</td>
    </tr>
  ) : (
    transactions.map((txn) => (
        <tr key={`${txn.id}-${txn.journal_id}`}>
        <td>{txn.created_at}</td>
        <td>{txn.description}</td>
        <td>{txn.debit ? `$${txn.debit.toFixed(2)}` : "-"}</td>
        <td>{txn.credit ? `$${txn.credit.toFixed(2)}` : "-"}</td>
        <td>
          {txn.status === "Approved" && <span style={{ color: "green" }}>✔ Approved</span>}
          {txn.status === "Pending" && <span style={{ color: "orange" }}>⏳ Pending</span>}
          {txn.status === "Rejected" && <span style={{ color: "red" }}>❌ Rejected</span>}
        </td>
      </tr>
    ))
  )}
</tbody>

        <tfoot>
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td></td>
            <td>
              <strong>${totalDebit.toFixed(2)}</strong>
            </td>
            <td>
              <strong>${totalCredit.toFixed(2)}</strong>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <strong>Balance</strong>
            </td>
            <td colSpan={4}>
              <strong>${balance.toFixed(2)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default AccountViewPage;
