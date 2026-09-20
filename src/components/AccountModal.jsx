import { useState, useEffect } from "react";

function AccountModal({
  isOpen,
  onClose,
  onSave,
  editingAccount,
  accounts = [],
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingAccount) {
      setName(editingAccount.name);
      setBalance(editingAccount.balance || 0);
      setMonthlyBudget(
        editingAccount.monthlyBudget || 0
      );
    } else {
      setName("");
      setBalance("");
      setMonthlyBudget("");
    }

    setError("");
  }, [isOpen, editingAccount]);

  function getIcon(accountName) {
    const text = accountName.toLowerCase();

    if (
      text.includes("bank") ||
      text.includes("sbi") ||
      text.includes("hdfc") ||
      text.includes("icici") ||
      text.includes("axis") ||
      text.includes("pnb")
    ) {
      return "🏦";
    }

    if (
      text.includes("cash") ||
      text.includes("wallet") ||
      text.includes("Savings")
    ) {
      return "💵";
    }

    if (
      text.includes("card") ||
      text.includes("credit") ||
      text.includes("debit")
    ) {
      return "💳";
    }

    if (
      text.includes("upi") ||
      text.includes("gpay") ||
      text.includes("phonepe") ||
      text.includes("paytm") ||
      text.includes("BhimUPI") ||
      text.includes("Fampay")


    ) {
      return "📱";
    }

    if (text.includes("scholarship")) {
      return "🎓";
    }

    if (text.includes("salary")) {
      return "💼";
    }

    if (text.includes("gift")) {
      return "🎁";
    }

    return "🏦";
  }

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter an account name.");
      return;
    }

    const duplicate = accounts.find(
      (account) =>
        account.name.toLowerCase() ===
          trimmedName.toLowerCase() &&
        account.id !== editingAccount?.id
    );

    if (duplicate) {
      setError("Account name already exists.");
      return;
    }

   onSave({
  id: editingAccount
    ? editingAccount.id
    : Date.now(),

  name: trimmedName,

  balance: Number(balance) || 0,

  monthlyBudget: Number(monthlyBudget) || 0,

  icon: getIcon(trimmedName),
});onSave({
  id: editingAccount
    ? editingAccount.id
    : Date.now(),

  name: trimmedName,

  balance: Number(balance) || 0,

  monthlyBudget: Number(monthlyBudget) || 0,

  icon: getIcon(trimmedName),
});onSave({
  id: editingAccount
    ? editingAccount.id
    : Date.now(),

  name: trimmedName,

  balance: Number(balance) || 0,

  monthlyBudget: Number(monthlyBudget) || 0,

  icon: getIcon(trimmedName),
});onSave({
  id: editingAccount
    ? editingAccount.id
    : Date.now(),

  name: trimmedName,

  balance: Number(balance) || 0,

  monthlyBudget: Number(monthlyBudget) || 0,

  icon: getIcon(trimmedName),
});
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="account-modal">

        <div className="modal-header">
          <h2>
            {editingAccount
              ? "Edit Account"
              : "Add New Account"}
          </h2>
        </div>

        <div className="input-group">
          <label>Account Name</label>

          <input
            type="text"
            placeholder="e.g. SBI Savings"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="input-group">
          <label>Opening Balance</label>

          <input
            type="number"
            placeholder="₹0"
            value={balance}
            onChange={(e) =>
              setBalance(e.target.value)
            }
          />
        </div>
        <div className="input-group">

  <label>
    Monthly Budget
  </label>

  <input
    type="number"
    placeholder="₹0"
    value={monthlyBudget}
    onChange={(e) =>
      setMonthlyBudget(e.target.value)
    }
  />

</div>

        <div className="input-group">
          <label>Monthly Budget</label>

          <input
            type="number"
            placeholder="₹0"
            value={monthlyBudget}
            onChange={(e) =>
              setMonthlyBudget(e.target.value)
            }
          />
        </div>

        {error && (
          <p className="modal-error">
            {error}
          </p>
        )}

        <div className="modal-buttons">

          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
          >
            {editingAccount
              ? "Save Changes"
              : "Create Account"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default AccountModal;