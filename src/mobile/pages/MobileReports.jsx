import { useEffect, useMemo, useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileTransactionForm from "../components/MobileTransactionForm";
import { getAccounts, getTransactions } from "../../lib/database";
import { getCategoryIcon } from "../../utils/categoryDetector";
import "../styles/mobile.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function MobileReports() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [txResult, accResult] = await Promise.all([
      getTransactions(),
      getAccounts(),
    ]);

    if (txResult.data) setTransactions(txResult.data);
    if (accResult.data) setAccounts(accResult.data);
    setLoading(false);
  }

  const selectedMonthName = MONTHS[currentMonthIndex];

  const monthTransactions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return (
        d.getMonth() === currentMonthIndex &&
        d.getFullYear() === currentYear
      );
    });
  }, [transactions, currentMonthIndex]);

  const totalIncome = monthTransactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(0) : 0;

  const categoryTotals = useMemo(() => {
    const map = {};
    monthTransactions
      .filter((t) => t.type === "Expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + Number(t.amount || 0);
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTransactions]);

  function handlePrevMonth() {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  }

  function handleNextMonth() {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  }

  return (
    <div className="mobile-app">
      <div className="mobile-page">
        <MobileHeader
          title="Reports & Analytics"
          subtitle="Monthly cash flow breakdown"
          initial="R"
        />

        <main className="m-content">
          {/* Month Selector Carousel Header */}
          <div className="m-month-selector">
            <button
              type="button"
              className="m-month-btn"
              onClick={handlePrevMonth}
            >
              ‹
            </button>
            <div className="m-month-label">{selectedMonthName} 2026</div>
            <button
              type="button"
              className="m-month-btn"
              onClick={handleNextMonth}
            >
              ›
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="m-stats-grid">
            <div className="m-stat-pill income">
              <div className="m-stat-icon-label">
                <span>↓</span> Total In
              </div>
              <div className="m-stat-amount">
                +₹{totalIncome.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="m-stat-pill expense">
              <div className="m-stat-icon-label">
                <span>↑</span> Total Out
              </div>
              <div className="m-stat-amount">
                -₹{totalExpense.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="m-stat-pill balance">
              <div className="m-stat-icon-label">
                <span>💎</span> Net Savings
              </div>
              <div className="m-stat-amount">
                {netSavings >= 0 ? "+" : "-"}₹
                {Math.abs(netSavings).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="m-stat-pill saving">
              <div className="m-stat-icon-label">
                <span>📈</span> Savings Rate
              </div>
              <div className="m-stat-amount">{savingRate}%</div>
            </div>
          </div>

          {/* Category Breakdown Card */}
          <section className="m-card">
            <div className="m-card-header">
              <h2 className="m-card-title">Expense Distribution</h2>
              <span className="m-budget-caption">
                {categoryTotals.length} categories
              </span>
            </div>

            {loading ? (
              <div className="m-loading">
                <div className="m-spinner" />
                <span>Crunching statistics...</span>
              </div>
            ) : categoryTotals.length === 0 ? (
              <div className="m-empty">
                <span className="m-empty-icon">📊</span>
                <strong className="m-empty-title">
                  No expenses for {selectedMonthName}
                </strong>
                <span className="m-empty-desc">
                  Record expenses to analyze which categories consume your budget.
                </span>
              </div>
            ) : (
              <div className="m-cat-list">
                {categoryTotals.map(([catName, amount]) => {
                  const percentage =
                    totalExpense > 0
                      ? Math.min(100, (amount / totalExpense) * 100).toFixed(0)
                      : 0;

                  return (
                    <div key={catName} className="m-cat-row">
                      <div className="m-cat-top">
                        <div className="m-cat-left">
                          <div className="m-cat-icon-box">
                            {getCategoryIcon(catName)}
                          </div>
                          <span className="m-cat-name">{catName}</span>
                        </div>
                        <div className="m-cat-right">
                          <div className="m-cat-amount">
                            ₹{amount.toLocaleString("en-IN")}
                          </div>
                          <span className="m-cat-pct">{percentage}%</span>
                        </div>
                      </div>

                      <div className="m-cat-bar-track">
                        <div
                          className="m-cat-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
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
          onSuccess={() => loadData()}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <MobileBottomNav onAddTransaction={() => setShowAddForm(true)} />
    </div>
  );
}

export default MobileReports;
