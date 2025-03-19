import Header from "./Header";
import { Link } from 'react-router-dom';
const AdminHub = () => {
        return (
            <div>
                <Header label="Admin Hub"/>
                <h4>User Management</h4>
                <Link to="/admin/UserManagement" style={{ textDecoration: "none" }}>
                    <button>User Management</button>
                </Link>
            </div>
        );
    
}
export default AdminHub;