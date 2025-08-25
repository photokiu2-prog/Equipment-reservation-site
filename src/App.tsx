import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import ReservationFormComponent from "./components/ReservationForm";
import AdminPage from "./components/AdminPage";
import LoginForm from "./components/LoginForm";
import { Reservation, ReservationForm } from "./types";
import { generateSecureId, detectDevTools, encryptData, decryptData, generateSecurityKey } from "./utils";
import "./App.css";

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [securityKey] = useState(() => generateSecurityKey());

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    try {
      const savedReservations = localStorage.getItem("reservations");
      if (savedReservations) {
        const decrypted = decryptData(savedReservations, securityKey);
        if (decrypted) {
          setReservations(JSON.parse(decrypted));
        }
      }
      
      // 관리자 로그인 상태 확인 (세션 만료 체크)
      const adminStatus = localStorage.getItem("adminLoggedIn");
      const loginTime = localStorage.getItem("adminLoginTime");
      
      if (adminStatus === "true" && loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const sessionDuration = 2 * 60 * 60 * 1000; // 2시간
        
        if (currentTime - loginTimestamp < sessionDuration) {
          setIsAdminLoggedIn(true);
        } else {
          // 세션 만료
          setIsAdminLoggedIn(false);
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("adminLoginTime");
        }
      }
    } catch (error) {
      console.error("데이터 로드 중 오류 발생");
    }
  }, [securityKey]);

  // 개발자 도구 탐지 및 경고
  useEffect(() => {
    const checkDevTools = () => {
      if (detectDevTools()) {
        alert("⚠️ 보안 경고: 개발자 도구 사용이 감지되었습니다. 보안을 위해 페이지를 새로고침합니다.");
        window.location.reload();
      }
    };

    // 주기적으로 개발자 도구 확인
    const interval = setInterval(checkDevTools, 1000);
    
    // 키보드 이벤트로 F12, Ctrl+Shift+I 등 감지
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')) {
        e.preventDefault();
        alert("⚠️ 보안 경고: 개발자 도구 단축키 사용이 감지되었습니다.");
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 우클릭 및 컨텍스트 메뉴 방지
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventSelect = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('dragstart', preventSelect);
    
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('dragstart', preventSelect);
    };
  }, []);

  // 데이터가 변경될 때마다 로컬 스토리지에 저장 (암호화)
  useEffect(() => {
    try {
      const encrypted = encryptData(JSON.stringify(reservations), securityKey);
      localStorage.setItem("reservations", encrypted);
    } catch (error) {
      console.error("데이터 저장 중 오류 발생");
    }
  }, [reservations, securityKey]);

  const handleSubmit = (form: ReservationForm) => {
    const newReservation: Reservation = {
      ...form,
      id: generateSecureId(),
      createdAt: new Date().toLocaleString("ko-KR"),
    };
    
    setReservations(prev => [...prev, newReservation]);
    alert("신청이 완료되었습니다!");
  };

  const handleDelete = (id: string) => {
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
  };

  const handleAdminLogin = (success: boolean) => {
    setIsAdminLoggedIn(success);
    if (success) {
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminLoginTime", Date.now().toString());
    } else {
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminLoginTime");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminLoginTime");
  };

  return (
    <Router>
      <div className="App">
        <Navigation onLogout={handleAdminLogout} isAdminLoggedIn={isAdminLoggedIn} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<ReservationFormComponent onSubmit={handleSubmit} />} 
            />
            <Route 
              path="/admin" 
              element={
                isAdminLoggedIn ? (
                  <AdminPage 
                    reservations={reservations} 
                    onDelete={handleDelete} 
                    onLogout={handleAdminLogout}
                  />
                ) : (
                  <div className="admin-access-denied">
                    <h2>🔒 관리자 페이지 접근 제한</h2>
                    <p>관리자 권한이 필요합니다.</p>
                    <LoginForm onLogin={handleAdminLogin} />
                  </div>
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
