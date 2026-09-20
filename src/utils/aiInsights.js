import { getBudget } from "./budget";


export function generateInsights(transactions) {

  const insights = [];

  const budget = getBudget();



  const expenses =
    transactions.filter(
      (item) =>
        item.category === "Expense"
    );


  const income =
    transactions
      .filter(
        (item) =>
          item.category === "Income"
      )
      .reduce(
        (sum, item) =>
          sum + item.amount,
        0
      );



  const totalExpense =
    expenses.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );



  // =========================
  // SAVINGS ANALYSIS
  // =========================

  if (income > 0) {

    const savings =
      income - totalExpense;


    const savingRate =
      Math.round(
        (savings / income) * 100
      );


    if (savingRate >= 30) {

      insights.push(
        `💰 Excellent! You saved ${savingRate}% of your income this month.`
      );

    }

    else if (savingRate >= 10) {

      insights.push(
        `👍 You saved ${savingRate}% of your income. Try increasing it gradually.`
      );

    }

    else {

      insights.push(
        `⚠️ Your savings rate is low. Review unnecessary expenses.`
      );

    }

  }




  // =========================
  // CATEGORY SPENDING
  // =========================


  const categorySpent = {};


  expenses.forEach((item)=>{

    const category =
      item.subCategory || "Other";


    categorySpent[category] =
      (categorySpent[category] || 0)
      +
      item.amount;

  });



  const categories =
    Object.entries(categorySpent);



  if(categories.length > 0){


    categories.sort(
      (a,b)=>b[1]-a[1]
    );


    const highest =
      categories[0];


    const percentage =
      totalExpense > 0
      ?
      Math.round(
        (highest[1] / totalExpense)
        *
        100
      )
      :
      0;



    insights.push(

      `📊 ${highest[0]} is your highest spending category (${percentage}% of total expenses).`

    );

  }





  // =========================
  // BUDGET ALERT SYSTEM
  // =========================


  if(budget.categories){


    Object.keys(
      budget.categories
    )
    .forEach((category)=>{


      const limit =
        Number(
          budget.categories[category]
        );


      const spent =
        categorySpent[category]
        ||
        0;



      if(limit > 0){


        const percentage =
          Math.round(
            (spent / limit)
            *
            100
          );



        // Exceeded

        if(spent > limit){

          insights.push(

            `🚨 ${category} budget exceeded by ₹${spent - limit}.`

          );

        }


        // Near limit

        else if(
          percentage >= 90
        ){

          insights.push(

            `🔔 ${category} spending is at ${percentage}% of your budget. Only ₹${limit - spent} remaining.`

          );

        }


        // Good control

        else if(
          percentage <= 50 &&
          spent > 0
        ){

          insights.push(

            `✅ Good control on ${category} spending. You have used only ${percentage}% of your budget.`

          );

        }


      }


    });


  }





  // =========================
  // TRANSACTION ACTIVITY
  // =========================


  if(expenses.length >= 10){

    insights.push(

      `📈 You tracked ${expenses.length} expenses. Regular tracking helps maintain financial discipline.`

    );

  }



  if(expenses.length === 0){

    insights.push(

      "📝 Add expenses to receive personalized financial insights."

    );

  }



  return insights;

}