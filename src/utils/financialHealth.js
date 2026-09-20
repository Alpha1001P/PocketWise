export function calculateFinancialHealth(
  transactions,
  monthlyBudget = 0
) {
  const income = transactions
    .filter((t) => t.category === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.category === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - expense;

  let score = 0;

  // -----------------------------
  // Savings Rate (25)
  // -----------------------------

  const savingsRate =
    income > 0 ? (savings / income) * 100 : 0;

  if (savingsRate >= 30) score += 25;
  else if (savingsRate >= 20) score += 20;
  else if (savingsRate >= 10) score += 15;
  else if (savingsRate >= 0) score += 8;

  // -----------------------------
  // Income vs Expense (20)
  // -----------------------------

  if (income > expense) score += 20;
  else if (income === expense) score += 10;

  // -----------------------------
  // Budget (15)
  // -----------------------------

  if (monthlyBudget > 0) {
    if (expense <= monthlyBudget)
      score += 15;
    else score += 5;
  } else {
    score += 10;
  }

  // -----------------------------
  // Transaction Activity (10)
  // -----------------------------

  if (transactions.length >= 30)
    score += 10;
  else if (transactions.length >= 15)
    score += 7;
  else if (transactions.length >= 5)
    score += 5;

  // -----------------------------
  // Spending Control (20)
  // -----------------------------

  const expenseRatio =
    income > 0 ? (expense / income) * 100 : 100;

  if (expenseRatio <= 60)
    score += 20;
  else if (expenseRatio <= 80)
    score += 15;
  else if (expenseRatio <= 100)
    score += 10;

  // -----------------------------
  // Category Diversity (10)
  // -----------------------------

  const categories = new Set(
    transactions
      .filter((t) => t.category === "Expense")
      .map((t) => t.subCategory || t.title)
  );

  if (categories.size >= 5)
    score += 10;
  else if (categories.size >= 3)
    score += 7;
  else score += 5;

  score = Math.min(100, score);

  let status = "";
  let color = "";
  let message = "";

  if (score >= 90) {
    status = "Excellent";
    color = "#2e7d32";
    message =
      "Outstanding financial discipline. Keep it up!";
  } else if (score >= 75) {
    status = "Good";
    color = "#43a047";
    message =
      "Your finances are healthy. Small improvements can make them even better.";
  } else if (score >= 60) {
    status = "Fair";
    color = "#f9a825";
    message =
      "You're doing okay, but there's room to improve your savings.";
  } else if (score >= 40) {
    status = "Needs Improvement";
    color = "#ef6c00";
    message =
      "Your spending is getting high. Review your expenses.";
  } else {
    status = "Poor";
    color = "#d32f2f";
    message =
      "Consider reducing expenses and increasing savings.";
  }

  return {
    score,
    status,
    color,
    income,
    expense,
    savings,
    message,
  };
}