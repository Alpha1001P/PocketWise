import { useState } from "react";


function TransactionList({
  transactions,
  deleteTransaction,
  editTransaction,
}) {


  const [openMenu, setOpenMenu] = useState(null);



  if (transactions.length === 0) {

    return (

      <div className="transactions">

        <h2>
          Recent Transactions
        </h2>


        <div className="empty-transactions">

          <h3>
            No Transactions Yet
          </h3>

          <p>
            Add your first transaction to get started.
          </p>

        </div>

      </div>

    );

  }





  return (

    <div className="transactions">


      <h2>
        Recent Transactions
      </h2>



      <div className="transaction-cards">


        {
          transactions.map((item)=>(


            <div
              className="transaction-card"
              key={item.id}
            >



              <div className="transaction-left">


                <div className="transaction-icon">

                  {
                    item.type === "Income"
                    ? "🟢"
                    : "🔴"
                  }

                </div>




                <div className="transaction-info">


                  <h3>
                    {item.title}
                  </h3>


                  <p>
                    {item.account}
                    {" • "}
                    {item.category}
                  </p>


                  <small>

                    {
                      new Date(item.date)
                      .toLocaleString(
                        "en-IN",
                        {
                          day:"numeric",
                          month:"short",
                          year:"numeric"
                        }
                      )
                    }

                  </small>


                </div>


              </div>







              <div className="transaction-right">


                <div className="amount-menu">


                  <h3
                    className={
                      item.type === "Income"
                      ? "income-text"
                      : "expense-text"
                    }
                  >

                    {
                      item.type === "Income"
                      ? `₹${item.amount}`
                      : `-₹${item.amount}`
                    }

                  </h3>




                  <div className="menu-wrapper">


                    <button
                      type="button"
                      className="menu-btn"

                      onClick={()=>{

                        setOpenMenu(
                          openMenu === item.id
                          ? null
                          : item.id
                        );

                      }}

                    >
                      ⋮
                    </button>





                    {
                      openMenu === item.id && (

                        <div className="transaction-menu">


                          <button
                            type="button"

                            onClick={()=>{

                              editTransaction(item);
                              setOpenMenu(null);

                            }}
                          >

                            ✏ Edit

                          </button>




                          <button
                            type="button"

                            className="delete-option"

                            onClick={()=>{

                              deleteTransaction(item.id);
                              setOpenMenu(null);

                            }}

                          >

                            🗑 Delete

                          </button>


                        </div>

                      )
                    }


                  </div>


                </div>


              </div>



            </div>


          ))
        }


      </div>


    </div>

  );


}


export default TransactionList;