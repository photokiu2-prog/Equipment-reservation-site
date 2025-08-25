import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import ReservationFormComponent from "./components/ReservationForm";
import AdminPage from "./components/AdminPage";
import LoginForm from "./components/LoginForm";
import { Reservation, ReservationForm } from "./types";
import { generateSecureId } from "./utils";
import "./App.css";

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);


  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    try {
      console.log("🔄 데이터 로드 시도...");
      
      const savedReservations = localStorage.getItem("reservations");
      if (savedReservations) {
        try {
          const parsed = JSON.parse(savedReservations);
          console.log("📋 파싱된 예약 데이터:", parsed);
          console.log("📊 로드된 예약 수:", parsed.length);
          setReservations(parsed);
        } catch (parseError) {
          console.log("⚠️ JSON 파싱 실패:", parseError);
          console.log("⚠️ 손상된 데이터 정리");
          localStorage.removeItem("reservations");
          setReservations([]);
        }
      } else {
        console.log("ℹ️ 저장된 예약 데이터가 없습니다.");
        setReservations([]);
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
      console.error("데이터 로드 중 오류 발생:", error);
    }
  }, []);

  // 개발자 도구 탐지 및 경고 (디버깅을 위해 일시 비활성화)
  /*
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

    document.addEventListener('keyDown', handleKeyDown);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  */

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

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    try {
      console.log("💾 예약 데이터 저장 시도:", reservations);
      
      if (reservations.length > 0) {
        localStorage.setItem("reservations", JSON.stringify(reservations));
        console.log("✅ 데이터 저장 완료");
        console.log("📁 로컬 스토리지에 저장된 데이터 길이:", JSON.stringify(reservations).length);
      } else {
        console.log("ℹ️ 빈 예약 목록 - 저장 건너뛰기");
        localStorage.removeItem("reservations");
      }
    } catch (error) {
      console.error("❌ 데이터 저장 중 오류 발생:", error);
    }
  }, [reservations]);

  const handleSubmit = (form: ReservationForm) => {
    const newReservation: Reservation = {
      ...form,
      id: generateSecureId(),
      createdAt: new Date().toLocaleString("ko-KR"),
    };
    
    console.log("🎯 새 예약 추가 시도:", newReservation);
    setReservations(prev => {
      const updated = [...prev, newReservation];
      console.log("✅ 예약 목록 업데이트 완료:", updated);
      console.log("📊 총 예약 수:", updated.length);
      return updated;
    });
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
