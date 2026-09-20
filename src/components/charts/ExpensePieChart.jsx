import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "../../styles/Expensepiechart.css";

/* =========================================================
   CATEGORY COLORS
========================================================= */

const CATEGORY_COLORS = {
  Food: "#F97316",

  Travel: "#3B82F6",
  "Travel, metro, local": "#3B82F6",

  groceries: "#A855F7",
  Groceries: "#A855F7",

  Education: "#22C55E",

  Entertainment: "#FACC15",
  "Entertainment, item, electronics": "#FACC15",

  Shopping: "#EC4899",

  "zepto, instamart, bigbasket, zomato, swiggy, jiomart, dominos,blinkit,min, flipkart":
    "#EF4444",

  Bills: "#06B6D4",
  "Bills, paid": "#06B6D4",

  Health: "#14B8A6",

  Salary: "#10B981",

  Pocket: "#8B5CF6",

  Freelance: "#6366F1",

  Investment: "#0EA5E9",

  Allowance: "#F59E0B",

  Other: "#94A3B8",
};

/* =========================================================
   FALLBACK COLORS
========================================================= */

const FALLBACK_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#EAB308",
];

/* =========================================================
   EXPENSE PIE CHART
========================================================= */

function ExpensePieChart({ transactions = [] }) {
  /* =======================================================
     FILTER EXPENSE TRANSACTIONS
     
     Reports.jsx already sends transactions for the
     selected month, so we only need to filter expenses here.
  ======================================================= */

  const filteredTransactions = transactions.filter(
    (item) => {
      return (
        item &&
        item.type === "Expense" &&
        item.date
      );
    }
  );

  /* =======================================================
     GROUP EXPENSES BY CATEGORY
  ======================================================= */

  const expenseData = {};

  filteredTransactions.forEach((item) => {
    const category =
      item.category || "Other";

    const amount =
      Number(item.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    expenseData[category] =
      (expenseData[category] || 0) +
      amount;
  });

  /* =======================================================
     CREATE CHART DATA
  ======================================================= */

  const data = Object.entries(expenseData)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort(
      (a, b) => b.value - a.value
    );

  /* =======================================================
     TOTAL EXPENSE
     Used for tooltip percentage.
  ======================================================= */

  const totalExpense = data.reduce(
    (sum, item) =>
      sum + item.value,
    0
  );

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (data.length === 0) {
    return (
      <div className="expense-pie-empty">
        <div className="expense-pie-empty-icon">
          📊
        </div>

        <h3>No expense data</h3>

        <p>
          Add expenses to see your
          spending breakdown.
        </p>
      </div>
    );
  }

  /* =======================================================
     CATEGORY COLOR
  ======================================================= */

  function getCategoryColor(
    category,
    index
  ) {
    return (
      CATEGORY_COLORS[category] ||
      FALLBACK_COLORS[
        index % FALLBACK_COLORS.length
      ]
    );
  }

  /* =======================================================
     CUSTOM TOOLTIP
  ======================================================= */

  function CustomTooltip({
    active,
    payload,
  }) {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    const item =
      payload[0].payload;

    const index =
      data.findIndex(
        (entry) =>
          entry.name === item.name
      );

    const percentage =
      totalExpense > 0
        ? (item.value /
            totalExpense) *
          100
        : 0;

    return (
      <div className="expense-pie-tooltip">
        <div className="expense-tooltip-title">
          <span
            className="expense-tooltip-dot"
            style={{
              background:
                getCategoryColor(
                  item.name,
                  index
                ),
            }}
          />

          <strong>
            {item.name}
          </strong>
        </div>

        <strong className="expense-tooltip-amount">
          ₹
          {item.value.toLocaleString(
            "en-IN"
          )}
        </strong>

        <span className="expense-tooltip-percent">
          {percentage.toFixed(1)}%
          {" "}of total spending
        </span>
      </div>
    );
  }

  /* =======================================================
     CHART
  ======================================================= */

  return (
    <div className="expense-pie-wrapper">

      {/* ===================================================
          DONUT CHART
      =================================================== */}

      <div className="expense-pie-chart-area">

        <div className="expense-chart-glow"></div>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={82}
              outerRadius={125}
              paddingAngle={3}
              cornerRadius={6}
              stroke="#ffffff"
              strokeWidth={3}
              startAngle={90}
              endAngle={-270}
              labelLine={false}
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map(
                (entry, index) => (
                  <Cell
                    key={`expense-cell-${entry.name}-${index}`}
                    fill={getCategoryColor(
                      entry.name,
                      index
                    )}
                  />
                )
              )}
            </Pie>

            {/* =================================================
                TOOLTIP ONLY
                NO CENTER TOTAL
                NO LEGEND
            ================================================= */}

            <Tooltip
              content={
                <CustomTooltip />
              }
              cursor={false}
            />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default ExpensePieChart;