import { useState } from "react";

function AccountCard({
  account,
  transactions,
  onEdit,
  onDelete
}) {

  const [showMenu, setShowMenu] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );

  const selectedYear = new Date().getFullYear();


  const balance = transactions.reduce((total, transaction) => {

    if (transaction.account !== account.name) return total;

    return transaction.type === "Income"
      ? total + Number(transaction.amount)
      : total - Number(transaction.amount);

  }, 0);



  const monthlyChange = transactions.reduce((total, transaction) => {

    const date = new Date(transaction.date);


    if (
      transaction.account !== account.name ||
      date.getMonth() !== selectedMonth ||
      date.getFullYear() !== selectedYear
    ) {
      return total;
    }


    return transaction.type === "Income"
      ? total + Number(transaction.amount)
      : total - Number(transaction.amount);


  }, 0);



  const isPositive = monthlyChange >= 0;


  return (

    <div className="account-dashboard-card">


      {/* Premium accent */}
      <div className="account-accent"></div>



      <div className="account-card-content">


        {/* Header */}

        <div className="account-card-top">


          <div className="account-info">


            <div className="account-icon">

              {account.icon}

            </div>


            <div>

              <h3>
                {account.name}
              </h3>


              <span className="account-type">
                {account.type || "Account"}
              </span>

            </div>


          </div>



          <div className="account-menu-wrapper">


            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>



            {showMenu && (

              <div className="account-menu">


                <button
                  onClick={() => {
                    onEdit(account);
                    setShowMenu(false);
                  }}
                >
                  ✏️ Edit Account
                </button>



                <button
                  className="delete-btn"
                  onClick={() => {
                    onDelete(account.id);
                    setShowMenu(false);
                  }}
                >
                  🗑 Delete Account
                </button>


              </div>

            )}


          </div>


        </div>





        {/* Balance */}

        <div className="account-balance-section">


          <p>
            Current Balance
          </p>


          <h2>
            ₹{balance.toLocaleString("en-IN")}
          </h2>


          <span className="updated-status">
            ● Updated just now
          </span>


        </div>





        {/* Monthly */}

        <div className="account-change">


          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(Number(e.target.value))
            }
          >

            {
              [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"

              ].map((month,index)=>(

                <option
                  key={index}
                  value={index}
                >
                  {month}
                </option>

              ))
            }

          </select>




          <span
            className={
              isPositive
                ? "positive-change"
                : "negative-change"
            }
          >

            {isPositive ? "↑" : "↓"}
            ₹{Math.abs(monthlyChange).toLocaleString("en-IN")}

          </span>


        </div>


      </div>


    </div>

  );

}


export default AccountCard;