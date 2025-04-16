import { useState } from "react";
import AccountsNavbar from "./AccountsNavbar";
import Header from "./Header";
import BalanceSheetComponent from "./Reports/BalanceSheetComponent";
import IncomeStatementComponent from "./Reports/IncomeStatementComponent";
import TrialBalanceComponent from "./Reports/TrialBalanceComponent";
import RetainedEarningsComponent from "./Reports/RetainedEarningsComponent";

const ReportScreen = () => {
    return (
        <div>
            <Header label="Reports" />
            <h4>Generate Reports</h4>
            <AccountsNavbar />
            <BalanceSheetComponent />
            <IncomeStatementComponent />
            <TrialBalanceComponent />
            <RetainedEarningsComponent />
        </div>
    );
}
export default ReportScreen;