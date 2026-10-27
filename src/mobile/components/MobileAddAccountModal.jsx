import { useState } from "react";
import { createAccount } from "../../lib/database";

const ACCOUNT_ICONS = ["💳", "🏦", "💵", "💰", "🪙", "📱", "💼", "📈"];
const ACCOUNT_TYPES = ["Checking", "Savings", "Cash", "Credit Card", "Investment", "Digital Wallet"];

function MobileAddAccountModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Checking");
  const [icon, setIcon] = useState("💳");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an account name.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: dbError } = await createAccount({
      name: name.trim(),
      type,
      balance: 0,
      icon,
      monthlyBudget: Number(monthlyBudget) || 0,
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message || "Failed to create account.");
      return;
    }

    // Reset fields
    setName("");
    setType("Checking");
    setIcon("💳");
    setMonthlyBudget("");

    if (onSuccess) onSuccess(data);
    onClose();
  }

  return (
    <div className="m-sheet-backdrop" onClick={onClose}>
      <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="m-sheet-handle" />

        <div className="m-sheet-header">
          <h2 className="m-sheet-title">Add New Account</h2>
          <button type="button" className="m-sheet-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="m-sheet-body">
          {/* Icon Selector */}
          <div className="m-field">
            <label className="m-field-label">Choose Icon</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ACCOUNT_ICONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIcon(item)}
                  style={{
                    width: "44px",
                    height: "44px",
                    fontSize: "22px",
                    borderRadius: "12px",
                    border: icon === item ? "2px solid var(--m-primary)" : "1.5px solid var(--m-border)",
                    background: icon === item ? "var(--m-primary-light)" : "var(--m-surface-2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Account Name */}
          <div className="m-field">
            <label className="m-field-label">Account Name</label>
            <input
              type="text"
              className="m-field-input"
              placeholder="e.g. HDFC Bank, Cash, Pocket Wallet"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Account Type */}
          <div className="m-field">
            <label className="m-field-label">Account Type</label>
            <select
              className="m-field-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Spending Cap (Optional) */}
          <div className="m-field">
            <label className="m-field-label">Monthly Spending Cap (Optional)</label>
            <input
              type="number"
              className="m-field-input"
              placeholder="e.g. 10000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
            />
          </div>

          {error && <p className="m-form-error">{error}</p>}

          <button
            type="submit"
            className="m-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Save Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default MobileAddAccountModal;

