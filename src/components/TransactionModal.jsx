import { useState } from "react";
import "../styles/modals.css";
import "./TransactionModal.css";

const categoryIcons = {
  Food: "🍔", Travel: "✈️", Shopping: "🛍️",
  Education: "🎓", Entertainment: "🎮", Health: "🏥",
  Bills: "🧾", Salary: "💼", Pocket: "👛",
  Freelance: "💻", Investment: "📈", Allowance: "💵",
  Other: "📦", Income: "💰",
};

function TransactionModal({ transaction, close, onEdit, onDelete, onPin, onDuplicate }) {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(transaction.amount);
  const [type, setType] = useState(transaction.type);

  function handleSave() {
    if (!title.trim()) { alert("Please enter a title"); return; }
    if (Number(amount) <= 0) { alert("Amount must be greater than 0"); return; }
    if (onEdit) {
      onEdit({ ...transaction, title: title.trim(), amount: Number(amount), type });
    }
    setEditMode(false);
    close();
  }

  const formattedDate = new Date(transaction.date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const icon = categoryIcons[transaction.category] || categoryIcons[transaction.type] || "📦";

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>

        {editMode ? (
          <>
            {/* Edit Mode */}
            <div className="tm-header">
              <div className="tm-icon-wrap">✏️</div>
              <div>
                <h3>Edit Transaction</h3>
                <p>Update the transaction details below</p>
              </div>
              <button className="tm-close-btn" onClick={close}>✕</button>
            </div>

            <div className="tm-edit-form">
              <div className="tm-field">
                <label>Title</label>
                <input
                  className="tm-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Transaction title"
                  autoFocus
                />
              </div>

              <div className="tm-field">
                <label>Amount (₹)</label>
                <div className="tm-amount-wrap">
                  <span className="tm-currency">₹</span>
                  <input
                    className="tm-input tm-amount-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="tm-field">
                <label>Type</label>
                <div className="tm-type-toggle">
                  <button
                    type="button"
                    className={`tm-type-btn ${type === "Expense" ? "active-expense" : ""}`}
                    onClick={() => setType("Expense")}
                  >📉 Expense</button>
                  <button
                    type="button"
                    className={`tm-type-btn ${type === "Income" ? "active-income" : ""}`}
                    onClick={() => setType("Income")}
                  >📈 Income</button>
                </div>
              </div>
            </div>

            <div className="tm-footer">
              <button className="tm-cancel" onClick={() => setEditMode(false)}>Cancel</button>
              <button className="tm-save" onClick={handleSave}>Save Changes</button>
            </div>
          </>
        ) : (
          <>
            {/* View Mode */}
            <div className="tm-header">
              <div className="tm-icon-wrap">{icon}</div>
              <div className="tm-title-area">
                <h3>{transaction.title}</h3>
                <p>{transaction.category} · {transaction.account} · {formattedDate}</p>
              </div>
              <button className="tm-close-btn" onClick={close}>✕</button>
            </div>

            {/* Amount Display */}
            <div className={`tm-amount-display ${transaction.type === "Income" ? "income" : "expense"}`}>
              <span>{transaction.type === "Income" ? "+" : "−"}</span>
              <strong>₹{Number(transaction.amount).toLocaleString("en-IN")}</strong>
              <span className="tm-type-label">{transaction.type}</span>
            </div>

            {/* Action Buttons */}
            <div className="tm-actions-grid">
              <button className="tm-action-btn" onClick={() => setEditMode(true)}>
                <span>✏️</span>
                <span>Edit</span>
              </button>

              <button
                className="tm-action-btn"
                onClick={() => { if (onPin) onPin(transaction.id); close(); }}
              >
                <span>{transaction.pinned ? "📌" : "⭐"}</span>
                <span>{transaction.pinned ? "Unpin" : "Pin"}</span>
              </button>

              <button
                className="tm-action-btn"
                onClick={() => { if (onDuplicate) onDuplicate(transaction); close(); }}
              >
                <span>📋</span>
                <span>Duplicate</span>
              </button>

              <button
                className="tm-action-btn danger"
                onClick={() => { if (onDelete) onDelete(transaction.id); close(); }}
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            </div>

            <button className="tm-dismiss-btn" onClick={close}>Dismiss</button>
          </>
        )}
      </div>
    </div>
  );
}

export default TransactionModal;