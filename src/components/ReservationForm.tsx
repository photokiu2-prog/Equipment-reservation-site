import React, { useState, useEffect } from "react";
import { ReservationForm } from "../types";
import { generateTimeSlots, generateEndTimeSlots, isWithinDeadline, formatTime, isDateRangeValid, isTimeRangeValid } from "../utils";
import "./ReservationForm.css";

interface ReservationFormProps {
  onSubmit: (form: ReservationForm) => void;
}

const ReservationFormComponent: React.FC<ReservationFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<ReservationForm>({
    name: "",
    studentId: "",
    roomNumber: "",
    phoneNumber: "",
    startDate: "",
    endDate: "",
    startTime: "00:00",
    endTime: "01:00",
  });

  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [deadlineMessage, setDeadlineMessage] = useState<string>("");
  const timeSlots = generateTimeSlots();
  
  // 호실 선택 옵션
  const roomOptions = ["202호", "203호", "204호", "205호", "206호", "208호", "209호", "216호"];

  useEffect(() => {
    if (selectedStartDate) {
      const deadline = isWithinDeadline(selectedStartDate);
      if (deadline) {
        setDeadlineMessage("신청 가능합니다.");
      } else {
        setDeadlineMessage("신청 기간이 지났습니다.");
      }
    }
  }, [selectedStartDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedStartDate(date);
    setForm(prev => ({ ...prev, startDate: e.target.value }));
    
    // 시작일이 변경되면 종료일도 자동으로 설정 (같은 날짜)
    if (form.endDate === "" || form.endDate < e.target.value) {
      setForm(prev => ({ ...prev, endDate: e.target.value }));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, endDate: e.target.value }));
    
    // 종료일이 변경되면 종료시간을 유효한 값으로 재설정
    const endTimeSlots = generateEndTimeSlots(form.startTime, form.startDate, e.target.value);
    if (endTimeSlots.length > 0) {
      setForm(prev => ({ ...prev, endTime: endTimeSlots[0] }));
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStartTime = e.target.value;
    setForm(prev => ({ ...prev, startTime: newStartTime }));
    
    // 시작시간이 변경되면 종료시간을 유효한 값으로 재설정
    const endTimeSlots = generateEndTimeSlots(newStartTime, form.startDate, form.endDate);
    if (endTimeSlots.length > 0) {
      setForm(prev => ({ ...prev, endTime: endTimeSlots[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWithinDeadline(selectedStartDate!)) {
      alert("신청 기간이 지났습니다.");
      return;
    }

    if (!isDateRangeValid(form.startDate, form.endDate)) {
      alert("날짜 범위가 올바르지 않습니다. 시작일은 오늘 이후, 종료일은 시작일 이후, 최대 7일까지만 신청 가능합니다.");
      return;
    }

    if (!isTimeRangeValid(form.startTime, form.endTime, form.startDate, form.endDate)) {
      alert("시간 범위가 올바르지 않습니다. 하루 사용 시 종료시간은 시작시간 이후여야 합니다.");
      return;
    }

    onSubmit(form);
  };

  const isFormValid = () => {
    return form.name && form.studentId && form.roomNumber && 
           form.phoneNumber && form.startDate && form.endDate;
  };

  return (
    <div className="reservation-form">
      <h2>레지던시 작업룸 사용신청</h2>
      
      <div className="deadline-info">
        <h3>신청 기간 안내</h3>
        <p>• 월~목 사용신청: 전주 금요일까지</p>
        <p>• 금~일 사용신청: 사용주 목요일까지</p>
        {deadlineMessage && (
          <p className={`deadline-message ${isWithinDeadline(selectedStartDate!) ? "available" : "expired"}`}>
            {deadlineMessage}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">이름 *</label>
          <input
            type="text"
            id="name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentId">학번 *</label>
          <input
            type="text"
            id="studentId"
            value={form.studentId}
            onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="roomNumber">호실 *</label>
          <select
            id="roomNumber"
            value={form.roomNumber}
            onChange={(e) => setForm(prev => ({ ...prev, roomNumber: e.target.value }))}
            required
          >
            <option value="">호실을 선택하세요</option>
            {roomOptions.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">전화번호 *</label>
          <input
            type="tel"
            id="phoneNumber"
            value={form.phoneNumber}
            placeholder="010-0000-0000"
            onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
            required
          />
        </div>

        <div className="date-section">
          <div className="form-group">
            <label htmlFor="startDate">시작 날짜 *</label>
            <input
              type="date"
              id="startDate"
              value={form.startDate}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">종료 날짜 *</label>
            <input
              type="date"
              id="endDate"
              value={form.endDate}
              onChange={handleEndDateChange}
              min={form.startDate || new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        <div className="time-section">
          <div className="form-group">
            <label htmlFor="startTime">시작 시간 *</label>
            <select
              id="startTime"
              value={form.startTime}
              onChange={handleStartTimeChange}
              required
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="endTime">종료 시간 *</label>
            <select
              id="endTime"
              value={form.endTime}
              onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
              required
            >
              {generateEndTimeSlots(form.startTime, form.startDate, form.endDate).map((time) => (
                <option key={time} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!isFormValid() || !isWithinDeadline(selectedStartDate!)}
        >
          신청하기
        </button>
      </form>
    </div>
  );
};

export default ReservationFormComponent;
