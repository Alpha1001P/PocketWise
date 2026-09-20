import { useEffect, useState } from "react";

function ManageBudgetModal({
  isOpen,
  onClose,
  accounts,
  onSave,
}) {
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const initial = {};

    initial.overall =
      accounts.reduce(
        (sum, account) =>
          sum + Number(account.monthlyBudget || 0),
        0
      );

    accounts.forEach((account) => {
      initial[account.id] =
        account.monthlyBudget || 0;
    });

    setBudgets(initial);

  }, [isOpen, accounts]);

  function handleChange(key, value) {
    setBudgets((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSave() {
    onSave(budgets);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">

      <div className="account-modal">

        <div className="modal-header">
          <h2>Manage Budgets</h2>
        </div>

        {/* Overall */}

        <div className="input-group">

          <label>🌍 Overall</label>

          <input
            type="number"
            value={budgets.overall || ""}
            onChange={(e) =>
              handleChange(
                "overall",
                e.target.value
              )
            }
          />

        </div>

        {accounts.map((account) => (

          <div
            className="input-group"
            key={account.id}
          >

            <label>
              {account.icon} {account.name}
            </label>

            <input
              type="number"
              value={
                budgets[account.id] || ""
              }
              onChange={(e) =>
                handleChange(
                  account.id,
                  e.target.value
                )
              }
            />

          </div>

        ))}

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSave}
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}

export default ManageBudgetModal;