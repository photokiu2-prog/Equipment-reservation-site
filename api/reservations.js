// Vercel Serverless Function for reservations (In-Memory Storage)
let reservations = [];

// 공통 함수들
export const getReservations = () => {
  return reservations;
};

export const addReservation = (reservation) => {
  reservations.push(reservation);
  return reservation;
};

export const deleteReservation = (id) => {
  const initialLength = reservations.length;
  const reservationToDelete = reservations.find(r => r.id === id);
  
  if (reservationToDelete) {
    reservations = reservations.filter(reservation => reservation.id !== id);
    console.log('✅ 예약 삭제 완료:', reservationToDelete.name, 'ID:', id);
    return true;
  } else {
    console.log('⚠️ 해당 ID의 예약을 찾을 수 없음:', id);
    return false;
  }
};

export default async function handler(req, res) {
  // 디버깅을 위한 요청 정보 로깅
  console.log('🚀 API 요청:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;

    if (method === 'GET') {
      // 예약 목록 조회
      console.log('📋 GET 요청 - 현재 예약 수:', reservations.length);
      res.status(200).json(reservations);
      
    } else if (method === 'POST') {
      // 새 예약 추가
      const { name, studentId, roomNumber, phoneNumber, startDate, endDate, startTime, endTime } = req.body;
      
      if (!name || !studentId || !roomNumber || !phoneNumber || !startDate || !endDate || !startTime || !endTime) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
      }

      const newReservation = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
        name,
        studentId,
        roomNumber,
        phoneNumber,
        startDate,
        endDate,
        startTime,
        endTime,
        createdAt: new Date().toLocaleString("ko-KR")
      };

      const addedReservation = addReservation(newReservation);
      console.log('✅ POST 요청 - 새 예약 추가:', addedReservation.name, '총 예약 수:', reservations.length);
      
      res.status(201).json(addedReservation);
      
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
    
  } catch (error) {
    console.error('❌ API 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
