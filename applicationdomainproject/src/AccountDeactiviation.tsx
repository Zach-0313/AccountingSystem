import React from 'react';

interface Account {
    id: string;
    balance: number;
    name: string;
}

interface AccountDeactivationProps {
    account: Account;
    onDeactivate: (id: string) => void;
}

const AccountDeactivation: React.FC<AccountDeactivationProps> = ({ account, onDeactivate }) => {
    const handleDeactivate = () => {
        if (account.balance > 0) {
            alert('Account with a balance greater than zero cannot be deactivated.');
        } else {
            onDeactivate(account.id);
        }
    };

    return (
        <div>
            <h3>{account.name}</h3>
            <p>Balance: ${account.balance}</p>
            <button onClick={handleDeactivate}>
                Deactivate Account
            </button>
        </div>
    );
};

export default AccountDeactivation;
