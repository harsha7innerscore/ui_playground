import { Link } from "@remix-run/react";
import { useState } from "react";

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#f8f9fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
            CoSchool
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            '@media (max-width: 768px)': {
              display: "block"
            }
          }}
        >
          Menu
        </button>

        {/* Desktop navigation */}
        <nav style={{
          '@media (max-width: 768px)': {
            display: "none"
          }
        }}>
          <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ textDecoration: "none", color: "#333" }}>
                About
              </Link>
            </li>
            <li>
              <Link to="/dashboard" style={{ textDecoration: "none", color: "#333" }}>
                Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div style={{
            position: "absolute",
            top: "4rem",
            left: 0,
            right: 0,
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 10,
            '@media (min-width: 769px)': {
              display: "none"
            }
          }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <Link
                  to="/"
                  style={{ display: "block", padding: "0.5rem", textDecoration: "none", color: "#333" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <Link
                  to="/about"
                  style={{ display: "block", padding: "0.5rem", textDecoration: "none", color: "#333" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <Link
                  to="/dashboard"
                  style={{ display: "block", padding: "0.5rem", textDecoration: "none", color: "#333" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: "1 1 auto" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ padding: "1.5rem", backgroundColor: "#f8f9fa", textAlign: "center", borderTop: "1px solid #e9ecef" }}>
        <p>&copy; {new Date().getFullYear()} CoSchool. All rights reserved.</p>
      </footer>
    </div>
  );
}