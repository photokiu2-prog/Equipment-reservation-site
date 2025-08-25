// Vercel Serverless Function for reservations
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'reservations.json');

// 데이터베이스 초기화
const ensureDataFile = () => {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { reservations: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

// 데이터 읽기
const readData = () => {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('데이터 읽기 오류:', error);
    return { reservations: [] };
  }
};

// 데이터 쓰기
const writeData = (data) => {
  ensureDataFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('데이터 쓰기 오류:', error);
    return false;
  }
};

export default async function handler(req, res) {
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
      // 예약 목록 조회
      const data = readData();
      res.status(200).json(data.reservations);
      
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

      const data = readData();
      data.reservations.push(newReservation);
      
      if (writeData(data)) {
        res.status(201).json(newReservation);
      } else {
        res.status(500).json({ error: '데이터 저장 실패' });
      }
      
    } else if (method === 'DELETE') {
      // 예약 삭제
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: '삭제할 예약 ID가 필요합니다.' });
      }

      const data = readData();
      const initialLength = data.reservations.length;
      data.reservations = data.reservations.filter(reservation => reservation.id !== id);
      
      if (data.reservations.length < initialLength) {
        if (writeData(data)) {
          res.status(200).json({ success: true, deletedCount: initialLength - data.reservations.length });
        } else {
          res.status(500).json({ error: '데이터 저장 실패' });
        }
      } else {
        res.status(404).json({ error: '해당 ID의 예약을 찾을 수 없습니다.' });
      }
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
    
  } catch (error) {
    console.error('API 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
