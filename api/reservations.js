// Vercel Serverless Function for reservations (Supabase Database)
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 생성
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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
      // 예약 목록 조회 (Supabase에서)
      console.log('📋 GET 요청 - Supabase에서 예약 데이터 조회');
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase 조회 오류:', error);
        return res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
      }
      
      console.log('✅ GET 요청 - 조회된 예약 수:', data?.length || 0);
      res.status(200).json(data || []);
      
    } else if (method === 'POST') {
      // 새 예약 추가 (Supabase에 저장)
      const { name, studentId, roomNumber, phoneNumber, startDate, endDate, startTime, endTime } = req.body;
      
      if (!name || !studentId || !roomNumber || !phoneNumber || !startDate || !endDate || !startTime || !endTime) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
      }

      const newReservation = {
        name,
        student_id: studentId,
        room_number: roomNumber,
        phone_number: phoneNumber,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        created_at: new Date().toISOString()
      };

      console.log('✅ POST 요청 - 새 예약 추가 시도:', newReservation);
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([newReservation])
        .select();
      
      if (error) {
        console.error('❌ Supabase 삽입 오류:', error);
        return res.status(500).json({ error: '예약 저장 중 오류가 발생했습니다.' });
      }
      
      console.log('✅ POST 요청 - 새 예약 추가 완료:', data[0]);
      res.status(201).json(data[0]);
      
    } else if (method === 'DELETE') {
      // 예약 삭제 (Supabase에서)
      const { id } = req.query;
      
      console.log('🗑️ DELETE 요청 - 쿼리 파라미터 ID:', id);
      
      if (!id) {
        return res.status(400).json({ error: '삭제할 예약 ID가 필요합니다.' });
      }

      const { data, error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('❌ Supabase 삭제 오류:', error);
        return res.status(500).json({ error: '예약 삭제 중 오류가 발생했습니다.' });
      }
      
      if (data && data.length > 0) {
        console.log('✅ DELETE 요청 - 예약 삭제 완료:', data[0]);
        res.status(200).json({ 
          success: true, 
          deletedCount: 1,
          deletedReservation: data[0]
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
