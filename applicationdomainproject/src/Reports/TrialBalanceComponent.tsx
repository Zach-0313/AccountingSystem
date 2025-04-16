import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import './TrialBalance.css';

const SUPABASE_URL = 'https://tfgesyyngnxrvzckszfy.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2VzeXluZ254cnZ6Y2tzemZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4OTc0ODEsImV4cCI6MjA1NDQ3MzQ4MX0.ScqA7yyTMrBjDqegXiuxpqJ9PYAkzAcgw2CEfpNmoT4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Account {
  id: number;
  account_name: string;
  balance: number;
  normal_side: number; // 0 = Debit, 1 = Credit
}

interface TrialBalance {
  accounts: {
    id: number;
    account_name: string;
    debit: number;
    credit: number;
  }[];
  totals: {
    debit: number;
    credit: number;
  };
}

const TrialBalanceComponent = () => {
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from('Chart_Of_Accounts')
        .select('id, account_name, balance, normal_side');

      if (error) {
        console.error('Error fetching trial balance accounts:', error);
        return;
      }

      const accounts = data?.map((acc) => {
        const isDebit = acc.normal_side === 0;
        return {
          id: acc.id,
          account_name: acc.account_name,
          debit: isDebit ? acc.balance : 0,
          credit: !isDebit ? acc.balance : 0,
        };
      }) || [];

      const totalDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
      const totalCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);

      setTrialBalance({
        accounts,
        totals: {
          debit: totalDebit,
          credit: totalCredit,
        },
      });
    };

    fetchAccounts();
  }, []);

  return (
    <>
      <button className="open-button" onClick={() => setShowModal(true)}>
        View Trial Balance
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            <h1>Trial Balance</h1>

            {trialBalance ? (
              <div className="trial-balance">
                <div className="trial-header row">
                  <span>Account</span>
                  <span className="amount">Debit</span>
                  <span className="amount">Credit</span>
                </div>
                {trialBalance.accounts.map((acc) => (
                  <div key={acc.id} className="row">
                    <span>{acc.account_name}</span>
                    <span className="amount">{acc.debit ? acc.debit.toFixed(2) : ''}</span>
                    <span className="amount">{acc.credit ? acc.credit.toFixed(2) : ''}</span>
                  </div>
                ))}
                <div className="trial-total row">
                  <strong>Total</strong>
                  <strong className="amount">{trialBalance.totals.debit.toFixed(2)}</strong>
                  <strong className="amount">{trialBalance.totals.credit.toFixed(2)}</strong>
                </div>
              </div>
            ) : (
              <p>Loading trial balance...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TrialBalanceComponent;
