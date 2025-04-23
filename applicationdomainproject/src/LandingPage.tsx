import Dashboard from "./Dashboard";
import Header from "./Header";
import { Link } from 'react-router-dom';

const LandingPage = () => {
        return (
            <div>
                <Header label="Dashboard"/>
                <Dashboard/>
            </div>

        );

}


export default LandingPage;