import { useMemo } from "react";

function parseDate(value) {
  if (!value) return null;

  const text = String(value);

  // Correctly handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function SpendingTrendChart({
  transactions = [],
  trendView = "Month",
}) {
  const trendData = useMemo(() => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const expenses = transactions.filter((item) => {
      return (
        item &&
        String(item.type).toLowerCase() === "expense" &&
        Number(item.amount) > 0 &&
        item.date
      );
    });

    /* =========================
       WEEK
    ========================= */

    if (trendView === "Week") {
      const names = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ];

      const data = names.map((name) => ({
        name,
        amount: 0,
      }));

      const today = new Date(
        currentYear,
        currentMonth,
        now.getDate()
      );

      const currentDay = today.getDay();

      const mondayOffset =
        currentDay === 0 ? -6 : 1 - currentDay;

      const monday = new Date(
        currentYear,
        currentMonth,
        now.getDate() + mondayOffset
      );

      expenses.forEach((transaction) => {
        const date = parseDate(transaction.date);

        if (!date) return;

        const transactionDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        const difference = Math.round(
          (transactionDate - monday) /
            (1000 * 60 * 60 * 24)
        );

        if (difference >= 0 && difference <= 6) {
          data[difference].amount += Number(
            transaction.amount
          );
        }
      });

      return data;
    }

    /* =========================
       MONTH
    ========================= */

    if (trendView === "Month") {
      const daysInMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
      ).getDate();

      const data = Array.from(
        { length: daysInMonth },
        (_, index) => ({
          name: String(index + 1),
          amount: 0,
        })
      );

      expenses.forEach((transaction) => {
        const date = parseDate(transaction.date);

        if (!date) return;

        if (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth
        ) {
          const day = date.getDate();

          data[day - 1].amount += Number(
            transaction.amount
          );
        }
      });

      return data;
    }

    /* =========================
       YEAR
    ========================= */

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = months.map((name) => ({
      name,
      amount: 0,
    }));

    expenses.forEach((transaction) => {
      const date = parseDate(transaction.date);

      if (!date) return;

      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].amount += Number(
          transaction.amount
        );
      }
    });

    return data;
  }, [transactions, trendView]);

  const total = trendData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  /* =========================
     NO DATA
  ========================= */

  if (total === 0) {
    return (
      <div className="spending-trend-empty">
        <div className="spending-trend-empty-icon">
          📊
        </div>

        <strong>No expenses for this period</strong>

        <span>
          Add an expense transaction to see your
          spending trend.
        </span>
      </div>
    );
  }

  /* =========================
     CHART SETTINGS
  ========================= */

  const width = 1000;
  const height = 300;

  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const maxAmount = Math.max(
    ...trendData.map((item) =>
      Number(item.amount || 0)
    ),
    1
  );

  const points = trendData.map((item, index) => {
    const x =
      paddingLeft +
      (index /
        Math.max(trendData.length - 1, 1)) *
        chartWidth;

    const y =
      paddingTop +
      chartHeight -
      (Number(item.amount || 0) / maxAmount) *
        chartHeight;

    return {
      x,
      y,
      amount: Number(item.amount || 0),
      name: item.name,
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${paddingLeft},${paddingTop + chartHeight}`,
    ...points.map(
      (point) => `${point.x},${point.y}`
    ),
    `${paddingLeft + chartWidth},${
      paddingTop + chartHeight
    }`,
  ].join(" ");

  /* =========================
     Y AXIS
  ========================= */

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => {
      const value = maxAmount * ratio;

      const y =
        paddingTop +
        chartHeight -
        ratio * chartHeight;

      return {
        value,
        y,
      };
    }
  );

  /* =========================
     X LABEL CONTROL
  ========================= */

  let labelStep = 1;

  if (trendView === "Month") {
    labelStep = 3;
  }

  if (trendView === "Year") {
    labelStep = 1;
  }

  return (
    <div className="spending-trend-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="spending-trend-svg"
      >
        {/* Grid */}

        {yLabels.map((item, index) => (
          <g key={`grid-${index}`}>
            <line
              x1={paddingLeft}
              y1={item.y}
              x2={paddingLeft + chartWidth}
              y2={item.y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            <text
              x={paddingLeft - 10}
              y={item.y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#64748b"
            >
              ₹
              {Math.round(item.value).toLocaleString(
                "en-IN"
              )}
            </text>
          </g>
        ))}

        {/* Area */}

        <polygon
          points={areaPoints}
          fill="#4f46e5"
          fillOpacity="0.10"
        />

        {/* Main line */}

        <polyline
          points={linePoints}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}

        {points.map((point, index) => {
          if (point.amount === 0) return null;

          return (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#ffffff"
              stroke="#4f46e5"
              strokeWidth="3"
            />
          );
        })}

        {/* X Axis labels */}

        {points.map((point, index) => {
          if (index % labelStep !== 0) {
            return null;
          }

          return (
            <text
              key={`label-${index}`}
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {point.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default SpendingTrendChart;