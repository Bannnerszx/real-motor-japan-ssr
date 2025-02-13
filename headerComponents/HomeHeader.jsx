import { useState } from "react";
import Link from "next/link";

export default function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link href="/" className="logo-container">
          <div className="logo-text">REAL MOTOR JAPAN</div>
          <span className="domain-text">www.realmotor.jp</span>
        </Link>
      </div>

      <button
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
        <div className="nav-links">
          <Link href="/car-stock" className="nav-link">
            Car Stock
          </Link>
          <Link href="/how-to-buy" className="nav-link">
            How to Buy
          </Link>
          <Link href="/about-us" className="nav-link">
            About Us
          </Link>
          <Link href="/local" className="nav-link">
            Local Introduction
          </Link>
          <Link href="/contact" className="nav-link">
            Contact Us
          </Link>
        </div>

        <div className="auth-buttons">
          <Link href="/signup" className="btn btn-signup">
            Sign Up
          </Link>
          <Link href="/login" className="btn btn-login">
            Log In
          </Link>
        </div>
      </div>
    </nav>
  );
}
