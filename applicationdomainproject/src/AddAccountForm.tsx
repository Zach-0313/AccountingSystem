import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";

// Supabase credentials
const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Sample categories and subcategories
const catagories = {
    "assets": ["Cash", "Accounts Receivable", "Inventory", "current assets", "assets"],
    "liability": ["Accounts Payable", "Loans", "liability"],
    "equity": ["Owner's Capital", "Retained Earnings", "equity"],
    "revenue": ["Sales Revenue", "Service Revenue", "revenue"],
    "expense": ["Rent Expense", "Utilities Expense", "Wages Expense", "expense"],
  };
  
  export default function AccountForm() {
    const [accountName, setAccountName] = useState("");
    const [catagory, setCatagory] = useState("");
    const [subCatagory, setSubCatagory] = useState("");
    const [initialBalance, setInitialBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(false);
  let thisId:number = Math.floor(Math.random() * 10000); 
      const { error } = await supabase.from("Chart_Of_Accounts").insert([
        {
          account_name: accountName,
          account_catagory: catagory,
          account_subcatagory: subCatagory,
          initial_balance: initialBalance,
          account_number : thisId,
          account_id : thisId
        },
      ]);
  
      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setSuccess(true);
        setAccountName("");
        setCatagory("");
        setSubCatagory("");
        setInitialBalance(0);
      }
      setLoading(false);
    };
  
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div>
            <label className="block mb-1 font-medium">Account Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
  
          {/* Category */}
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={catagory}
              onChange={(e) => {
                setCatagory(e.target.value);
                setSubCatagory(""); // reset subcategory when category changes
              }}
              required
            >
              <option value="">Select Category</option>
              {Object.keys(catagories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
  
          {/* Subcategory */}
          {catagory && (
            <div>
              <label className="block mb-1 font-medium">Subcategory</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={subCatagory}
                onChange={(e) => setSubCatagory(e.target.value)}
                required
              >
                <option value="">Select Subcategory</option>
                {catagories[catagory as keyof typeof catagories].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
  
          {/* Initial Balance */}
          <div>
            <label className="block mb-1 font-medium">Initial Balance</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={initialBalance}
              onChange={(e) => setInitialBalance(parseFloat(e.target.value))}
              required
            />
          </div>
  
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Create Account"}
          </button>
  
          {/* Status Messages */}
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">Account created successfully!</p>}
        </form>
      </div>
    );
  }