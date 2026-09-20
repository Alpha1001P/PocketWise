import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./RecentTransactions.css";

function RecentTransactions({
  transactions = [],
  onEdit,
  onDelete,
  onViewAll,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    function closeMenu() {
      setOpenMenu(null);
    }

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  function getCategoryIcon(item) {
    if (item.type === "Income") {
      return "💰";
    }

    switch (item.category) {
      case "Food":
        return "🍔";

      case "Travel":
      case "Transport":
        return "🚕";

      case "Shopping":
        return "🛍️";

      case "Education":
        return "📚";

      case "Entertainment":
        return "🎮";

      case "Health":
      case "Healthcare":
        return "🏥";

      case "Bills":
      case "Mobile":
        return "📱";

      case "Salary":
      case "Pocket":
        return "💵";

      default:
        return "📄";
    }
  }

  function getDateLabel(date) {
    if (!date) {
      return "Unknown date";
    }

    const today = new Date();
    const transactionDate = new Date(date);

    if (Number.isNaN(transactionDate.getTime())) {
      return "Unknown date";
    }

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const transactionStart = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate()
    );

    const diff = Math.floor(
      (todayStart - transactionStart) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) {
      return "Today";
    }

    if (diff === 1) {
      return "Yesterday";
    }

    return transactionDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  function getTransactionTitle(item) {
    return (
      item.title ||
      item.description ||
      item.category ||
      "Transaction"
    );
  }

  function getAccountName(item) {
    return item.account || "Cash Wallet";
  }

  function handleViewAll() {
    if (onViewAll) {
      onViewAll();
      return;
    }

    navigate("/transactions");
  }

  return (
    <section className="recent-transactions-card">
      <div className="recent-header">
        <div>
          <h2>Recent Transactions</h2>
          <p>Your latest activity</p>
        </div>

        <button
          type="button"
          className="view-all-btn"
          onClick={handleViewAll}
        >
          See All →
        </button>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="empty-transactions">
          <div className="empty-icon">💸</div>

          <h3>No Transactions Yet</h3>

          <p>Start adding your expenses and income.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {recentTransactions.map((item, index) => {
            const isMenuOpen = openMenu === item.id;

            return (
              <div
                key={item.id}
                className={
                  isMenuOpen
                    ? "transaction-item menu-open"
                    : "transaction-item"
                }
                style={{
                  zIndex: isMenuOpen ? 9999 : 1,
                }}
              >
                <div className="transaction-left">
                  <div className="transaction-avatar">
                    {getCategoryIcon(item)}
                  </div>

                  <div className="transaction-details">
                    <h4>{getTransactionTitle(item)}</h4>

                    <p>
                      {item.category || "Other"}
                      {" • "}
                      {getAccountName(item)}
                    </p>
                  </div>
                </div>

                <div className="transaction-right">
                  <span
                    className={
                      item.type === "Income"
                        ? "amount income"
                        : "amount expense"
                    }
                  >
                    {item.type === "Income" ? "+" : "-"}₹
                    {Number(item.amount || 0).toLocaleString("en-IN")}
                  </span>

                  <div className="transaction-meta">
                    <small>{getDateLabel(item.date)}</small>

                    <div className="menu-wrapper">
                      <button
                        type="button"
                        className="menu-btn"
                        aria-label="Transaction options"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenu(
                            isMenuOpen ? null : item.id
                          );
                        }}
                      >
                        ⋮
                      </button>

                      {isMenuOpen && (
                        <div
                          className={
                            index >= recentTransactions.length - 3
                              ? "menu-dropdown top"
                              : "menu-dropdown bottom"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);

                              if (onEdit) {
                                onEdit(item);
                              }
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);

                              if (onDelete) {
                                onDelete(item.id);
                              }
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecentTransactions;