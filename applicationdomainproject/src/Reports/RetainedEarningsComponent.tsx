import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import './RetainedEarnings.css';

const SUPABASE_URL = 'https://tfgesyyngnxrvzckszfy.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Account {
  id: number;
  account_name: string;
  account_catagory: string;
  balance: number;
}

interface RetainedEarningsStatement {
  beginningRetainedEarnings: number;
  netIncome: number;
  dividends: number;
  endingRetainedEarnings: number;
}

const RetainedEarningsComponent = () => {
  const [statement, setStatement] = useState<RetainedEarningsStatement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchStatement = async () => {
      const { data, error } = await supabase
        .from('Chart_Of_Accounts')
        .select('id, account_name, account_catagory, balance');

      if (error) {
        console.error('Error fetching accounts:', error);
        return;
      }

      const beginningRE = data?.find(a =>
        a.account_catagory.toLowerCase() === 'retained earnings'
      )?.balance || 0;

      const netIncome = data?.filter(a =>
        ['revenue', 'cogs', 'expense'].includes(a.account_catagory.toLowerCase())
      ).reduce((acc, a) => {
        if (a.account_catagory.toLowerCase() === 'revenue') return acc + a.balance;
        if (a.account_catagory.toLowerCase() === 'cogs' || a.account_catagory.toLowerCase() === 'expense') return acc - a.balance;
        return acc;
      }, 0) || 0;

      const dividends = data?.filter(a =>
        a.account_catagory.toLowerCase() === 'dividends'
      ).reduce((acc, a) => acc + a.balance, 0) || 0;

      const endingRE = beginningRE + netIncome - dividends;

      setStatement({
        beginningRetainedEarnings: beginningRE,
        netIncome,
        dividends,
        endingRetainedEarnings: endingRE,
      });
    };

    fetchStatement();
  }, []);

  return (
    <>
      <button className="open-button" onClick={() => setShowModal(true)}>
        View Retained Earnings
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h1>Retained Earnings Statement</h1>

            {statement ? (
              <div className="re-statement">
                <div className="row">
                  <span>Beginning Retained Earnings</span>
                  <span className="amount">{statement.beginningRetainedEarnings.toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Add: Net Income</span>
                  <span className="amount">{statement.netIncome.toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Less: Dividends</span>
                  <span className="amount">({statement.dividends.toFixed(2)})</span>
                </div>
                <div className="total-row">
                  <strong>Ending Retained Earnings</strong>
                  <strong className="amount">{statement.endingRetainedEarnings.toFixed(2)}</strong>
                </div>
              </div>
            ) : (
              <p>Loading retained earnings...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RetainedEarningsComponent;
