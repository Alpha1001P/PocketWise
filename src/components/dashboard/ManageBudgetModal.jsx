import { useEffect, useState } from "react";
import "./ManageBudgetModal.css";

function ManageBudgetModal({ open, accounts = [], onClose, onSave }) {
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    setBudgets(
      accounts.map((a) => ({
        ...a,
        monthlyBudget: a.monthlyBudget || 0,
      }))
    );
  }, [accounts]);

  if (!open) return null;

  function updateBudget(id, value) {
    setBudgets((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              monthlyBudget: Math.max(0, Number(value) || 0),
            }
          : a
      )
    );
  }

  const totalCalculatedBudget = budgets.reduce(
    (sum, a) => sum + (Number(a.monthlyBudget) || 0),
    0
  );

  return (
    <div className="budget-modal-overlay" onClick={onClose}>
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="budget-modal-header">
          <div className="budget-modal-title-row">
            <span className="budget-modal-icon">⚙️</span>
            <div>
              <h2>Manage Account Budgets</h2>
              <p>Set spending limits for each account</p>
            </div>
          </div>
          <button className="budget-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Total Overview Box */}
        <div className="budget-modal-total-banner">
          <div>
            <small>Total Monthly Budget</small>
            <h3>₹{totalCalculatedBudget.toLocaleString("en-IN")}</h3>
          </div>
          <span className="total-accounts-chip">
            {budgets.length} account{budgets.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Budget List */}
        <div className="budget-list">
          {budgets.map((account) => (
            <div key={account.id} className="budget-item">
              <div className="budget-item-info">
                <span className="budget-acc-icon">{account.icon || "💳"}</span>
                <div>
                  <h4>{account.name}</h4>
                  <small>Monthly Limit</small>
                </div>
              </div>

              <div className="budget-input-wrapper">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={account.monthlyBudget === 0 ? "" : account.monthlyBudget}
                  onChange={(e) => updateBudget(account.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="budget-modal-footer">
          <button className="cancel-budget" onClick={onClose}>
            Cancel
          </button>
          <button className="save-budget" onClick={() => onSave(budgets)}>
            Save Budgets
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageBudgetModal;