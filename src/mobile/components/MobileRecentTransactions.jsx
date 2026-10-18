function MobileRecentTransactions({ transactions = [], onViewAll }) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <section className="mobile-card">
      <div className="mobile-section-title">
        <h2>Recent Transactions</h2>
        {onViewAll && <button onClick={onViewAll}>See all</button>}
      </div>

      {recent.length === 0 ? (
        <p className="mobile-empty-text">No transactions yet.</p>
      ) : (
        <div className="mobile-transaction-list">
          {recent.map((transaction) => {
            const isIncome = transaction.type === "Income";
            const amount = Number(transaction.amount || 0);

            return (
              <div className="mobile-transaction-row" key={transaction.id}>
                <div className="mobile-transaction-icon">{isIncome ? "↗" : "↘"}</div>

                <div className="mobile-transaction-info">
                  <strong>
                    {transaction.description || transaction.category || "Transaction"}
                  </strong>
                  <span>{transaction.category || transaction.type}</span>
                </div>

                <strong className={isIncome ? "mobile-income" : "mobile-expense"}>
                  {isIncome ? "+" : "-"}₹{amount.toLocaleString("en-IN")}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MobileRecentTransactions;

