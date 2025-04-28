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
    attachment_url: string;
}

export default function PendingJournalEntries() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    async function fetchEntries() {
        setLoading(true);
        const { data, error } = await supabase
            .from("Journal_Entries")
            .select("*");
        if (error) {
            console.error("Error fetching entries:", error);
        } else {
            setEntries(data as JournalEntry[]);
            setFilteredEntries(data as JournalEntry[]);
        }
        setLoading(false);
    }

    async function handleUpdateStatus(id: number, newStatus: "Rejected" | "Approved") {
        const { error } = await supabase
            .from("Journal_Entries")
            .update({ status: newStatus, approval_data: new Date() })
            .eq("journal_id", id)
            .select();

        if (error) {
            console.error(`Error updating status to ${newStatus}:`, error);
        } else {
            const updatedEntries = entries.map((entry) =>
                entry.journal_id === id ? { ...entry, status: newStatus } : entry
            );
            setEntries(updatedEntries);
            applyFilter(selectedStatus, updatedEntries);
        }
    }

    function applyFilter(status: string, entriesList = entries) {
        if (status === "All") {
            setFilteredEntries(entriesList);
        } else {
            const filtered = entriesList.filter((entry) => entry.status === status);
            setFilteredEntries(filtered);
        }
    }

    function handleFilterChange(status: string) {
        setSelectedStatus(status);
        applyFilter(status);
    }

    async function handleViewAttachment(attachmentUrl: string) {
        if (!attachmentUrl) {
            alert("No attachment available for this entry.");
            return;
        }
    
        const pathStartIndex = attachmentUrl.indexOf("attachments/");
        if (pathStartIndex === -1) {
            alert("Invalid attachment URL.");
            return;
        }
    
        const filePath = attachmentUrl.substring(pathStartIndex); // e.g., "attachments/file.pdf"
    
        const { data, error } = await supabase.storage
            .from('journal-attachments') // <-- your real bucket name
            .createSignedUrl(filePath, 60); // valid for 60 seconds
    
        if (error || !data) {
            console.error("Error generating signed URL:", error);
            alert("Unable to access attachment.");
        } else {
            window.open(data.signedUrl, "_blank");
        }
    }
    
    return (
        <div>
            <Header label="Approve/Reject Journal Entries" />

            <h1>Journal Entries</h1>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => handleFilterChange(status)}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: selectedStatus === status ? "#4CAF50" : "#e0e0e0",
                            color: selectedStatus === status ? "white" : "black",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
  {filteredEntries.map((entry) => (
    <li
      key={entry.journal_id}
      style={{
        marginBottom: "20px",
        borderBottom: "1px solid #ccc",
        paddingBottom: "10px"
      }}
    >
      <p><strong>Description:</strong> {entry.description}</p>
      <p><strong>Status:</strong> {entry.status}</p>

      {/* Only show View Attachment button if there is an attachment_url */}
      {entry.attachment_url && (
        <button
          onClick={() => handleViewAttachment(entry.attachment_url)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            marginRight: "10px",
            marginTop: "5px"
          }}
        >
          View Attachment
        </button>
      )}

      {/* Approve and Reject buttons */}
      <button
        onClick={() => handleUpdateStatus(entry.journal_id, "Approved")}
        style={{
          padding: "6px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          marginRight: "8px",
          marginTop: "5px"
        }}
      >
        Approve
      </button>

      <button
        onClick={() => handleUpdateStatus(entry.journal_id, "Rejected")}
        style={{
          padding: "6px 12px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "5px"
        }}
      >
        Reject
      </button>
    </li>
  ))}
</ul>
            )}

            <Link to="/admin">
                <button
                    style={{
                        marginTop: "20px",
                        padding: "6px 12px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Back to Admin Hub
                </button>
            </Link>
        </div>
    );
}