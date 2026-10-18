function MobileBalanceCard({ balance = 0, totalIncome = 0, totalExpense = 0 }) {
  return (
    <div className="m-balance-hero">
      {/* Top Header inside card */}
      <div className="m-balance-top">
        <div className="m-balance-badge">
          <span className="m-balance-dot" />
          <span>Active Balance</span>
        </div>
        <div className="m-balance-chip">🇮🇳 INR</div>
      </div>

      {/* Main Net Worth Value */}
      <div className="m-balance-main">
        <p className="m-balance-label">Total Net Worth</p>
        <div className="m-balance-amount">
          <span className="m-currency-symbol">₹</span>
          {Number(balance || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <p className="m-balance-sub">Combined across all active accounts</p>
      </div>

      {/* Glassmorphic Income / Expense widgets */}
      <div className="m-balance-row">
        <div className="m-balance-stat income">
          <div className="m-stat-top">
            <div className="m-stat-badge-icon income">↓</div>
            <span className="m-balance-stat-label">This Month In</span>
          </div>
          <div className="m-balance-stat-amount income">
            +₹{Number(totalIncome || 0).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="m-balance-stat expense">
          <div className="m-stat-top">
            <div className="m-stat-badge-icon expense">↑</div>
            <span className="m-balance-stat-label">This Month Out</span>
          </div>
          <div className="m-balance-stat-amount expense">
            -₹{Number(totalExpense || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileBalanceCard;