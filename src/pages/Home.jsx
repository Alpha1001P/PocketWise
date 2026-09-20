function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <h2>PocketWise</h2>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Dashboard</a>
          <a href="#">About</a>
          <button>Login</button>
        </div>
      </nav>

      <section className="hero">
        <h1>Manage Your Money Smarter</h1>

        <p>
          Track expenses, monitor income, set budgets, and achieve your
          financial goals with PocketWise.
        </p>

        <button className="start-btn">
          Get Started
        </button>
      </section>
    </div>
  );
}

export default Home;