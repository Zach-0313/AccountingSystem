import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "./Dashboard.css";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to determine color based on ideal range
const getRatioColor = (value: number, idealRange: [number, number]) => {
  if (value < idealRange[0]) return "text-red-500";
  if (value <= idealRange[1]) return "text-green-500";
  return "text-yellow-500";
};

const Dashboard = () => {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from("Chart_Of_Accounts")
        .select("*");
      if (data) setAccounts(data);
      else console.error(error);
    };

    fetchAccounts();
  }, []);

  const currentAssets = accounts.filter(
    (a) => a.account_catagory === "asset" && a.account_subcatagory === "current assets"
  ).reduce((sum, acc) => sum + acc.balance, 0);

  const currentLiabilities = accounts.filter(
    (a) => a.account_catagory === "liability" && a.account_subcatagory === "liability"
  ).reduce((sum, acc) => sum + acc.balance, 0);

  const totalLiabilities = accounts.filter((a) => a.account_catagory === "liability")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalEquity = accounts.filter((a) => a.account_catagory === "equity")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const revenue = accounts.filter((a) => a.account_catagory === "revenue")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const expenses = accounts.filter((a) => a.account_catagory === "expense")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const currentRatio = currentAssets / currentLiabilities || 0;
  const quickRatio = (currentAssets - expenses) / currentLiabilities || 0;
  const debtToEquityRatio = totalLiabilities / totalEquity || 0;
  const returnOnAssets = revenue / (currentAssets + totalEquity) || 0;
  const returnOnEquity = revenue / totalEquity || 0;
  const debtRatio = currentAssets / totalEquity || 0;

  const currentRatioRange: [number, number] = [1.2, 2.0];
  const quickRatioRange: [number, number] = [1.0, 1.5];
  const debtToEquityRange: [number, number] = [0.5, 2.0];
  const returnOnAssetsRange: [number, number] = [0.05, 0.2];
  const returnOnEquityRange: [number, number] = [0.05, 0.15];
  const debtRatioRange: [number, number] = [0.4, 0.6];


  const ratios = [
    {
      label: "Current Ratio",
      value: currentRatio,
      range: currentRatioRange,
    },
    {
      label: "Quick Ratio",
      value: quickRatio,
      range: quickRatioRange,
    },
    {
      label: "Debt to Equity Ratio",
      value: debtToEquityRatio,
      range: debtToEquityRange,
    },
    {
      label: "Return on Assets",
      value: returnOnAssets,
      range: returnOnAssetsRange,
    },
    {
      label: "Return on Equity",
      value: returnOnEquity,
      range: returnOnEquityRange,
    },
    {
        label: "Debt Ratio",
        value: debtRatio,
        range: debtRatioRange,
      },
  ];

  return (
<div className="min-h-screen bg-gray-100 p-6 pt-20 space-y-12">
    <h1 className="text-4xl font-bold mb-6">Financial Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ratios.map((ratio) => (
          <div key={ratio.label} className="p-6 bg-white rounded-xl shadow">
            <h2 className="text-xl font-semibold">{ratio.label}</h2>
            <p className="text-lg font-bold mt-2">
              {ratio.value.toFixed(2)}{" "}
              <span className="text-sm text-gray-500 ml-2">
                (Ideal: {ratio.range[0]}–{ratio.range[1]})
              </span>
            </p>
            <p className={`mt-2 font-semibold ${getRatioColor(ratio.value, ratio.range)}`}>
              {ratio.value < ratio.range[0]
                ? "Low"
                : ratio.value <= ratio.range[1]
                ? "Good"
                : "High"}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation links at the bottom */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-4">Navigation</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/accounts" className="text-blue-600 hover:underline">
              View Accounts
            </Link>
          </li>
          <li>
            <Link to="/accounts/journalizing" className="text-blue-600 hover:underline">
              Journalizing
            </Link>
          </li>
          <li>
            <Link to="/accounts/Reports" className="text-blue-600 hover:underline">
              Generate Reports
            </Link>
          </li>
          <li>
            <Link to="/" className="text-blue-600 hover:underline">
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
