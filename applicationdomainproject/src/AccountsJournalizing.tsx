import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AccountsNavbar from "./AccountsNavbar";
import Header from "./Header";

const supabase = createClient(
    "https://tfgesyyngnxrvzckszfy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4"
);

const AccountsJournalizing = () => {
    const [accounts, setAccounts] = useState([]);
    const [entries, setEntries] = useState([
        {
            description: "",
            lines: [{ account_id: "", debit: "", credit: "" }],
            file: null as File | null, // Added
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data, error } = await supabase
                .from("Chart_Of_Accounts")
                .select("id, account_number, account_name, normal_side");
            if (error) console.error(error);
            else setAccounts(data);
        };
        fetchAccounts();
    }, []);

    const handleEntryChange = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);
    };

    const handleLineChange = (entryIndex, lineIndex, field, value) => {
        const updated = [...entries];
        updated[entryIndex].lines[lineIndex][field] = value;
        setEntries(updated);
    };

    const handleFileChange = (entryIndex: number, file: File | null) => {
        const updated = [...entries];
        updated[entryIndex].file = file;
        setEntries(updated);
    };

    const addEntry = () => {
        setEntries([
            ...entries,
            {
                description: "",
                lines: [{ account_id: "", debit: "", credit: "" }],
                file: null,
            }
        ]);
    };

    const addLine = (entryIndex) => {
        const updated = [...entries];
        updated[entryIndex].lines.push({ account_id: "", debit: "", credit: "" });
        setEntries(updated);
    };

    const removeEntry = (index) => {
        const updated = [...entries];
        updated.splice(index, 1);
        setEntries(updated);
    };

    const getAccountNormalSide = (accountId) => {
        const account = accounts.find((a) => a.id === parseInt(accountId));
        return account?.normal_side || "";
    };

    const calculateTotals = (lines) => {
        return {
            debit: lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0),
            credit: lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0)
        };
    };

    const isBalanced = (lines) => {
        const totals = calculateTotals(lines);
        return totals.debit === totals.credit;
    };
    const getAccountDetails = (accountId) => {
        const account = accounts.find((a) => a.id === parseInt(accountId));
        return account ? { normalSide: account.normal_side, accountNumber: account.account_number } : {};
    };
    

    const submitEntries = async () => {
        setLoading(true);
        try {
            for (const entry of entries) {
                const totals = calculateTotals(entry.lines);
                if (totals.debit !== totals.credit) {
                    setFeedbackType("error");
                    setFeedbackMessage("One or more journal entries are unbalanced.");
                    setLoading(false);
                    return;
                }
            }
    
            for (const entry of entries) {
                let attachmentUrl = null;
                if (entry.file) {
                    const fileExt = entry.file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
                    const { data: storageData, error: storageError } = await supabase
                        .storage
                        .from('journal-attachments')
                        .upload(`attachments/${fileName}`, entry.file);
    
                    if (storageError) {
                        console.error(storageError);
                        throw new Error("Error uploading attachment.");
                    }
    
                    attachmentUrl = storageData?.path;
                }
    
                const { error: insertError } = await supabase
                    .from("Journal_Entries")
                    .insert([{
                        created_at: new Date().toISOString(),
                        status: "Pending",
                        description: entry.description,
                        attachment_url: attachmentUrl,
                    }]);
    
                if (insertError) throw new Error(insertError.message);
    
                const { data: fetchedEntry, error: fetchError } = await supabase
                    .from("Journal_Entries")
                    .select("journal_id")
                    .order('created_at', { ascending: false })
                    .limit(1);
    
                if (fetchError || !fetchedEntry || fetchedEntry.length === 0) {
                    throw new Error("Failed to fetch the newly created journal entry.");
                }
    
                const entryId = fetchedEntry[0].journal_id;
    
                // Insert Journal Entry Lines with account_number
                const linesPayload = entry.lines.map((line) => {
                    const accountDetails = getAccountDetails(line.account_id);
                    console.log("ADDING JOURNAL LINES ID:" + entryId + "ACCOUNT NUMBER: " + accountDetails.accountNumber);
                    return {
                        journal_id: entryId,
                        account_id: accountDetails.accountNumber,  // Use account_number
                        debit: parseFloat(line.debit) || 0,
                        credit: parseFloat(line.credit) || 0,
                        created_at: new Date().toISOString(),
                        attachment_url: attachmentUrl
                    };
                });
    
                const { error: linesError } = await supabase
                    .from("Journal_Entry_Lines")
                    .insert(linesPayload);
    
                if (linesError) throw new Error(linesError.message);
            }
    
            setEntries([{ description: "", lines: [{ account_id: "", debit: "", credit: "" }], file: null }]);
            setFeedbackType("success");
            setFeedbackMessage("Entries submitted successfully!");
        } catch (error) {
            console.error(error);
            setFeedbackType("error");
            setFeedbackMessage("Error submitting entries. Try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const allEntriesBalanced = entries.every(entry => {
        const totals = calculateTotals(entry.lines);
        return totals.debit === totals.credit;
    });

    return (
        <div className="p-4">
            <Header label="Accounts Journalizing" />
            <AccountsNavbar />

            {entries.map((entry, entryIndex) => {
                const totals = calculateTotals(entry.lines);

                return (
                    <div key={entryIndex} className="border p-4 mb-6 shadow rounded">
                        <table className="w-full border-collapse mt-2">
                            <thead>
                                <tr className="border-b font-semibold">
                                    <th className="text-left">Account</th>
                                    <th className="text-left">Normal Side</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.lines.map((line, lineIndex) => (
                                    <tr key={lineIndex} className="border-b">
                                        <td>
                                            <select
                                                value={line.account_id}
                                                onChange={(e) =>
                                                    handleLineChange(entryIndex, lineIndex, "account_id", e.target.value)
                                                }
                                                className="w-full border rounded p-1"
                                            >
                                                <option value="">Select Account</option>
                                                {accounts.map((acct: any) => (
                                                    <option key={acct.id} value={acct.id}>
                                                        {acct.account_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="text-gray-500">
                                            {getAccountNormalSide(line.account_id)}
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={line.debit}
                                                onChange={(e) =>
                                                    handleLineChange(entryIndex, lineIndex, "debit", e.target.value)
                                                }
                                                className="w-full border p-1 rounded"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={line.credit}
                                                onChange={(e) =>
                                                    handleLineChange(entryIndex, lineIndex, "credit", e.target.value)
                                                }
                                                className="w-full border p-1 rounded"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Add Line Button */}
                        <div className="mt-3">
                            <button
                                onClick={() => addLine(entryIndex)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                ➕ Add Line to Entry
                            </button>
                        </div>

                        {/* Entry Description */}
                        <div className="mt-4">
                            <label className="text-sm font-medium">Entry Description</label>
                            <input
                                type="text"
                                value={entry.description}
                                onChange={(e) => handleEntryChange(entryIndex, "description", e.target.value)}
                                className="w-full border p-2 mt-1 rounded"
                                placeholder="Enter description..."
                            />
                        </div>

                        {/* File Upload */}
                        <div className="mt-4">
                            <label className="text-sm font-medium">Attachment (optional)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(entryIndex, e.target.files?.[0] || null)}
                                className="w-full border p-2 mt-1 rounded"
                            />
                        </div>

                        {/* Error Message */}
                        {!isBalanced(entry.lines) && (
                            <div style={{ color: 'red', fontWeight: 'bold', marginTop: '8px' }}>
                                <p>This entry is not balanced. Total debits must equal total credits.</p>
                            </div>
                        )}

                        {/* Running Totals */}
                        <div className="flex justify-end gap-6 mt-3 font-semibold text-sm">
                            <div>Total Debit: ${totals.debit.toFixed(2)}</div>
                            <div>Total Credit: ${totals.credit.toFixed(2)}</div>
                        </div>

                        {/* Remove Entry Button */}
                        <div className="mt-4">
                            <button
                                onClick={() => removeEntry(entryIndex)}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Remove This Entry
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Add & Submit Buttons */}
            <div className="flex gap-4 mt-6">
                <button
                    onClick={addEntry}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    ➕ Add New Journal Entry
                </button>

                <button
                    onClick={submitEntries}
                    disabled={!allEntriesBalanced || loading}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        color: 'white',
                        backgroundColor: !allEntriesBalanced || loading ? 'gray' : 'green',
                        cursor: !allEntriesBalanced || loading ? 'not-allowed' : 'pointer',
                        border: 'none',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                    }}
                >
                    Submit
                </button>
            </div>

            {feedbackMessage && (
                <div
                    className={`mt-4 p-4 rounded ${
                        feedbackType === "success" ? "bg-green-500" : "bg-red-500"
                    } text-white`}
                >
                    {feedbackMessage}
                </div>
            )}
        </div>
    );
};

export default AccountsJournalizing;
