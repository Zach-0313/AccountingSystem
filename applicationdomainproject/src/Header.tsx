import logo from './assets/OwlightFinancialsLogo.png';

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
    logout?: () => void; // The logout function passed from the parent component
};

const Header: React.FC<HeaderProps> = ({ label = "Default Header", logout }) => {
    return (
        <header style={headerStyle}>
            <h2>{label}</h2>
            <img
                style={styles.tinyLogo}
                src={logo}
            />
            {logout && <button onClick={logout} style={buttonStyle}>Logout</button>}
        </header>
    );
};

export default Header;
