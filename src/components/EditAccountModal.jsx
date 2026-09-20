import { useState } from "react";
import "./EditAccountModal.css";

const availableIcons = ["💵", "🏦", "📱", "💳", "💰", "🏛️", "💎", "💼", "🪙", "🏖️"];

function EditAccountModal({ account, onClose, onSave }) {
  const [name, setName] = useState(account.name || "");
  const [icon, setIcon] = useState(account.icon || "💵");
  const [monthlyBudget, setMonthlyBudget] = useState(
    account.monthlyBudget !== undefined ? account.monthlyBudget : ""
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...account,
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
            <span className="box-icon-wrap">✏️</span>
            <div>
              <h3>Edit Account</h3>
              <p>Update account details and monthly budget</p>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Monthly Budget */}
          <div className="form-group">
            <label>Monthly Budget Limit (₹)</label>
            <input
              type="number"
              placeholder="e.g. 15000"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAccountModal;