import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import './BalanceSheet.css'; // Optional CSS for styling

// Supabase setup
const SUPABASE_URL = 'https://tfgesyyngnxrvzckszfy.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Account {
  id: number;
  account_name: string;
  account_catagory: string;
  balance: number;
}

interface BalanceSheet {
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  totals: {
    assets: number;
    liabilities: number;
    equity: number;
  };
}

const BalanceSheetComponent = () => {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase.from('Chart_Of_Accounts').select('id, account_name, account_catagory, balance');

      if (error) {
        console.error('Error fetching accounts:', error);
        return;
      }

      const assets = data?.filter((a) => a.account_catagory.toLowerCase() === 'asset') || [];
      const liabilities = data?.filter((a) => a.account_catagory.toLowerCase() === 'liability') || [];
      const equity = data?.filter((a) => a.account_catagory.toLowerCase() === 'equity') || [];

      const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
      const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
      const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

      setBalanceSheet({
        assets,
        liabilities,
        equity,
        totals: {
          assets: totalAssets,
          liabilities: totalLiabilities,
          equity: totalEquity,
        },
      });
    };

    fetchAccounts();
  }, []);

  return (
    <>
      <button className="open-button" onClick={() => setShowModal(true)}>
        View Balance Sheet
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h1>Balance Sheet</h1>
            {balanceSheet ? (
              <div className="balance-sheet-grid">
                <div className="balance-column">
                  <h2>Assets</h2>
                  {balanceSheet.assets.map((acc) => (
                    <div key={acc.id} className="balance-row">
                      <span>{acc.account_name}</span>
                      <span className="amount">{acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="balance-total">
                    <strong>Total Assets</strong>
                    <strong className="amount">{balanceSheet.totals.assets.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="balance-column">
                  <h2>Liabilities</h2>
                  {balanceSheet.liabilities.map((acc) => (
                    <div key={acc.id} className="balance-row">
                      <span>{acc.account_name}</span>
                      <span className="amount">{acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="balance-subtotal">
                    <strong>Total Liabilities</strong>
                    <strong className="amount">{balanceSheet.totals.liabilities.toFixed(2)}</strong>
                  </div>

                  <h2>Equity</h2>
                  {balanceSheet.equity.map((acc) => (
                    <div key={acc.id} className="balance-row">
                      <span>{acc.account_name}</span>
                      <span className="amount">{acc.balance.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="balance-subtotal">
                    <strong>Total Equity</strong>
                    <strong className="amount">{balanceSheet.totals.equity.toFixed(2)}</strong>
                  </div>

                  <div className="balance-total">
                    <strong>Total Liabilities & Equity</strong>
                    <strong className="amount">
                      {(balanceSheet.totals.liabilities + balanceSheet.totals.equity).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading balance sheet...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BalanceSheetComponent;