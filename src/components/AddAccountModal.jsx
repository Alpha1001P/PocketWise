import { useState } from "react";
import "./EditAccountModal.css";

const availableIcons = ["💵", "🏦", "📱", "💳", "💰", "🏛️", "💎", "💼", "🪙", "🏖️"];


function AddAccountModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💵");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      id: Date.now(),
      name: name.trim(),
      icon,
      monthlyBudget: Number(monthlyBudget) || 0,
    });

    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box account-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box-header">
          <div className="modal-box-title">
            <span className="box-icon-wrap">🏦</span>
            <div>
              <h3>Add New Account</h3>
              <p>Create a wallet, bank, or savings account</p>
            </div>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="account-form-body">
          {/* Account Name */}
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. HDFC Bank, Cash Wallet, Crypto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Monthly Budget */}
          <div className="form-group">
            <label>Monthly Budget Limit (₹) <small>(Optional)</small></label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
            />
          </div>

          {/* Choose Icon */}
          <div className="form-group">
            <label>Choose Account Icon</label>
            <div className="icon-selector-grid">
              {availableIcons.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`icon-pill-btn ${icon === item ? "active" : ""}`}
                  onClick={() => setIcon(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-box-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-create">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAccountModal;