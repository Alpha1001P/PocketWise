import "./MobileQuickActions.css";

function MobileQuickActions({ onAddTransaction }) {
  return (
    <div className="mobile-quick-actions">
      <button onClick={onAddTransaction}>
        <span>＋</span>
        <strong>Add Transaction</strong>
      </button>
    </div>
  );
}

export default MobileQuickActions;