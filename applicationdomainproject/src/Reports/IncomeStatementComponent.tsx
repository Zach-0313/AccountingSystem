import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import './IncomeStatement.css';

const SUPABASE_URL = 'https://tfgesyyngnxrvzckszfy.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Account {
  id: number;
  account_name: string;
  account_catagory: string;
  balance: number;
}

interface IncomeStatement {
  revenue: Account[];
  cogs: Account[];
  expenses: Account[];
  totals: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netIncome: number;
  };
}

const IncomeStatementComponent = () => {
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from('Chart_Of_Accounts')
        .select('id, account_name, account_catagory, balance');

      if (error) {
        console.error('Error fetching accounts:', error);
        return;
      }

      const revenue = data?.filter((a) => a.account_catagory.toLowerCase() === 'revenue') || [];
      const cogs = data?.filter((a) => a.account_catagory.toLowerCase() === 'cogs') || [];
      const expenses = data?.filter((a) => a.account_catagory.toLowerCase() === 'expense') || [];

      const totalRevenue = revenue.reduce((sum, a) => sum + a.balance, 0);
      const totalCogs = cogs.reduce((sum, a) => sum + a.balance, 0);
      const grossProfit = totalRevenue - totalCogs;
      const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
      const netIncome = grossProfit - totalExpenses;

      setIncomeStatement({
        revenue,
        cogs,
        expenses,
        totals: {
          revenue: totalRevenue,
          cogs: totalCogs,
          grossProfit,
          expenses: totalExpenses,
          netIncome,
        },
      });
    };

    fetchAccounts();
  }, []);

  return (
    <>
      <button className="open-button" onClick={() => setShowModal(true)}>
        View Income Statement
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h1>Income Statement</h1>

            {incomeStatement ? (
              <div className="income-statement">
                <div className="section">
                  <h2>Revenue</h2>
                  {incomeStatement.revenue.map((acc) => (
                    <div key={acc.id} className="row">
                      <span>{acc.account_name}</span>
                      <span className="amount">{acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="subtotal">
                    <strong>Total Revenue</strong>
                    <strong className="amount">{incomeStatement.totals.revenue.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="section">
                  <h2>Cost of Goods Sold</h2>
                  {incomeStatement.cogs.map((acc) => (
                    <div key={acc.id} className="row">
                      <span>{acc.account_name}</span>
                      <span className="amount">{acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="subtotal">
                    <strong>Total COGS</strong>
                    <strong className="amount">{incomeStatement.totals.cogs.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="section gross-profit">
                  <strong>Gross Profit</strong>
                  <strong className="amount">{incomeStatement.totals.grossProfit.toFixed(2)}</strong>
                </div>

                <div className="section">
                  <h2>Expenses</h2>
                  {incomeStatement.expenses.map((acc) => (
                    <div key={acc.id} className="row">
                      <span>{acc.account_name}</span>
                      <span className="amount">{acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="subtotal">
                    <strong>Total Expenses</strong>
                    <strong className="amount">{incomeStatement.totals.expenses.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="net-income">
                  <strong>Net Income</strong>
                  <strong className="amount">{incomeStatement.totals.netIncome.toFixed(2)}</strong>
                </div>
              </div>
            ) : (
              <p>Loading income statement...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default IncomeStatementComponent;
