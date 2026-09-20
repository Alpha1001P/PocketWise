import DashboardAccountCard from "./DashboardAccountCard";
import "./AccountsSection.css";

function AccountsSection({
  accounts = [],
  transactions = [],
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
}) {
  return (
    <div className="accounts-section-wrapper">

      <div className="accounts-section-header">
        <div>
          <h3>My Accounts</h3>
          <p>Wallets, cards & bank accounts</p>
        </div>
      </div>

      <div className="accounts-grid">

        {accounts.map((account) => (
          <DashboardAccountCard
            key={account.id}
            account={account}
            transactions={transactions}
            onEdit={onEditAccount}
            onDelete={onDeleteAccount}
          />
        ))}

        <div
          className="dashboard-add-account-card"
          onClick={onAddAccount}
        >
          <div className="add-account-icon-wrap">
            ＋
          </div>

          <h4>Add New Account</h4>

          <p>Connect a wallet or bank</p>
        </div>

      </div>
    </div>
  );
}

export default AccountsSection;