import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase credentials
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AddAccountForm() {
    const [accountDetails, setAccountDetails] = useState({
        account_name: "",
        account_number: "",
        account_description: "",
        normal_side: "",
        account_category: "",
        account_subcategory: "",
        initial_balance: "",
        debit: 0,
        credit: 0,
        balance: 0,
        date_added: new Date().toISOString(),
        user_id: "1",
        order: "",
        statement: "",
        comment: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from("Chart_Of_Accounts")
            .insert([accountDetails]);

        if (error) {
            console.error("Error adding account:", error.message);
        } else {
            console.log("Account added successfully:", data);
            setAccountDetails({
                account_name: "",
                account_number: "",
                account_description: "",
                normal_side: "",
                account_category: "",
                account_subcategory: "",
                initial_balance: "",
                debit: 0,
                credit: 0,
                balance: 0,
                date_added: new Date().toISOString(),
                user_id: "1",
                order: "",
                statement: "",
                comment: "",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="account-form">
            <h1>Add New Account</h1>
            <input
                type="text"
                name="account_name"
                placeholder="Account Name"
                value={accountDetails.account_name}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="account_number"
                placeholder="Account Number"
                value={accountDetails.account_number}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="account_description"
                placeholder="Description"
                value={accountDetails.account_description}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="normal_side"
                placeholder="Normal Side (Debit/Credit)"
                value={accountDetails.normal_side}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="account_category"
                placeholder="Category"
                value={accountDetails.account_category}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="account_subcategory"
                placeholder="Subcategory"
                value={accountDetails.account_subcategory}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="initial_balance"
                placeholder="Initial Balance"
                value={accountDetails.initial_balance}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="order"
                placeholder="Order"
                value={accountDetails.order}
                onChange={handleChange}
            />
            <input
                type="text"
                name="statement"
                placeholder="Statement (IS/BS/RE)"
                value={accountDetails.statement}
                onChange={handleChange}
            />
            <textarea
                name="comment"
                placeholder="Comment"
                value={accountDetails.comment}
                onChange={handleChange}
            />
            <button type="submit">Add Account</button>
        </form>
    );
}
