import logo from './assets/OwlightFinancialsLogo.png';
import { Link } from 'react-router-dom';

const headerStyle = {
    position: "fixed" as 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    padding: "10px",
    backgroundColor: "#333",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000
};

const buttonStyle = {
    backgroundColor: "#e44d26",
    color: "white",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "5px"
};
const styles = ({
    tinyLogo: {
        width: 75,
        height: 75
        ,
    },
});
type HeaderProps = {
    label?: string;
};

const Header: React.FC<HeaderProps> = ({ label = "Default Header"}) => {
    return (
        <header style={headerStyle}>
            <h2>{label}</h2>
            <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <img
                    style={styles.tinyLogo}
                    src={logo}
                    alt="Owlight Financials Logo"
                />
            </Link>
            {(
                <Link to="/" style={{ textDecoration: "none" }}>
                    <button style={buttonStyle}>Logout</button>
                </Link>
            )}
        </header>
    );
};

export default Header;
