import React from 'react';

type Role = 'Admin' | 'Manager' | 'Accountant';

interface UserPermissionProps {
    role: Role;
    children: React.ReactNode;
}

const UserPermission: React.FC<UserPermissionProps> = ({ role, children }) => {
    const hasPermission = (action: string) => {
        switch (role) {
            case 'Admin':
                return true;
            case 'Manager':
                if (action === 'view') {
                    return true;
                }
                return false;
            case 'Accountant':
                if (action === 'view') {
                    return true;
                }
                return false;
            default:
                return false;
        }
    };

    return (
        <>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    const action = child.props['data-action'];
                    if (hasPermission(action)) {
                        return child;
                    }
                }
                return null;
            })}
        </>
    );
};

export default UserPermission;
