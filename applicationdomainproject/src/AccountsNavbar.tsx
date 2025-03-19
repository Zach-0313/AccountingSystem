import { Link } from "react-router-dom";
import "./AccountsNavbar.css";

const AccountsNavbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/accounts">Accounts</Link></li>
                <li><Link to="/accounts/journalizing">Journalizing</Link></li>
            </ul>
        </nav>
    );
};

export default AccountsNavbar;
