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
