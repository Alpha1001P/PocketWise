export function getTransactions() {
  return JSON.parse(
    localStorage.getItem("transactions") || "[]"
  );
}

export function getAccounts() {
  return JSON.parse(
    localStorage.getItem("accounts") || "[]"
  );
}