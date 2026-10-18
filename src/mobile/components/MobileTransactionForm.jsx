import { useState, useEffect } from "react";
import { createTransaction } from "../../lib/database";
import { getCategoryIcon } from "../../utils/categoryDetector";

const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment",
  "Bills", "Health", "Education", "Travel",
  "Groceries", "Subscriptions", "Dining", "Fitness",
  "Insurance", "Home", "Personal", "Other",
];

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Business", "Investment",
  "Gift", "Bonus", "Refund", "Other",
];

function MobileTransactionForm({ accounts = [], onSuccess, onClose }) {
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [accountName, setAccountName] = useState(accounts[0]?.name || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(newType) {
    setType(newType);
    setCategory("");
  }

  function handleAccountChange(id) {
    setAccountId(id);
    const acc = accounts.find((a) => String(a.id) === String(id));
    setAccountName(acc ? acc.name : "");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);

    const transaction = {
      type,
      amount: Number(amount),
      description: description.trim() || category || type,
      category: category || null,
      account: accountName || null,
      account_id: accountId || null,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
    };

    const { data, error: saveError } = await createTransaction(transaction);

    setSaving(false);

    if (saveError) {
      setError(saveError.message || "Failed to save transaction.");
      return;
    }

    if (onSuccess) {
      onSuccess(data);
    }

    onClose();
  }

  return (
    <div className="m-sheet-backdrop" onClick={onClose}>
      <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="m-sheet-handle" />

        <div className="m-sheet-header">
          <h2 className="m-sheet-title">Add {type}</h2>
          <button type="button" className="m-sheet-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="m-sheet-body">
          {/* Type Toggle */}
          <div className="m-type-toggle">
            {["Expense", "Income", "Transfer"].map((t) => (
              <button
                key={t}
                type="button"
                className={`m-type-btn ${type === t ? `active ${t.toLowerCase()}` : ""}`}
                onClick={() => handleTypeChange(t)}
              >
                {t === "Expense" ? "↓ " : t === "Income" ? "↑ " : "⇆ "}
                {t}
              </button>
            ))}
          </div>

          {/* Amount Box */}
          <div className="m-amount-wrap">
            <span className="m-amount-currency">₹</span>
            <input
              type="number"
              inputMode="decimal"
              className="m-amount-input"
              placeholder="0.00"
              value={amount}
              min="0"
              step="any"
              autoFocus
              required
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="m-field">
            <label className="m-field-label">Description / Note</label>
            <input
              type="text"
              className="m-field-input"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category Chips */}
          {type !== "Transfer" && (
            <div className="m-field">
              <label className="m-field-label">Category</label>
              <div className="m-cat-pills">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`m-cat-pill-btn ${category === cat ? "active" : ""}`}
                    onClick={() => setCategory(category === cat ? "" : cat)}
                  >
                    <span>{getCategoryIcon(cat)}</span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account */}
          {accounts.length > 0 && (
            <div className="m-field">
              <label className="m-field-label">Account</label>
              <select
                className="m-field-input"
                value={accountId}
                onChange={(e) => handleAccountChange(e.target.value)}
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.icon || "💳"} {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="m-field">
            <label className="m-field-label">Date</label>
            <input
              type="date"
              className="m-field-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {error && <p className="m-form-error">{error}</p>}

          <button
            type="submit"
            className={`m-submit-btn ${type.toLowerCase()}`}
            disabled={saving}
          >
            {saving ? "Saving..." : `Confirm ${type}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MobileTransactionForm;
