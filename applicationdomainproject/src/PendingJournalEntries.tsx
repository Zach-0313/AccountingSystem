import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import Header from "./Header";

// Initialize Supabase
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface JournalEntry {
    journal_id: number;
    description: string;
    status: "Rejected" | "Pending" | "Approved";
}

const statusCycle = ["Rejected", "Pending", "Approved"];

export default function PendingJournalEntries() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<"All" | "Approved" | "Pending" | "Rejected">("All");

    useEffect(() => {
        fetchEntries();
    }, []);

    async function fetchEntries() {
        setLoading(true);
        const { data, error } = await supabase
            .from('Journal_Entries')
            .select('*');
        if (error) {
            console.error("Error fetching entries:", error);
        } else {
            console.log(data);
            setEntries(data as JournalEntry[]);
        }
        setLoading(false);
    }

    async function updateStatus(id: number, currentStatus: "Rejected" | "Pending" | "Approved") {
        const nextStatus =
            statusCycle[(statusCycle.indexOf(currentStatus) + 1) % statusCycle.length] as "Rejected" | "Pending" | "Approved";

        const { error } = await supabase
            .from("Journal_Entries")
            .update({ status: nextStatus })
            .eq("journal_id", id)
            .select();

        if (error) {
            console.error("Error updating status:", error);
        } else {
            setEntries((prevEntries) =>
                prevEntries.map((entry) =>
                    entry.journal_id === id ? { ...entry, status: nextStatus } : entry
                )
            );
        }
    }

    function handleFilterChange(selectedFilter: "All" | "Approved" | "Pending" | "Rejected") {
        setFilter(selectedFilter);
    }

    const filteredEntries = entries.filter((entry) => {
        if (filter === "All") return true;
        return entry.status === filter;
    });

    return (
        <div>
            <Header label="Approve/Reject Journal Entries" />

            <h1>Journal Entries</h1>

            <div>
                <button onClick={() => handleFilterChange("All")}>Show All</button>
                <button onClick={() => handleFilterChange("Approved")}>Approved</button>
                <button onClick={() => handleFilterChange("Pending")}>Pending</button>
                <button onClick={() => handleFilterChange("Rejected")}>Rejected</button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {filteredEntries.map((entry) => (
                        <li key={entry.journal_id}>
                            <p>{entry.description}</p>
                            <p>Status: {entry.status}</p>
                            <button onClick={() => updateStatus(entry.journal_id, entry.status)}>
                                Change Status
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Link to="/admin">
                <button>Back to Admin Hub</button>
            </Link>
        </div>
    );
}
