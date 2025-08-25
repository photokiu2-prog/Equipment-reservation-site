import React, { useState, useEffect } from "react";
import "./LoginForm.css";

interface LoginFormProps {
  onLogin: (success: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  // 로그인 시도 횟수 초기화 (1시간마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setLoginAttempts(0);
    }, 60 * 60 * 1000); // 1시간

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      const now = new Date();
      if (lockoutTime && now < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime.getTime() - now.getTime()) / 1000);
        setError(`계정이 잠겼습니다. ${remainingTime}초 후에 다시 시도해주세요.`);
        return;
      } else {
        setIsLocked(false);
        setLoginAttempts(0);
        setLockoutTime(null);
      }
    }
    
    // API를 통한 로그인 인증
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onLogin(true);
        setError("");
        setLoginAttempts(0);
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsLocked(true);
          const lockoutEnd = new Date(Date.now() + 5 * 60 * 1000); // 5분 잠금
          setLockoutTime(lockoutEnd);
          setError("로그인 시도가 너무 많습니다. 5분 후에 다시 시도해주세요.");
        } else {
          setError(data.error || `아이디 또는 비밀번호가 올바르지 않습니다. (${newAttempts}/5)`);
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>관리자 로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
