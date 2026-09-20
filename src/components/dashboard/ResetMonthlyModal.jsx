import { useState, useEffect } from "react";
import "./ResetMonthlyModal.css";

function ResetMonthlyModal({
  open,
  onClose,
  accounts = [],
  transactions = [],
  selectedAccountId = "overall",
  onResetBudget,
  onResetExpenses,
  onResetAll,
  onResetFilter,
}) {
  const [scope, setScope] = useState(selectedAccountId || "overall");
  const [confirmState, setConfirmState] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (open) {
      setScope(selectedAccountId || "overall");
      setConfirmState(null);
      setSuccessMessage("");
    }
  }, [open, selectedAccountId]);

  if (!open) return null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedScopeAccount =
    scope === "overall"
      ? null
      : accounts.find((a) => String(a.id) === String(scope));

  const scopeName = selectedScopeAccount
    ? `${selectedScopeAccount.icon || "💳"} ${selectedScopeAccount.name}`
    : "🌍 Overall (All Accounts)";

  const scopeBudget = selectedScopeAccount
    ? Number(selectedScopeAccount.monthlyBudget || 0)
    : accounts.reduce(
        (sum, a) => sum + Number(a.monthlyBudget || 0),
        0
      );

  const scopeExpenses = transactions.filter((t) => {
    if (t.type !== "Expense") return false;
    const d = new Date(t.date);
    if (
      d.getMonth() !== currentMonth ||
      d.getFullYear() !== currentYear
    ) {
      return false;
    }
    if (!selectedScopeAccount) return true;
    return t.account === selectedScopeAccount.name;
  });

  const totalSpent = scopeExpenses.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );
  const expenseCount = scopeExpenses.length;
  const remaining = scopeBudget - totalSpent;

  function triggerSuccess(msg) {
    setSuccessMessage(msg);
    setConfirmState(null);
    setTimeout(() => {
      onClose();
    }, 1000);
  }

  function handleResetBudgetClick() {
    setConfirmState({
      type: "budget",
      title: "Reset Monthly Budget",
      badge: "🎯 Budget Reset",
      message: `Set monthly budget to ₹0 for ${scopeName}?`,
      warning: "Your recorded expenses and transaction history will remain safe.",
      onConfirm: () => {
        onResetBudget?.(scope);
        triggerSuccess(`Monthly budget reset to ₹0 for ${scopeName}`);
      },
    });
  }

  function handleResetExpensesClick() {
    setConfirmState({
      type: "expenses",
      title: "Reset Monthly Expenses",
      badge: "💸 Expense Clear",
      message: `Delete ${expenseCount} expense transaction${
        expenseCount === 1 ? "" : "s"
      } (₹${totalSpent.toLocaleString("en-IN")}) from ${scopeName} for ${monthName}?`,
      warning: "This will permanently delete these expense transactions for this month.",
      onConfirm: () => {
        onResetExpenses?.(scope);
        triggerSuccess(`Cleared ${expenseCount} expenses for ${monthName}`);
      },
    });
  }

  function handleResetAllClick() {
    setConfirmState({
      type: "all",
      title: "Reset All Monthly Data",
      badge: "🧹 Full Monthly Reset",
      message: `Reset both the monthly budget to ₹0 and delete all ${expenseCount} expense transaction${
        expenseCount === 1 ? "" : "s"
      } (₹${totalSpent.toLocaleString("en-IN")}) for ${scopeName}?`,
      warning: "This will permanently clear both your monthly budget and expenses for this month.",
      onConfirm: () => {
        onResetAll?.(scope);
        triggerSuccess(`Monthly budget & expenses reset for ${scopeName}`);
      },
    });
  }

  function handleResetFilterClick() {
    onResetFilter?.();
    setScope("overall");
    triggerSuccess("Filter reset to Overall account");
  }

  return (
    <div className="reset-modal-overlay" onClick={onClose}>
      <div
        className="reset-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="reset-modal-header">
          <div className="reset-header-left">
            <div className="reset-header-icon">🔄</div>
            <div>
              <h2>Reset Monthly Options</h2>
              <p>Manage and reset data for {monthName}</p>
            </div>
          </div>
          <button
            className="reset-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="reset-success-banner">
            <span className="success-icon">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Confirmation Screen */}
        {confirmState && !successMessage && (
          <div className="reset-confirm-container">
            <div className="confirm-icon-wrap">
              <span className="confirm-badge">{confirmState.badge}</span>
              <span className="confirm-warning-icon">⚠️</span>
            </div>
            <h3>{confirmState.title}</h3>
            <p className="confirm-message">{confirmState.message}</p>
            {confirmState.warning && (
              <div className="confirm-warning-box">
                <strong>Important:</strong> {confirmState.warning}
              </div>
            )}
            <div className="confirm-actions">
              <button
                className="confirm-back-btn"
                onClick={() => setConfirmState(null)}
              >
                Go Back
              </button>
              <button
                className="confirm-execute-btn"
                onClick={confirmState.onConfirm}
              >
                Confirm & Reset
              </button>
            </div>
          </div>
        )}

        {/* Main Options View */}
        {!confirmState && !successMessage && (
          <>
            {/* Scope Selection */}
            <div className="reset-scope-bar">
              <label htmlFor="reset-scope-select">Target Scope:</label>
              <select
                id="reset-scope-select"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="overall">🌍 Overall (All Accounts)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.icon} {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope Summary Preview */}
            <div className="reset-summary-grid">
              <div className="reset-summary-card">
                <small>Monthly Budget</small>
                <strong>₹{scopeBudget.toLocaleString("en-IN")}</strong>
              </div>
              <div className="reset-summary-card">
                <small>Spent This Month</small>
                <strong>
                  ₹{totalSpent.toLocaleString("en-IN")}
                </strong>
                <span className="tx-count">
                  {expenseCount} transaction{expenseCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="reset-summary-card">
                <small>Remaining</small>
                <strong
                  className={
                    remaining < 0 ? "negative-text" : "positive-text"
                  }
                >
                  ₹{remaining.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* Reset Options List */}
            <div className="reset-options-list">
              {/* Option 1: Reset Budget */}
              <div className="reset-option-item">
                <div className="option-info">
                  <div className="option-icon-box budget-icon">🎯</div>
                  <div>
                    <h4>Reset Monthly Budget</h4>
                    <p>
                      Set budget limit to ₹0. Transactions remain unchanged.
                    </p>
                  </div>
                </div>
                <button
                  className="reset-action-btn btn-budget"
                  onClick={handleResetBudgetClick}
                  disabled={scopeBudget === 0}
                  title={
                    scopeBudget === 0
                      ? "Budget is already ₹0"
                      : "Reset monthly budget"
                  }
                >
                  {scopeBudget === 0 ? "Already ₹0" : "Reset Budget"}
                </button>
              </div>

              {/* Option 2: Reset Monthly Expenses */}
              <div className="reset-option-item">
                <div className="option-info">
                  <div className="option-icon-box expense-icon">💸</div>
                  <div>
                    <h4>Reset Monthly Expenses</h4>
                    <p>
                      Delete all {expenseCount} expense transaction
                      {expenseCount === 1 ? "" : "s"} in {monthName}.
                    </p>
                  </div>
                </div>
                <button
                  className="reset-action-btn btn-expense"
                  onClick={handleResetExpensesClick}
                  disabled={expenseCount === 0}
                  title={
                    expenseCount === 0
                      ? "No expenses to clear"
                      : "Clear this month's expenses"
                  }
                >
                  {expenseCount === 0 ? "No Expenses" : "Reset Expenses"}
                </button>
              </div>

              {/* Option 3: Reset Both */}
              <div className="reset-option-item">
                <div className="option-info">
                  <div className="option-icon-box all-icon">🧹</div>
                  <div>
                    <h4>Reset All Monthly Data</h4>
                    <p>
                      Reset budget to ₹0 and delete all this month's expenses.
                    </p>
                  </div>
                </div>
                <button
                  className="reset-action-btn btn-all"
                  onClick={handleResetAllClick}
                  disabled={scopeBudget === 0 && expenseCount === 0}
                  title={
                    scopeBudget === 0 && expenseCount === 0
                      ? "Nothing to reset"
                      : "Reset budget and expenses"
                  }
                >
                  Reset All
                </button>
              </div>

              {/* Option 4: Reset Account Filter (if scoped to specific account) */}
              {scope !== "overall" && (
                <div className="reset-option-item highlight-item">
                  <div className="option-info">
                    <div className="option-icon-box filter-icon">🌍</div>
                    <div>
                      <h4>Reset Account Filter</h4>
                      <p>
                        Switch monthly card view back to Overall account.
                      </p>
                    </div>
                  </div>
                  <button
                    className="reset-action-btn btn-filter"
                    onClick={handleResetFilterClick}
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="reset-modal-footer">
              <button className="reset-close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetMonthlyModal;

