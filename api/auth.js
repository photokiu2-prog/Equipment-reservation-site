// Vercel Serverless Function for admin authentication (Supabase Database)
import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인 및 로깅
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔑 환경 변수 확인:')
console.log('- SUPABASE_URL:', supabaseUrl ? '설정됨' : '❌ 없음')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '❌ 없음')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.')
}

// Supabase 클라이언트 생성
let supabase
try {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  console.log('✅ Supabase 클라이언트 생성 성공')
} catch (error) {
  console.error('❌ Supabase 클라이언트 생성 실패:', error)
  throw error
}

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

    // 임시 하드코딩된 인증 (테스트용)
    console.log('🔍 관리자 인증 시도:', username);
    
    if (username === 'donggeon' && password === 'kiu0402') {
      console.log('✅ 관리자 로그인 성공 (하드코딩):', username);
      
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
    
    // Supabase 인증 (주석 처리 - 테스트용)
    /*
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 조회 오류:', error);
      console.error('❌ 오류 상세:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return res.status(500).json({ 
        success: false, 
        error: '인증 처리 중 오류가 발생했습니다.',
        details: error.message,
        code: error.code
      });
    }
    
    if (adminUsers && adminUsers.length > 0) {
      console.log('✅ 관리자 로그인 성공:', username);
      
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
    */
    
  } catch (error) {
    console.error('❌ 인증 API 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    res.status(500).json({ 
      success: false,
      error: '서버 내부 오류가 발생했습니다.',
      details: error.message,
      stack: error.stack
    });
  }
}
