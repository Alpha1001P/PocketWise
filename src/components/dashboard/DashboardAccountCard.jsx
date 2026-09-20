function DashboardAccountCard({
  account,
  transactions = [],
  onEdit,
  onDelete,
}) {
  // Calculate account balance from transactions
  const accountBalance = transactions.reduce((total, t) => {
    if (t.account !== account.name) return total;
    return t.type === "Income"
      ? total + Number(t.amount || 0)
      : total - Number(t.amount || 0);
  }, 0);

  // Current month expenses for this account
  const now = new Date();
  const currentMonthExpenses = transactions
    .filter((t) => {
      if (t.account !== account.name || t.type !== "Expense") return false;
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const budget = Number(account.monthlyBudget || 0);
  const budgetUsedPct =
    budget > 0 ? Math.min(100, Math.round((currentMonthExpenses / budget) * 100)) : 0;

  return (
    <div className="dashboard-account-card">
      <div className="dashboard-account-top">
        <div className="account-icon-wrap">{account.icon || "🏦"}</div>
        <div className="dashboard-account-actions">
          <button
            type="button"
            className="acc-action-btn"
            onClick={() => onEdit?.(account)}
            title="Edit Account"
          >
            ✏️
          </button>
          <button
            type="button"
            className="acc-action-btn delete-btn"
            onClick={() => onDelete?.(account.id)}
            title="Delete Account"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="dashboard-account-info">
        <span className="account-name-text">{account.name}</span>
        <h3 className="account-balance-amount">
          ₹{accountBalance.toLocaleString("en-IN")}
        </h3>
      </div>

      {/* Mini Monthly Budget Bar if set */}
      {budget > 0 ? (
        <div className="acc-mini-budget">
          <div className="acc-budget-labels">
            <span>Spent: ₹{currentMonthExpenses.toLocaleString("en-IN")}</span>
            <span>Limit: ₹{budget.toLocaleString("en-IN")}</span>
          </div>
          <div className="acc-budget-track">
            <div
              className={`acc-budget-bar ${budgetUsedPct >= 100 ? "exceeded" : ""}`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="acc-no-budget">
          <small>No monthly limit set</small>
        </div>
      )}
    </div>
  );
}

export default DashboardAccountCard;