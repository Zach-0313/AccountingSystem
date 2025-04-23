import { Link } from "react-router-dom";
import "./AccountsNavbar.css";

const AccountsNavbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li><Link to="/accounts">Accounts</Link></li>
                <li><Link to="/accounts/journalizing">Journalizing</Link></li>
                <li><Link to="/accounts/Reports">Reports</Link></li>
                <li> <Link to="/landing-page">Landing</Link></li>

            </ul>
        </nav>
    );
};

export default AccountsNavbar;
