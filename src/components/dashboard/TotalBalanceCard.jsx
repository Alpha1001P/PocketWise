import "./TotalBalanceCard.css";

function TotalBalanceCard({ totalBalance = 0 }) {
  const isPositive = totalBalance >= 0;

  return (
    <div className="total-balance-card">
      <div className="balance-top">
        <div className="balance-icon-wrap">💰</div>
        <div className="balance-live-badge">
          <span className="live-pulse"></span>
          <span>Live Net Worth</span>
        </div>
      </div>

      <div className="balance-content">
        <span className="balance-label">Total Balance</span>
        <h2 className={`balance-amount ${isPositive ? "positive" : "negative"}`}>
          ₹{Number(totalBalance).toLocaleString("en-IN")}
        </h2>
        <p className="balance-description">
          Combined real-time liquidity across all accounts
        </p>
      </div>
    </div>
  );
}

export default TotalBalanceCard;