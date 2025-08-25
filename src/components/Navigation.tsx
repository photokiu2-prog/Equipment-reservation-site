import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

interface NavigationProps {
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdminLoggedIn, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === "/" ? "active" : ""}
          >
            사용신청
          </Link>
          <Link 
            to="/admin" 
            className={location.pathname === "/admin" ? "active" : ""}
          >
            {isAdminLoggedIn ? "관리자" : "관리자"}
          </Link>
          {isAdminLoggedIn && (
            <button onClick={onLogout} className="logout-btn">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
