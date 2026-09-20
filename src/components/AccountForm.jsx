import { useState } from "react";

function AccountForm({ addAccount }) {

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");


  function handleSubmit(e){

    e.preventDefault();

    if(!name || !balance) return;


    const account = {

      id: Date.now(),

      name,

      balance: Number(balance),

    };


    addAccount(account);


    setName("");

    setBalance("");

  }


  return (

    <form
      className="account-form"
      onSubmit={handleSubmit}
    >

      <h2>
        Add New Account
      </h2>


      <input

        type="text"

        placeholder="Account Name (SBI, Cash, Wallet)"

        value={name}

        onChange={(e)=>
          setName(e.target.value)
        }

      />


      <input

        type="number"

        placeholder="Starting Balance"

        value={balance}

        onChange={(e)=>
          setBalance(e.target.value)
        }

      />


      <button type="submit">

        Add Account

      </button>


    </form>

  );

}


export default AccountForm;