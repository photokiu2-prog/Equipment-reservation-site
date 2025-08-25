import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

interface NavigationProps {
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isAdminLoggedIn, onLogout }) => {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

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
          
          {/* 관리자 페이지에서만 관리자 관련 버튼들 표시 */}
          {isAdminPage && (
            <>
              {isAdminLoggedIn && (
                <button onClick={onLogout} className="logout-btn">
                  로그아웃
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
