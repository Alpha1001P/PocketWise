import { useState, useEffect, useRef } from "react";

function SearchBar({
  transactions,
  search,
  setSearch,
}) {

  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef();


  // Close suggestions when clicking outside
  useEffect(() => {

    function handleClickOutside(event) {

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);



  const suggestions = transactions.filter((item) =>
    item.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  function highlightText(text) {

    if (!search) return text;


    const parts = text.split(
      new RegExp(`(${search})`, "gi")
    );


    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase()
        ?
        <span key={index} className="highlight">
          {part}
        </span>
        :
        part
    );

  }



  return (

    <div
      className="search-container"
      ref={searchRef}
    >

      <div className="search-input-wrapper">

  <span className="search-icon">
    🔍
  </span>

  <input
    type="text"
    placeholder="Search transaction..."
    value={search}

    onFocus={() =>
      setShowSuggestions(true)
    }

    onKeyDown={(e)=>{
      if(e.key === "Enter"){
        setShowSuggestions(false);
      }
    }}

    onChange={(e)=>{
      setSearch(e.target.value);
      setShowSuggestions(true);
    }}

  />


  {search && (
    <button
      className="clear-search"
      onClick={()=>{
        setSearch("");
      }}
    >
      ✕
    </button>
  )}

</div>



      {
      showSuggestions &&
      search &&
      (

      <div className="suggestions">


      {
      suggestions.length > 0 ?

      (

      suggestions.map((item)=>(

      <div

      className="suggestion-item"

      key={item.id}

      onClick={()=>{

        setSearch(item.title);

        setShowSuggestions(false);

      }}

      >


      <h4>

      {highlightText(item.title)}

      </h4>


      <p>

      {item.category}

      {" • "}

      ₹{item.amount}

      </p>


      <small>

      {item.date}

      </small>


      </div>

      ))

      )

      :

      (

      <p>
        No transactions found
      </p>

      )

      }


      </div>

      )

      }


    </div>

  );

}


export default SearchBar;