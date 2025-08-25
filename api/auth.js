// Vercel Serverless Function for admin authentication
const ADMIN_CREDENTIALS = {
  username: 'donggeon',
  password: 'kiu0402'
};

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

    // 관리자 인증 확인
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      console.log('✅ 관리자 로그인 성공:', username);
      
      // 로그인 성공 시 세션 토큰 생성 (간단한 예시)
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
