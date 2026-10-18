import { getBudget } from "../../utils/budget";


function BudgetStatus({
  transactions,
}) {


  const budget = getBudget();


  const expenses =
    transactions.filter(
      (item) =>
        item.category === "Expense"
    );


  const categorySpent = {};


  expenses.forEach((item)=>{

    const category =
      item.subCategory || "Other";


    categorySpent[category] =
      (categorySpent[category] || 0)
      +
      item.amount;

  });



  function getStatus(percent){

    if(percent < 70){

      return {
        className:"safe",
        text:"Safe"
      };

    }


    if(percent < 90){

      return {
        className:"warning",
        text:"Be careful"
      };

    }


    return {
      className:"danger",
      text:"Limit reached"
    };

  }



  return (

    <div className="budget-status-card">


      <h2>
        🎯 Category Budget Status
      </h2>



      {
        Object.keys(
          budget.categories || {}
        )
        .map((category)=>(


          <div
            className="category-budget"
            key={category}
          >


            <div className="budget-title">

              <span>
                {category}
              </span>


              <span>

                ₹{categorySpent[category] || 0}

                /

                ₹{budget.categories[category]}

              </span>


            </div>




            <div className="budget-bar">


              <div

                className={
                  `budget-fill ${
                    getStatus(
                      budget.categories[category]
                      ?
                      (
                        (
                          categorySpent[category] || 0
                        )
                        /
                        budget.categories[category]
                      )
                      *
                      100
                      :
                      0
                    )
                    .className
                  }`
                }


                style={{

                  width:

                    `${
                      Math.min(

                        (
                          (
                            categorySpent[category] || 0
                          )
                          /
                          budget.categories[category]
                        )
                        *
                        100,

                        100

                      )

                    }%`

                }}

              />

            </div>




            <p
              className={
                getStatus(
                  budget.categories[category]
                  ?
                  (
                    (
                      categorySpent[category] || 0
                    )
                    /
                    budget.categories[category]
                  )
                  *
                  100
                  :
                  0
                )
                .className
              }
            >

              {
                getStatus(
                  budget.categories[category]
                  ?
                  (
                    (
                      categorySpent[category] || 0
                    )
                    /
                    budget.categories[category]
                  )
                  *
                  100
                  :
                  0
                )
                .text
              }

            </p>



          </div>


        ))

      }


    </div>

  );

}


export default BudgetStatus;