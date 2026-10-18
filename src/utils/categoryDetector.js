// ============================================================
// POCKETWISE SMART CATEGORY DETECTOR
// ============================================================

// Expense category keywords
const expenseRules = {
  Food: [
    "swiggy",
    "zomato",
    "blinkit",
    "zepto",
    "instamart",
    "dominos",
    "domino",
    "pizza",
    "burger",
    "mcdonald",
    "kfc",
    "subway",
    "restaurant",
    "food",
    "lunch",
    "dinner",
    "breakfast",
    "snacks",
    "snack",
    "tea",
    "coffee",
    "cafe",
    "starbucks",
    "juice",
    "bakery",
  ],

  Travel: [
    "uber",
    "ola",
    "rapido",
    "metro",
    "bus",
    "train",
    "railway",
    "irctc",
    "flight",
    "airport",
    "petrol",
    "diesel",
    "fuel",
    "parking",
    "cab",
    "taxi",
    "travel",
    "hotel",
    "booking",
    "toll",
  ],

  Shopping: [
    "amazon",
    "flipkart",
    "myntra",
    "meesho",
    "ajio",
    "shopping",
    "clothes",
    "shirt",
    "tshirt",
    "t-shirt",
    "jeans",
    "shoes",
    "dress",
    "watch",
    "headphones",
    "earphones",
    "mobile",
    "phone",
    "laptop",
    "electronics",
  ],

  Entertainment: [
    "netflix",
    "prime video",
    "amazon prime",
    "hotstar",
    "disney",
    "spotify",
    "youtube premium",
    "youtube",
    "movie",
    "cinema",
    "pvr",
    "inox",
    "game",
    "gaming",
    "steam",
    "playstation",
    "xbox",
    "entertainment",
  ],

  Bills: [
    "rent",
    "electricity",
    "electric",
    "water bill",
    "gas bill",
    "wifi",
    "internet",
    "broadband",
    "recharge",
    "mobile recharge",
    "phone bill",
    "airtel",
    "jio",
    "vi recharge",
    "vi ",
    "bill",
    "emi",
    "maintenance",
  ],

  Health: [
    "medicine",
    "medicines",
    "doctor",
    "hospital",
    "pharmacy",
    "medical",
    "apollo",
    "diagnostic",
    "pathology",
    "health",
    "clinic",
    "dental",
    "dentist",
    "tablet",
    "medical store",
  ],

  Education: [
    "college",
    "school",
    "university",
    "course",
    "courses",
    "tuition",
    "fee",
    "fees",
    "exam",
    "books",
    "book",
    "notebook",
    "stationery",
    "education",
    "udemy",
    "coursera",
    "nptel",
    "class",
    "coaching",
  ],
};

// Income category keywords
const incomeRules = {
  Salary: [
    "salary",
    "payroll",
    "monthly salary",
    "stipend",
    "wages",
  ],

  Allowance: [
    "allowance",
    "pocket money",
    "pocketmoney",
    "money from parents",
    "parents",
    "family",
  ],

  Freelance: [
    "freelance",
    "freelancing",
    "client payment",
    "client",
    "project payment",
    "upwork",
    "fiverr",
  ],

  Investment: [
    "investment",
    "dividend",
    "mutual fund",
    "mutual funds",
    "stocks",
    "stock",
    "profit",
    "interest",
    "return",
    "returns",
  ],
};

// ------------------------------------------------------------
// Detect category
// ------------------------------------------------------------

export function detectTransactionCategory(text = "", type = "Expense") {
  const normalizedText = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedText) {
    return null;
  }

  const rules =
    type === "Income"
      ? incomeRules
      : expenseRules;

  // Check longer / more specific phrases first
  const matches = [];

  Object.entries(rules).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (normalizedText.includes(keyword)) {
        matches.push({
          category,
          keyword,
          length: keyword.length,
        });
      }
    });
  });

  if (matches.length === 0) {
    return null;
  }

  // Prefer the most specific matching keyword
  matches.sort((a, b) => b.length - a.length);

  return matches[0].category;
}

// ------------------------------------------------------------
// Get icon for category
// ------------------------------------------------------------

export function getCategoryIcon(category) {
  const icons = {
    Food: "🍔",
    Shopping: "🛍️",
    Travel: "✈️",
    Bills: "🧾",
    Health: "🏥",
    Education: "🎓",
    Entertainment: "🎬",

    Salary: "💼",
    Allowance: "💵",
    Freelance: "💻",
    Investment: "📈",

    Other: "🏷️",
  };

  return icons[category] || "🏷️";
}