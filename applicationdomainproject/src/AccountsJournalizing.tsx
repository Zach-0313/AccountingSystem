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
            lines: [
                { account_id: "", debit: "", credit: "" },
                { account_id: "", debit: "", credit: "" }
            ]
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data, error } = await supabase
                .from("Chart_Of_Accounts")
                .select("id, account_name, normal_side");
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

    const addEntry = () => {
        setEntries([
            ...entries,
            {
                description: "",
                lines: [
                    { account_id: "", debit: "", credit: "" },
                    { account_id: "", debit: "", credit: "" }
                ]
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
                const { data: journalEntry, error } = await supabase
                    .from("Journal_Entries")
                    .insert([{ created_at: new Date().toISOString(), status: "Pending", description: entry.description }])
                    .select()
                    .single();

                if (error) throw new Error(error.message);

                const entryId = journalEntry.id;

                const linesPayload = entry.lines.map((line) => ({
                    journal_entry_id: entryId,
                    account_id: parseInt(line.account_id),
                    debit: parseFloat(line.debit) || 0,
                    credit: parseFloat(line.credit) || 0,
                    description: entry.description,
                    created_at: new Date().toISOString()
                }));

                const { error: linesError } = await supabase
                    .from("Journal_Entry_Lines")
                    .insert(linesPayload);

                if (linesError) throw new Error(linesError.message);
            }

            setEntries([{ description: "", lines: [{ account_id: "", debit: "", credit: "" }] }]);
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
                                            {accounts.map((acct : any) => (
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

                        {/* Entry description */}
                        <div className="mt-2">
                            <label className="text-sm font-medium">Entry Description</label>
                            <input
                                type="text"
                                value={entry.description}
                                onChange={(e) => handleEntryChange(entryIndex, "description", e.target.value)}
                                className="w-full border p-2 mt-1 rounded"
                                placeholder="Enter description..."
                            />
                        </div>
                        {!isBalanced(entry.lines) && (
                            <div style={{ color: 'red', fontWeight: 'bold', marginTop: '8px' }}>
                            <p>
                                This entry is not balanced. Total debits must equal total credits.
                            </p>
                            </div>
                        )}

                        {/* Running Totals */}
                        <div className="flex justify-end gap-6 mt-3 font-semibold text-sm">
                            <div>Total Debit: ${totals.debit.toFixed(2)}</div>
                            <div>Total Credit: ${totals.credit.toFixed(2)}</div>
                        </div>

                        <div className="mt-2 flex gap-2">
                            <button onClick={() => addLine(entryIndex)} className="text-blue-600">
                                + Add Line
                            </button>
                            <button onClick={() => removeEntry(entryIndex)} className="text-red-500">
                                Remove Entry
                            </button>
                        </div>
                    </div>
                );
            })}

            <div className="flex gap-4">
                <button onClick={addEntry} className="bg-blue-600 text-white px-4 py-2 rounded">
                    + Add New Entry
                </button>
                <button
                    onClick={submitEntries}
                    disabled={!allEntriesBalanced || loading}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        color: 'white',
                        backgroundColor: !allEntriesBalanced || loading ? 'gray' : 'green',
                        cursor: !allEntriesBalanced || loading ? 'not-allowed' : 'pointer',
                        border: 'none',
                    }}
                >
                    Submit Entries
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