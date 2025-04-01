import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";

// Supabase credentials
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AccountDetails {
    account_name: string;
    account_number: string;
    account_description: string;
    normal_side: string;
    account_category: string;
    account_subcategory: string;
    initial_balance: number;
    debit: number;
    credit: number;
    balance: number;
    date_added: string;
    user_id: string;
    order: string;
    statement: string;
    comment: string;
}

export default function AddAccountForm() {
    const { userId } = useParams<{ userId: string }>();

    const [hasAccount, setHasAccount] = useState<boolean | null>(null);
    const [existingAccountNumber, setExistingAccountNumber] = useState<string>("");
    const [accountDetails, setAccountDetails] = useState<AccountDetails>({
        account_name: "",
        account_number: Math.floor(1000 + Math.random() * 9000).toString(),
        account_description: "",
        normal_side: "",
        account_category: "",
        account_subcategory: "",
        initial_balance: 0,
        debit: 0,
        credit: 0,
        balance: 0,
        date_added: new Date().toISOString(),
        user_id: userId || "",
        order: "",
        statement: "",
        comment: "",
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error.message);
                setErrorMessage("Failed to load user info");
            } else if (data?.user) {
                setAccountDetails((prev) => ({
                    ...prev,
                    user_id: data.user.id,
                }));
            }
        };

        if (!userId) fetchUser();
    }, [userId]);

    // Fetch account data if user enters an existing account number
    const fetchAccountData = async () => {
        setLoading(true);
        setErrorMessage(null);

        const { data, error } = await supabase
            .from("Chart_Of_Accounts")
            .select("*")
            .eq("account_number", existingAccountNumber)
            .single();

        if (error || !data) {
            console.error("Account not found:", error?.message);
            setErrorMessage("Account not found. You can add a new one.");
            setAccountDetails((prev) => ({
                ...prev,
                account_number: existingAccountNumber,
            }));
        } else {
            setAccountDetails(data);
        }

        setLoading(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAccountDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        const { data, error } = await supabase
            .from("Chart_Of_Accounts")
            .upsert([accountDetails]); // Upsert allows insert or update

        if (error) {
            console.error("Error saving account:", error.message);
            setErrorMessage(error.message);
        } else {
            console.log("Account saved successfully:", data);
            setAccountDetails({
                ...accountDetails,
                account_name: "",
                account_number: Math.floor(1000 + Math.random() * 9000).toString(),
                account_description: "",
                normal_side: "",
                account_category: "",
                account_subcategory: "",
                initial_balance: 0,
                debit: 0,
                credit: 0,
                balance: 0,
                order: "",
                statement: "",
                comment: "",
            });
        }
    };

    return (
        <div className="account-form">
            <h2>Add or Edit Account</h2>

            {/* Step 1: Ask if the user has an account */}
            {hasAccount === null && (
                <div>
                    <p>Do you have an existing account number?</p>
                    <button onClick={() => setHasAccount(true)}>Yes</button>
                    <button onClick={() => setHasAccount(false)}>No</button>
                </div>
            )}

            {/* Step 2: If user has an account, ask for the number */}
            {hasAccount === true && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Account Number"
                        value={existingAccountNumber}
                        onChange={(e) => setExistingAccountNumber(e.target.value)}
                    />
                    <button onClick={fetchAccountData} disabled={loading}>
                        {loading ? "Loading..." : "Fetch Account"}
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
            )}

            {/* Step 3: Show the form when user is adding/updating */}
            {(hasAccount === false || accountDetails.account_name) && (
                <form onSubmit={handleSubmit}>
                    <p>Editing User ID: {userId || "Fetching..."}</p>

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
                        readOnly
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
                    <button type="submit">Save Account</button>
                </form>
            )}
        </div>
    );
}
