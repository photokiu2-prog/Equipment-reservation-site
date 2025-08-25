export interface Reservation {
  id: string;
  name: string;
  studentId: string;
  roomNumber: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface ReservationForm {
  name: string;
  studentId: string;
  roomNumber: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}
