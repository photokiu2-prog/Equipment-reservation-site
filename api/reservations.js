// Vercel Serverless Function for reservations (Simple In-Memory Version)
// 임시로 메모리에 데이터 저장 (테스트용)
let reservations = [];

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;

    if (method === 'GET') {
      // 예약 목록 조회 (메모리에서)
      console.log('📋 GET 요청 - 메모리에서 예약 데이터 조회');
      
      console.log('✅ GET 요청 - 조회된 예약 수:', reservations.length);
      res.status(200).json(reservations);
      
    } else if (method === 'POST') {
      // 새 예약 추가 (메모리에 저장)
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
        createdAt: new Date().toISOString()
      };

      console.log('✅ POST 요청 - 새 예약 추가 시도:', newReservation);
      
      reservations.push(newReservation);
      
      console.log('✅ POST 요청 - 새 예약 추가 완료:', newReservation);
      res.status(201).json(newReservation);
      
    } else if (method === 'DELETE') {
      // 예약 삭제 (메모리에서)
      const { id } = req.query;
      
      console.log('🗑️ DELETE 요청 - 쿼리 파라미터 ID:', id);
      
      if (!id) {
        return res.status(400).json({ error: '삭제할 예약 ID가 필요합니다.' });
      }

      const index = reservations.findIndex(r => r.id === id);
      
      if (index !== -1) {
        const deletedReservation = reservations.splice(index, 1)[0];
        console.log('✅ DELETE 요청 - 예약 삭제 완료:', deletedReservation);
        res.status(200).json({ 
          success: true, 
          deletedCount: 1,
          deletedReservation: deletedReservation
        });
      } else {
        console.log('⚠️ DELETE 요청 - 해당 ID의 예약을 찾을 수 없음:', id);
        res.status(404).json({ error: '해당 ID의 예약을 찾을 수 없습니다.' });
      }
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
    
  } catch (error) {
    console.error('❌ API 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
