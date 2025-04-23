import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from "./Header";
import HelpButton from "./HelpButton.tsx";
import AccountsNavbar from "./AccountsNavbar.tsx";
import AdminHub from "./AdminHub";

const SUPABASE_URL = "https://tfgesyyngnxrvzckszfy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface User {
    firstName: string;
    lastName: string;
    username: string;
    role: string;
}

const ratioDefinitions: { [key: string]: string } = {
    "Quick Ratio": "(Current Assets - Inventories) / Current Liabilities",
    "Current Ratio": "Current Assets / Current Liabilities",
    "Cashflow Coverage Ratio": "Operating Cash Flows / Total Debt",
    "Return on Investment (ROI)": "(Gain from Investment / Cost of Investment) × 100",
    "Return on Equity (ROE)": "Net Income / Shareholder's Equity",
    "Gross Margin": "(Revenue - COGS) / Revenue",
    "Debt Ratio": "Total Debt / Total Assets",
    "Debt to Equity Ratio": "Total Debt / Total Equity",
    "Inventory Turnover": "Cost of Goods Sold / Average Inventory",
    "Asset Turnover": "Net Sales / Average Total Assets",
    "PE Ratio": "Stock Price / Earnings per Share (EPS)",
    "Dividend Yield": "Dividends per Share / Stock Price",
};

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [selectedRatio, setSelectedRatio] = useState<string | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.user?.id;

            if (userId) {
                const { data, error } = await supabase
                    .from('User_Credentials')
                    .select('firstName, lastName, username, role')
                    .eq('id', userId)
                    .single();

                if (!error && data) {
                    setUser({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        username: data.username,
                        role: data.role,
                    });
                } else {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleMouseEnter = (e: React.MouseEvent, ratio: string) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setSelectedRatio(ratio);
        setPopupPosition({
            top: rect.top + window.scrollY + rect.height,
            left: rect.left + window.scrollX,
        });
    };

    const handleMouseLeave = () => {
        setSelectedRatio(null);
        setPopupPosition(null);
    };

    const getHeaderLabel = () => {
        if (user?.role === "admin") return "Admin Login";
        if (user?.role === "user") return "User Login";
        return "Login";
    };

    return (
        <div className="dashboard">
            <Header label={getHeaderLabel()} />
            {user ? (
                <>
                    <header className="dashboard-header">
                        <h1>
                            Welcome, {user.firstName} {user.lastName} ({user.username})!
                        </h1>
                    </header>
                    <main className="dashboard-content">
                        {user.role === "admin" ? <AdminHub /> : <AccountsNavbar />}
                    </main>
                </>
            ) : (
                <p>Loading user data...</p>
            )}
            <HelpButton />
            <footer className="ratios-footer">
                <div className="footer-grid">
                    {["Liquidity", "Profitability", "Debt", "Efficiency", "Valuation"].map((category) => (
                        <div key={category} className="footer-column">
                            <h4 className="footer-title">{category}</h4>
                            <ul>
                                {Object.keys(ratioDefinitions)
                                    .filter((ratio) =>
                                        category === "Liquidity"
                                            ? ["Quick Ratio", "Current Ratio", "Cashflow Coverage Ratio"].includes(ratio)
                                            : category === "Profitability"
                                                ? ["Return on Investment (ROI)", "Return on Equity (ROE)", "Gross Margin"].includes(ratio)
                                                : category === "Debt"
                                                    ? ["Debt Ratio", "Debt to Equity Ratio"].includes(ratio)
                                                    : category === "Efficiency"
                                                        ? ["Inventory Turnover", "Asset Turnover"].includes(ratio)
                                                        : category === "Valuation"
                                                            ? ["PE Ratio", "Dividend Yield"].includes(ratio)
                                                            : false
                                    )
                                    .map((ratio) => (
                                        <li
                                            key={ratio}
                                            onMouseEnter={(e) => handleMouseEnter(e, ratio)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <a href="#">{ratio}</a>
                                            <span
                                                className="question-mark"
                                                onClick={() => setSelectedRatio(ratio)}
                                            >
                                                ?
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    ))}
                </div>
                {selectedRatio && popupPosition && (
                    <div
                        className="definition-popup"
                        style={{
                            top: `${popupPosition.top}px`,
                            left: `${popupPosition.left}px`,
                        }}
                    >
                        <p>
                            <strong>{selectedRatio}</strong>: {ratioDefinitions[selectedRatio]}
                        </p>
                    </div>
                )}
            </footer>
        </div>
    );
}
