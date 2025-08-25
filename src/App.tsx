import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import ReservationFormComponent from "./components/ReservationForm";
import AdminPage from "./components/AdminPage";
import LoginForm from "./components/LoginForm";
import { Reservation, ReservationForm } from "./types";
import { generateSecureId, detectDevTools } from "./utils";
import "./App.css";

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);


  // API에서 데이터 로드
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        console.log("🔄 API에서 데이터 로드 시도...");
        
        const response = await fetch('/api/reservations');
        if (response.ok) {
          const data = await response.json();
          console.log("📋 API에서 받은 예약 데이터:", data);
          console.log("📊 로드된 예약 수:", data.length);
          setReservations(data);
        } else {
          console.error("❌ API 응답 오류:", response.status);
          setReservations([]);
        }
      } catch (error) {
        console.error("❌ API 요청 실패:", error);
        setReservations([]);
      }
    };

    fetchReservations();
    
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
  }, []);

  // 개발자 도구 탐지 및 차단
  useEffect(() => {
    const checkDevTools = () => {
      if (detectDevTools() || detectDevToolsAdvanced()) {
        alert("⚠️ 보안 경고: 개발자 도구 사용이 감지되었습니다. 보안을 위해 페이지를 새로고침합니다.");
        window.location.reload();
      }
    };

    // 주기적으로 개발자 도구 확인 (1초마다)
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

    // 우클릭 및 컨텍스트 메뉴 방지
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 텍스트 선택 방지
    const preventSelect = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 드래그 방지
    const preventDrag = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 개발자 도구 감지 강화
    const detectDevToolsAdvanced = () => {
      // 화면 크기 차이로 감지
      if (window.outerHeight - window.innerHeight > 160 || 
          window.outerWidth - window.innerWidth > 160) {
        return true;
      }
      
      // 콘솔 로그 감지
      const start = performance.now();
      console.log('%c', 'color: transparent');
      const end = performance.now();
      if (end - start > 100) {
        return true;
      }
      
      return false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('dragstart', preventDrag);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('dragstart', preventDrag);
    };
  }, []);



  // 데이터 변경 시 API에서 다시 로드 (실시간 동기화)
  useEffect(() => {
    if (reservations.length > 0) {
      console.log("💾 예약 데이터 변경 감지 - API 동기화 필요");
    }
  }, [reservations]);

  const handleSubmit = async (form: ReservationForm) => {
    try {
      console.log("🎯 새 예약 추가 시도:", form);
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        const newReservation = await response.json();
        console.log("✅ API에서 받은 새 예약:", newReservation);
        
        // API에서 최신 데이터 다시 로드
        const refreshResponse = await fetch('/api/reservations');
        if (refreshResponse.ok) {
          const updatedData = await refreshResponse.json();
          setReservations(updatedData);
          console.log("🔄 예약 목록 새로고침 완료:", updatedData.length);
        }
        
        alert("신청이 완료되었습니다!");
      } else {
        console.error("❌ 예약 추가 실패:", response.status);
        alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("❌ 예약 추가 중 오류:", error);
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("🗑️ 삭제 시도 - ID:", id);
      
      const response = await fetch(`/api/reservations?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("✅ API에서 삭제 완료:", result);
        
        // API에서 최신 데이터 다시 로드
        const refreshResponse = await fetch('/api/reservations');
        if (refreshResponse.ok) {
          const updatedData = await refreshResponse.json();
          setReservations(updatedData);
          console.log("🔄 삭제 후 예약 목록 새로고침 완료:", updatedData.length);
        }
      } else {
        console.error("❌ 삭제 실패:", response.status);
        alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("❌ 삭제 중 오류:", error);
      alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
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
