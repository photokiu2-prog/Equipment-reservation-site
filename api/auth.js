// Vercel Serverless Function for admin authentication (Supabase Database)
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
  console.log('🔐 인증 API 요청:', {
    method: req.method,
    url: req.url,
    body: req.body
  });
  
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: '사용자명과 비밀번호를 입력해주세요.' 
      });
    }

    // Supabase에서 관리자 사용자 조회
    console.log('🔍 관리자 인증 시도:', username);
    
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // password_hash가 아닌 password 필드 사용
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 조회 오류:', error);
      return res.status(500).json({ 
        success: false, 
        error: '인증 처리 중 오류가 발생했습니다.' 
      });
    }
    
    if (adminUsers && adminUsers.length > 0) {
      console.log('✅ 관리자 로그인 성공:', username);
      
      // 로그인 성공 시 세션 토큰 생성
      const sessionToken = Date.now().toString() + Math.random().toString(36).substring(2, 15);
      
      res.status(200).json({
        success: true,
        message: '로그인 성공',
        sessionToken: sessionToken,
        username: username
      });
    } else {
      console.log('❌ 관리자 로그인 실패:', username);
      
      res.status(401).json({
        success: false,
        error: '사용자명 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
  } catch (error) {
    console.error('❌ 인증 API 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '서버 내부 오류가 발생했습니다.' 
    });
  }
}
