import SpendingTrendChart from "../charts/SpendingTrendChart";

function MonthlyOverview({ transactions }) {

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((item) => {

    if (item.type !== "Expense") return false;

    const date = new Date(item.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );

  });

  const totalExpense = monthlyTransactions.reduce(

    (sum, item) => sum + Number(item.amount),

    0

  );

  const highestExpense =
    monthlyTransactions.length > 0
      ? Math.max(
          ...monthlyTransactions.map(
            (item) => Number(item.amount)
          )
        )
      : 0;

  const averageExpense =
    monthlyTransactions.length > 0
      ? Math.round(
          totalExpense /
            monthlyTransactions.length
        )
      : 0;

  return (

    <section className="monthly-overview-card">

      <div className="card-header">

        <div>

          <h2>
            Monthly Overview
          </h2>

          <p>
            Spending analytics for this month
          </p>

        </div>

        <div className="month-chip">

          This Month

        </div>

      </div>

      <div className="overview-stats">

        <div className="overview-box">

          <span>Total Spent</span>

          <h3>
            ₹{totalExpense.toLocaleString("en-IN")}
          </h3>

        </div>

        <div className="overview-box">

          <span>Highest Expense</span>

          <h3>
            ₹{highestExpense.toLocaleString("en-IN")}
          </h3>

        </div>

        <div className="overview-box">

          <span>Average</span>

          <h3>
            ₹{averageExpense.toLocaleString("en-IN")}
          </h3>

        </div>

      </div>

      <div className="chart-wrapper">

        <SpendingTrendChart
          transactions={transactions}
        />

      </div>

    </section>

  );

}

export default MonthlyOverview;