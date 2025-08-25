import { format, addDays, startOfWeek, isBefore, parseISO, differenceInDays } from "date-fns";

export const getDeadlineDate = (targetDate: Date): Date => {
  const targetDay = targetDate.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  
  if (targetDay >= 1 && targetDay <= 4) { // 월~목
    // 전주 금요일까지
    const lastWeekFriday = addDays(startOfWeek(targetDate, { weekStartsOn: 1 }), -3);
    return lastWeekFriday;
  } else { // 금~일
    // 사용주 목요일까지
    const thisWeekThursday = addDays(startOfWeek(targetDate, { weekStartsOn: 1 }), 3);
    return thisWeekThursday;
  }
};

export const isWithinDeadline = (targetDate: Date): boolean => {
  const deadline = getDeadlineDate(targetDate);
  const today = new Date();
  return isBefore(today, deadline) || format(today, "yyyy-MM-dd") === format(deadline, "yyyy-MM-dd");
};

export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  // 00:00부터 23:00까지 1시간 단위로 생성
  for (let hour = 0; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

export const generateEndTimeSlots = (startTime: string, startDate: string, endDate: string): string[] => {
  const slots: string[] = [];
  const [startHour] = startTime.split(":");
  const startHourNum = parseInt(startHour);
  
  // 시작일과 종료일이 같은 경우 (하루만 사용)
  if (startDate === endDate) {
    // 시작시간 이후의 시간만 생성
    for (let hour = startHourNum + 1; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
  } else {
    // 2일 이상 사용하는 경우, 다음날 00:00부터 23:00까지 모두 선택 가능
    for (let hour = 0; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
  }
  
  return slots;
};

export const formatTime = (time: string): string => {
  const [hour] = time.split(":");
  return `${hour}:00`;
};

export const isDateRangeValid = (startDate: string, endDate: string): boolean => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const today = new Date();
  
  // 시작일이 오늘 이후여야 함
  if (start < today) return false;
  
  // 종료일이 시작일 이후여야 함
  if (end < start) return false;
  
  // 최대 7일까지만 신청 가능
  const days = differenceInDays(end, start) + 1;
  if (days > 7) return false;
  
  return true;
};

export const isTimeRangeValid = (startTime: string, endTime: string, startDate: string, endDate: string): boolean => {
  const [startHour] = startTime.split(":");
  const [endHour] = endTime.split(":");
  const startHourNum = parseInt(startHour);
  const endHourNum = parseInt(endHour);
  
  // 시작일과 종료일이 같은 경우에만 시간 제한 적용
  if (startDate === endDate) {
    return endHourNum > startHourNum;
  }
  
  // 2일 이상 사용하는 경우는 시간 제한 없음
  return true;
};

// 보안 유틸리티 함수들
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // HTML 태그 및 스크립트 제거
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateName = (name: string): boolean => {
  const sanitized = sanitizeInput(name);
  // 한글, 영문, 숫자만 허용, 길이 제한
  return /^[가-힣a-zA-Z0-9\s]{1,20}$/.test(sanitized) && sanitized.length >= 1;
};

export const validateStudentId = (studentId: string): boolean => {
  const sanitized = sanitizeInput(studentId);
  // 학번 형식 검증 (숫자 8-10자리)
  return /^\d{8,10}$/.test(sanitized);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const sanitized = sanitizeInput(phone);
  // 전화번호 형식 검증 (010-0000-0000)
  return /^010-\d{4}-\d{4}$/.test(sanitized);
};

export const validateRoomNumber = (room: string): boolean => {
  const allowedRooms = ["202호", "203호", "204호", "205호", "206호", "208호", "209호", "216호"];
  return allowedRooms.includes(room);
};

export const generateSecureId = (): string => {
  // 더 안전한 ID 생성 (타임스탬프 + 랜덤값)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
};

// 개발자 도구 탐지 및 방지
export const detectDevTools = (): boolean => {
  const threshold = 160;
  
  // 개발자 도구가 열려있는지 확인
  if (window.outerHeight - window.innerHeight > threshold || 
      window.outerWidth - window.innerWidth > threshold) {
    return true;
  }
  
  // F12 키 감지
  let devtools = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const devtoolsCheck = () => {
    if ((window as any).devtools && (window as any).devtools.open) {
      devtools = true;
    }
  };
  
  // 개발자 도구 콘솔 감지
  const consoleCheck = () => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      devtools = true;
    }
  };
  
  try {
    consoleCheck();
  } catch (e) {
    // 에러 발생 시 개발자 도구가 열려있을 가능성
  }
  
  return devtools;
};

// 로컬 스토리지 암호화 (간단한 XOR 암호화)
export const encryptData = (data: string, key: string): string => {
  console.log("🔐 암호화 시작 - 원본 데이터:", data);
  console.log("🔐 암호화 시작 - 보안 키:", key);
  console.log("🔐 암호화 시작 - 데이터 타입:", typeof data);
  
  // 빈 배열이나 null 체크
  if (data === "[]" || data === "null" || data === "undefined") {
    console.log("🔐 빈 데이터 감지 - 암호화 건너뛰기");
    return "";
  }
  
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  
  console.log("🔐 XOR 암호화 완료 - 결과 길이:", result.length);
  
  // 유니코드 안전한 Base64 인코딩
  const encoded = btoa(unescape(encodeURIComponent(result)));
  console.log("🔐 Base64 인코딩 완료 - 최종 길이:", encoded.length);
  
  return encoded;
};

export const decryptData = (encryptedData: string, key: string): string => {
  try {
    console.log("🔓 복호화 시작 - 암호화된 데이터:", encryptedData);
    console.log("🔓 복호화 시작 - 보안 키:", key);
    
    // 빈 데이터 체크
    if (!encryptedData || encryptedData === "") {
      console.log("🔓 빈 암호화 데이터 - 빈 문자열 반환");
      return "";
    }
    
    const data = atob(encryptedData); // Base64 디코딩
    console.log("🔓 Base64 디코딩 완료 - 길이:", data.length);
    
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    console.log("🔓 XOR 복호화 완료 - 길이:", result.length);
    
    // 유니코드 안전한 디코딩
    const decoded = decodeURIComponent(escape(result));
    console.log("🔓 유니코드 디코딩 완료 - 최종 길이:", decoded.length);
    console.log("🔓 복호화된 원본 데이터:", decoded);
    
    return decoded;
  } catch (e) {
    console.log("🔓 복호화 중 오류 발생:", e);
    return '';
  }
};

// 보안 키 생성
export const generateSecurityKey = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${navigator.userAgent}`;
};
