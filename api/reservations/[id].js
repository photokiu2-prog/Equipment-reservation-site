// Vercel Serverless Function for individual reservation operations
import { getReservations, deleteReservation } from '../reservations';

export default async function handler(req, res) {
  // 디버깅을 위한 요청 정보 로깅
  console.log('🚀 [id] API 요청:', {
    method: req.method,
    url: req.url,
    id: req.query.id,
    headers: req.headers
  });
  
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    const { id } = req.query;

    if (method === 'DELETE') {
      // 예약 삭제
      if (!id) {
        return res.status(400).json({ error: '삭제할 예약 ID가 필요합니다.' });
      }

      console.log('🗑️ DELETE 요청 - ID:', id);
      
      const success = await deleteReservation(id);
      
      if (success) {
        console.log('✅ DELETE 요청 - 예약 삭제 완료, ID:', id);
        res.status(200).json({ 
          success: true, 
          deletedCount: 1,
          message: '예약이 성공적으로 삭제되었습니다.'
        });
      } else {
        console.log('⚠️ DELETE 요청 - 해당 ID의 예약을 찾을 수 없음:', id);
        res.status(404).json({ error: '해당 ID의 예약을 찾을 수 없습니다.' });
      }
      
    } else {
      res.setHeader('Allow', ['DELETE']);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
    
  } catch (error) {
    console.error('❌ [id] API 오류:', error);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
