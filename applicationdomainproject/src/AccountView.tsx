import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import "./App.css";
import Header from "./Header";
import AccountsNavbar from "./AccountsNavbar";
import PopUpCalendar from "./PopUpCalendar";


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

export default function AccountView() {

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

    // Filter states
    const [accountName, setAccountName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [subcategory, setSubcategory] = useState<string>("");
    const [minAmount, setMinAmount] = useState<number | "">("");
    const [maxAmount, setMaxAmount] = useState<number | "">("");
    const [searchQuery, setSearchQuery] = useState<string>(""); // Search field

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data, error } = await supabase.from("Chart_Of_Accounts").select("*");
            if (error) {
                console.error("Error fetching accounts:", error);
            } else {
                setAccounts(data || []);
                setFilteredAccounts(data || []);
            }
        };
        fetchAccounts();
    }, []);

    useEffect(() => {
        let filtered = accounts;

        if (accountName) {
            filtered = filtered.filter(account =>
                account.account_name.toLowerCase().includes(accountName.toLowerCase())
            );
        }
        if (category) {
            filtered = filtered.filter(account =>
                account.account_catagory.toLowerCase().includes(category.toLowerCase())
            );
        }
        if (subcategory) {
            filtered = filtered.filter(account =>
                account.account_subcatagory.toLowerCase().includes(subcategory.toLowerCase())
            );
        }
        if (minAmount !== "") {
            filtered = filtered.filter(account => account.balance >= Number(minAmount));
        }
        if (maxAmount !== "") {
            filtered = filtered.filter(account => account.balance <= Number(maxAmount));
        }

        // Search by account name or account number
        if (searchQuery) {
            filtered = filtered.filter(account =>
                account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.account_number.toString().includes(searchQuery)
            );
        }
        setFilteredAccounts(filtered);
    }, [accountName, category, subcategory, minAmount, maxAmount, searchQuery, accounts]);

 

    return (
        <div className="container">
            <Header label="Account View" />
            <AccountsNavbar/>
            <h1>Accounts</h1>
            {/* Pop-Up Calendar */}
            <PopUpCalendar />

            {/* Search and Filter Inputs */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by Name or Number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <input type="text" placeholder="Account Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                <input type="text" placeholder="Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
                <input type="number" placeholder="Min Amount" value={minAmount} onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : "")} />
                <input type="number" placeholder="Max Amount" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : "")} />
            </div>

            <table>
                <thead>
                <tr>
                    <th>Account Name</th>
                    <th>Account Number</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                        <tr key={account.id}>
                            <td>{account.account_name}</td>
                            <td>{account.account_number}</td>
                            <td>{account.account_description}</td>
                            <td>{account.account_catagory}</td>
                            <td>{account.debit}</td>
                            <td>{account.credit}</td>
                            <td>{account.balance}</td>
                            <td>
                                <Link to={`/accounts/${account.id}`} className="view-button">View</Link>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>No accounts found</td>
                    </tr>
                )}
                </tbody>

            </table>

        </div>

    );

}

