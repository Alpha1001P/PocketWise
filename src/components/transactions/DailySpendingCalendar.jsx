import React from "react";
import "../styles/reports.css";

function DailySpendingCalendar({
  transactions,
  selectedDate,
  setSelectedDate
}) {


  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();


  const days =
    new Date(year, month + 1, 0).getDate();


  const firstDay =
    new Date(year, month, 1).getDay();



  const getAmount = (day) => {

    const selected =
      new Date(
        year,
        month,
        day
      );


    return transactions
      .filter((t) => {

        if (!t.date) return false;


        const transactionDate =
          new Date(t.date);


        return (
          transactionDate.getDate() === selected.getDate() &&
          transactionDate.getMonth() === selected.getMonth() &&
          transactionDate.getFullYear() === selected.getFullYear() &&
          t.type === "Expense"
        );

      })
      .reduce(
        (sum, t) =>
          sum + Number(t.amount),
        0
      );

  };



  return (

    <div className="calendar-card">


      <h2>
        📅 Daily Spending Calendar
      </h2>



      <div className="calendar-grid">


        {
          Array(firstDay)
            .fill("")
            .map((_, i) => (

              <div key={"empty" + i}></div>

            ))
        }




        {
          Array(days)
            .fill("")
            .map((_, i) => {


              const day = i + 1;

              const amount =
                getAmount(day);



              return (

                <div

                  key={day}

                  className={
                    amount === 0
                      ? "calendar-day"
                      :
                    amount > 1000
                      ? "calendar-day high"
                      :
                    "calendar-day medium"
                  }


                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        year,
                        month,
                        day
                      )
                    )
                  }

                >


                  <strong>
                    {day}
                  </strong>


                  {
                    amount > 0 &&

                    <span>
                      ₹{amount}
                    </span>

                  }


                </div>

              );


            })

        }


      </div>


    </div>


  );


}


export default DailySpendingCalendar;