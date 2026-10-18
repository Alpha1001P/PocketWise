function MobileBudgetCard({ totalExpense = 0, monthlyBudget = 0, onManage }) {
  const budgetPercentage =
    monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;

  return (
    <section className="mobile-card">
      <div className="mobile-section-title">
        <h2>Monthly Budget</h2>
        {onManage && <button onClick={onManage}>Manage</button>}
      </div>

      {monthlyBudget > 0 ? (
        <>
          <div className="mobile-budget-numbers">
            <span>Spent: ₹{totalExpense.toLocaleString("en-IN")}</span>
            <span>Limit: ₹{monthlyBudget.toLocaleString("en-IN")}</span>
          </div>

          <div className="mobile-budget-track">
            <div
              className="mobile-budget-fill"
              style={{
                width: `${budgetPercentage}%`,
                background: budgetPercentage >= 90 ? "var(--pw-expense)" : "var(--pw-primary)",
              }}
            />
          </div>

          <p className="mobile-budget-text">
            {budgetPercentage.toFixed(0)}% of monthly budget used
          </p>
        </>
      ) : (
        <p className="mobile-empty-text">
          Set a monthly budget limit to monitor your spending.
        </p>
      )}
    </section>
  );
}

export default MobileBudgetCard;

