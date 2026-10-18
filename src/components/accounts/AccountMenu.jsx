import "./AccountMenu.css";

function AccountMenu({ onEdit, onManageBudget, onDelete }) {
  return (
    <div className="account-popup">
      <button type="button" className="account-popup-btn" onClick={onEdit}>
        <span className="popup-btn-icon">✏️</span>
        <span>Edit Account</span>
      </button>

      <button type="button" className="account-popup-btn" onClick={onManageBudget}>
        <span className="popup-btn-icon">📊</span>
        <span>Manage Budget</span>
      </button>

      <div className="popup-divider" />

      <button type="button" className="account-popup-btn danger" onClick={onDelete}>
        <span className="popup-btn-icon">🗑️</span>
        <span>Delete Account</span>
      </button>
    </div>
  );
}

export default AccountMenu;