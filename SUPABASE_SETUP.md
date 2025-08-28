# 🚀 Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. **https://supabase.com** 접속
2. **"Start your project"** 클릭
3. **GitHub로 로그인**
4. **"New Project"** 클릭
5. **프로젝트 이름**: `residency-workspace`
6. **데이터베이스 비밀번호**: 복잡한 비밀번호 설정 (기억해두세요!)

## 2단계: 데이터베이스 스키마 생성

1. **Supabase 대시보드** → **SQL Editor**
2. **`supabase-schema.sql`** 파일 내용을 복사하여 붙여넣기
3. **"Run"** 버튼 클릭하여 실행

## 3단계: 환경 변수 설정

### Vercel 환경 변수 설정:

1. **Vercel 대시보드** → **프로젝트 선택**
2. **Settings** → **Environment Variables**
3. **다음 변수들 추가**:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase에서 값 가져오기:

1. **Supabase 대시보드** → **Settings** → **API**
2. **Project URL** 복사 → `SUPABASE_URL`에 붙여넣기
3. **service_role key** 복사 → `SUPABASE_SERVICE_ROLE_KEY`에 붙여넣기

## 4단계: 테스트

1. **사이트 접속** → 새 예약 신청
2. **Supabase 대시보드** → **Table Editor** → **reservations** 테이블에서 데이터 확인
3. **관리자 로그인** → `donggeon` / `kiu0402`

## 🎯 장점

- ✅ **영구 데이터 저장**: 서버 재시작해도 데이터 유지
- ✅ **동시 사용자 지원**: 여러 사용자가 동시에 사용 가능
- ✅ **실시간 기능**: 웹소켓으로 실시간 업데이트 가능
- ✅ **확장성**: 트래픽 증가에 따라 자동 확장
- ✅ **무료 플랜**: 월 500MB, 50,000 요청까지 무료

## 🔒 보안

- **RLS (Row Level Security)** 활성화
- **API 키** 기반 인증
- **데이터베이스 레벨** 보안 정책
