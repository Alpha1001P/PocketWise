import { useState } from "react";
import "./BudgetCard.css";
import ResetMonthlyModal from "./ResetMonthlyModal";

function BudgetCard({
  accounts = [],
  transactions = [],
  onManageBudget,
  onResetBudget,
  onResetExpenses,
  onResetAll,
}) {
  const [selectedAccount, setSelectedAccount] = useState("overall");
  const [showResetModal, setShowResetModal] = useState(false);

  const selected =
    selectedAccount === "overall"
      ? null
      : accounts.find(
          (a) => a.id === Number(selectedAccount)
        );

  /* =========================
     CURRENT MONTH
  ========================= */

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  /* =========================
     FILTER EXPENSES
  ========================= */

  const filteredTransactions = transactions.filter((transaction) => {
    if (transaction.type !== "Expense") {
      return false;
    }

    const date = new Date(transaction.date);

    if (
      date.getMonth() !== currentMonth ||
      date.getFullYear() !== currentYear
    ) {
      return false;
    }

    if (!selected) {
      return true;
    }

    return transaction.account === selected.name;
  });

  /* =========================
     TOTAL EXPENSE
  ========================= */

  const totalExpense = filteredTransactions.reduce(
    (sum, transaction) =>
      sum + Number(transaction.amount || 0),
    0
  );

  /* =========================
     MONTHLY BUDGET
  ========================= */

  const monthlyBudget = selected
    ? Number(selected.monthlyBudget || 0)
    : accounts.reduce(
        (sum, account) =>
          sum + Number(account.monthlyBudget || 0),
        0
      );

  /* =========================
     BUDGET CALCULATIONS
  ========================= */

  const remaining = monthlyBudget - totalExpense;

  const exceeded = remaining < 0;

  const usedPercentage =
    monthlyBudget > 0
      ? Math.min(
          Math.round((totalExpense / monthlyBudget) * 100),
          100
        )
      : 0;

  const remainingPercentage = Math.max(0, 100 - usedPercentage);

  /* =========================
     GRAPH STYLE
  ========================= */

  const circleStyle = {
    "--used": `${usedPercentage}%`,
  };

  return (
    <section className="budget-card">
      {/* =========================
          HEADER
      ========================= */}

      <div className="budget-header">
        <div className="budget-title">
          <div className="budget-icon">📊</div>

          <div>
            <h2>Monthly Budget</h2>
            <p>Track your monthly spending</p>
          </div>
        </div>

        <div className="budget-header-actions">
          <button
            type="button"
            className="reset-budget-btn"
            onClick={() => setShowResetModal(true)}
            title="Reset Monthly Options"
          >
            🔄 Reset
          </button>

          <button
            type="button"
            className="edit-budget-btn"
            onClick={onManageBudget}
          >
            ⚙ Manage Budget
          </button>
        </div>
      </div>

      {/* =========================
          ACCOUNT SELECTOR
      ========================= */}

      <div className="budget-account-select">
        <div className="budget-account-label-row">
          <label>Account Scope</label>
          {selectedAccount !== "overall" && (
            <button
              type="button"
              className="reset-filter-chip"
              onClick={() => setSelectedAccount("overall")}
              title="Reset filter to Overall"
            >
              ✕ Reset to Overall
            </button>
          )}
        </div>

        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          <option value="overall">🌍 Overall</option>

          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.icon} {account.name}
            </option>
          ))}
        </select>
      </div>

      {/* =========================
          BUDGET OVERVIEW
      ========================= */}

      <div className="budget-overview">
        {/* LEFT AMOUNT */}

        <div className="budget-spent">
          <span>Spent This Month</span>

          <h1>₹{totalExpense.toLocaleString("en-IN")}</h1>

          <p>of ₹{monthlyBudget.toLocaleString("en-IN")} budget</p>
        </div>

        {/* CIRCULAR GRAPH */}

        <div className="budget-circle-section">
          <div
            className={
              exceeded ? "budget-circle danger" : "budget-circle"
            }
            style={circleStyle}
          >
            <div className="budget-circle-inner">
              <strong>{remainingPercentage}%</strong>

              <span>Remaining</span>
            </div>
          </div>

          {/* GRAPH DETAILS */}

          <div className="budget-circle-details">
            <div className="budget-detail">
              <span>Budget Left</span>

              <strong
                className={
                  exceeded ? "danger-text" : "remaining-amount"
                }
              >
                ₹{remaining.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="budget-detail">
              <span>Used</span>

              <strong>{usedPercentage}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          PROGRESS INFORMATION
      ========================= */}

      <div className="budget-progress-area">
        <div className="progress-header">
          <span>{usedPercentage}% Used</span>

          <span
            className={
              exceeded ? "danger-text" : "remaining-text"
            }
          >
            {remainingPercentage}% Remaining
          </span>
        </div>

        <div className="progress-bar">
          <div
            className={
              exceeded ? "progress-fill danger" : "progress-fill"
            }
            style={{
              width: `${usedPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* =========================
          FOOTER
      ========================= */}

      <div className="budget-footer">
        <div className="budget-remaining">
          <small>Remaining</small>

          <h2
            className={
              exceeded ? "danger-text" : "remaining-amount"
            }
          >
            ₹{remaining.toLocaleString("en-IN")}
          </h2>
        </div>

        <div
          className={
            exceeded ? "budget-status danger" : "budget-status safe"
          }
        >
          <span>
            {exceeded ? "⚠ Budget Exceeded" : "✓ Within Budget"}
          </span>
        </div>
      </div>

      <ResetMonthlyModal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        accounts={accounts}
        transactions={transactions}
        selectedAccountId={selectedAccount}
        onResetBudget={onResetBudget}
        onResetExpenses={onResetExpenses}
        onResetAll={onResetAll}
        onResetFilter={() => setSelectedAccount("overall")}
      />
    </section>
  );
}

export default BudgetCard;