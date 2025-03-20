import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AccountList() {
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data, error } = await supabase
                .from("Chart_Of_Accounts")
                .select("*");
            if (error) {
                console.error("Error fetching accounts:", error.message);
            } else {
                setAccounts(data);
            }
        };

        fetchAccounts();
    }, []);

    return (
        <div>
            <h2>Account List</h2>
            <ul>
                {accounts.map((account) => (
                    <li key={account.id}>
                        {account.account_name} - {account.account_number}
                    </li>
                ))}
            </ul>
        </div>
    );
}
