const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// 기본 미들웨어 설정
server.use(middlewares);
server.use(jsonServer.bodyParser);

// 예약 데이터 초기화 (db.json이 없을 경우)
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('db.json')) {
  const initialData = {
    reservations: []
  };
  fs.writeFileSync('db.json', JSON.stringify(initialData, null, 2));
}

// 예약 추가 API
server.post('/api/reservations', (req, res) => {
  const { name, studentId, roomNumber, phoneNumber, startDate, endDate, startTime, endTime } = req.body;
  
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
  
  const db = router.db;
  db.get('reservations').push(newReservation).write();
  
  console.log('새 예약 추가:', newReservation);
  res.json(newReservation);
});

// 예약 삭제 API
server.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  
  const db = router.db;
  const deleted = db.get('reservations').remove({ id }).write();
  
  console.log('예약 삭제:', id, deleted);
  res.json({ success: true, deletedCount: deleted.length });
});

// 예약 목록 조회 API
server.get('/api/reservations', (req, res) => {
  const db = router.db;
  const reservations = db.get('reservations').value();
  
  res.json(reservations);
});

// JSON Server 라우터 사용
server.use('/api', router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`  GET  /api/reservations - 예약 목록 조회`);
  console.log(`  POST /api/reservations - 새 예약 추가`);
  console.log(`  DELETE /api/reservations/:id - 예약 삭제`);
});
