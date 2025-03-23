import React from "react";
import Home from "./Home";
import './App.css'; 

function App() {
  return (
    <div className="app-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">SafeWayz</h1>
          <p className="hero-subtitle"> Discover the safest walking routes in New York City using Real Time crime reports and community feedback. Stay secure! </p>
        </div>
      </header>

      <main className="main-content">
        <Home />
      </main>

      <footer className="footer">
        <p>Developed by Jhalak | Women Safety Initiative</p>
      </footer>
    </div>
  );
}

export default App;