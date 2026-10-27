import { useEffect, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";
import { getAccounts, getTransactions, updateAccount } from "../../lib/database";
import "../styles/mobile.css";

function MobileBudget() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAccId, setEditingAccId] = useState(null);
  const [newLimit, setNewLimit] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadBudgetData();
  }, []);

  async function loadBudgetData() {
    setLoading(true);
    const [accResult, txResult] = await Promise.all([
      getAccounts(),
      getTransactions(),
    ]);

    if (accResult.data) setAccounts(accResult.data);
    if (txResult.data) setTransactions(txResult.data);
    setLoading(false);
  }

  const now = new Date();
  const currentMonthExpenses = transactions
    .filter((t) => {
      if (t.type !== "Expense" || !t.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalMonthlyBudget = accounts.reduce(
    (sum, a) => sum + Number(a.monthly_budget || a.monthlyBudget || 0),
    0
  );

  const overallPercentage =
    totalMonthlyBudget > 0
      ? Math.min((currentMonthExpenses / totalMonthlyBudget) * 100, 100)
      : 0;

  async function handleSaveAccountLimit(account) {
    const limitNum = Math.max(0, Number(newLimit) || 0);
    const { error } = await updateAccount(account.id, {
      ...account,
      monthly_budget: limitNum,
      monthlyBudget: limitNum,
    });

    if (error) {
      alert(error.message || "Failed to update budget limit.");
      return;
    }

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id
          ? { ...a, monthly_budget: limitNum, monthlyBudget: limitNum }
          : a
      )
    );
    setEditingAccId(null);
  }

  return (
    <div className="mobile-app">
      <div className="mobile-page">
        <MobileHeader
          title="Budget Controls"
          subtitle="Keep expenses within bounds"
          initial="B"
        />

        <main className="m-content">
          {/* Summary Overview Card */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Monthly Limit Status</h2>
            </div>

            <div className="m-budget-row">
              <div>
                <span className="m-field-label">Current Spent</span>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--m-expense)" }}>
                  ₹{currentMonthExpenses.toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="m-field-label">Total Allocated</span>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--m-primary)" }}>
                  ₹{totalMonthlyBudget.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="m-progress-track" style={{ height: "10px", marginTop: "12px" }}>
              <div
                className={`m-progress-fill ${overallPercentage >= 90 ? "danger" : ""}`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="m-budget-caption" style={{ marginTop: "8px" }}>
              {totalMonthlyBudget > 0
                ? `${overallPercentage.toFixed(0)}% of combined limits utilized`
                : "No account spending limits defined."}
            </div>
          </section>

          {/* Account Limits List */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Per-Account Allocations</h2>
            </div>

            {loading ? (
              <div className="m-loading">
                <div className="m-spinner" />
                <span>Loading accounts...</span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="m-empty">
                <span className="m-empty-icon">💳</span>
                <strong className="m-empty-title">No accounts found</strong>
                <span className="m-empty-desc">Create accounts to assign spending caps.</span>
              </div>
            ) : (
              <div className="m-account-list">
                {accounts.map((account) => {
                  const accExpenses = transactions
                    .filter((t) => {
                      if (t.type !== "Expense" || !t.date) return false;
                      const isMatch =
                        (t.account &&
                          t.account.toLowerCase() ===
                            (account.name || "").toLowerCase()) ||
                        (t.account_id &&
                          String(t.account_id) === String(account.id));
                      if (!isMatch) return false;
                      const d = new Date(t.date);
                      return (
                        d.getMonth() === now.getMonth() &&
                        d.getFullYear() === now.getFullYear()
                      );
                    })
                    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

                  const limit = Number(
                    account.monthly_budget || account.monthlyBudget || 0
                  );
                  const isEditingThis = editingAccId === account.id;
                  const pct = limit > 0 ? Math.min(100, (accExpenses / limit) * 100) : 0;

                  return (
                    <div key={account.id} className="m-budget-acc-row">
                      <div className="m-budget-acc-top">
                        <div className="m-account-icon">{account.icon || "💳"}</div>
                        <div className="m-budget-acc-info">
                          <div className="m-budget-acc-name">{account.name}</div>
                          <div className="m-budget-acc-spent">
                            Spent: ₹{accExpenses.toLocaleString("en-IN")}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="m-btn m-btn-ghost m-btn-sm"
                          onClick={() => {
                            if (isEditingThis) {
                              setEditingAccId(null);
                            } else {
                              setEditingAccId(account.id);
                              setNewLimit(account.monthly_budget || "");
                            }
                          }}
                        >
                          {isEditingThis ? "Cancel" : limit > 0 ? "Edit Cap" : "Set Cap"}
                        </button>
                      </div>

                      {isEditingThis ? (
                        <div className="m-inline-edit">
                          <input
                            type="number"
                            placeholder="Monthly limit (₹)"
                            value={newLimit}
                            autoFocus
                            onChange={(e) => setNewLimit(e.target.value)}
                          />
                          <button
                            type="button"
                            className="m-inline-save"
                            onClick={() => handleSaveAccountLimit(account)}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: "4px" }}>
                          <div className="m-budget-row" style={{ fontSize: "12px", marginBottom: "4px" }}>
                            <span>Cap: ₹{limit.toLocaleString("en-IN")}</span>
                            <span>{limit > 0 ? `${pct.toFixed(0)}% used` : "No limit"}</span>
                          </div>
                          {limit > 0 && (
                            <div className="m-progress-track" style={{ height: "6px" }}>
                              <div
                                className={`m-progress-fill ${pct >= 90 ? "danger" : ""}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {showAddForm && (
        <MobileTransactionForm
          accounts={accounts}
          onSuccess={() => loadBudgetData()}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <MobileBottomNav onAddTransaction={() => setShowAddForm(true)} />
    </div>
  );
}

export default MobileBudget;
