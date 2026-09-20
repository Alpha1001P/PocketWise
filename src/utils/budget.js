export function saveBudget(budget) {
  localStorage.setItem(
    "budget",
    JSON.stringify(budget)
  );
}


export function getBudget() {

  return (
    JSON.parse(
      localStorage.getItem("budget")
    )
    ||
    {
      monthly: 0,

      categories: {
        Food: 0,
        Travel: 0,
        Shopping: 0,
        Education: 0,
        Entertainment: 0,
        Health: 0,
        Bills: 0,
        Other: 0,
      }
    }
  );

}