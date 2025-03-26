import Header from "./Header";
import { Link } from 'react-router-dom';
const AdminHub = () => {
        return (
            <div>
                <Header label="Admin Hub"/>
                <Link to="/admin/UserManagement" style={{ textDecoration: "none" }}>
                    <button>User Management</button>
                </Link>
                <Link to="/admin/ExpiredUser" style={{ textDecoration: "none" }}>
                    <button>Expired Users</button>
                </Link>
            </div>
        );
    
}
export default AdminHub;