function MobileAccounts({ accounts = [], onManage }) {
  return (
    <section className="mobile-card">
      <div className="mobile-section-title">
        <h2>My Accounts</h2>
        {onManage && <button onClick={onManage}>Manage</button>}
      </div>

      {accounts.length === 0 ? (
        <p className="mobile-empty-text">No accounts added yet.</p>
      ) : (
        <div className="mobile-account-list">
          {accounts.map((account) => (
            <div className="mobile-account-row" key={account.id}>
              <div className="mobile-account-icon">{account.icon || "💳"}</div>
              <div className="mobile-account-info">
                <strong>{account.name}</strong>
                <span>{account.type || "Account"}</span>
              </div>
              <strong>₹{Number(account.balance || 0).toLocaleString("en-IN")}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MobileAccounts;

