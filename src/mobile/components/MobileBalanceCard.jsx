function MobileBalanceCard({ balance = 0, totalIncome = 0, totalExpense = 0 }) {
  return (
    <div className="m-balance-hero">
      <p className="m-balance-label">Total Net Worth</p>
      <div className="m-balance-amount">
        ₹{Number(balance || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <p className="m-balance-sub">Combined balance across active accounts</p>

      <div className="m-balance-row">
        <div className="m-balance-stat">
          <div className="m-balance-stat-label">
            <span>↓</span> Income
          </div>
          <div className="m-balance-stat-amount">
            +₹{Number(totalIncome || 0).toLocaleString("en-IN")}
          </div>
        </div>

        <div className="m-balance-stat">
          <div className="m-balance-stat-label">
            <span>↑</span> Expense
          </div>
          <div className="m-balance-stat-amount">
            -₹{Number(totalExpense || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileBalanceCard;