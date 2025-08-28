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
2. **다음 SQL을 복사하여 붙여넣기**:

```sql
-- 예약 테이블 생성
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  student_id VARCHAR(20) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 사용자 테이블 생성
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 관리자 계정 추가 (실제 사용할 아이디/비밀번호로 변경하세요)
INSERT INTO admin_users (username, password_hash) 
VALUES ('your_username', 'your_password');

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX idx_reservations_student_id ON reservations(student_id);
CREATE INDEX idx_reservations_room_number ON reservations(room_number);
CREATE INDEX idx_admin_users_username ON admin_users(username);

-- RLS (Row Level Security) 설정
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 예약 테이블 정책 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Allow all operations on reservations" ON reservations
  FOR ALL USING (true);

-- 관리자 테이블 정책 (읽기만 가능)
CREATE POLICY "Allow read on admin_users" ON admin_users
  FOR SELECT USING (true);
```

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
3. **관리자 로그인** → SQL에서 설정한 아이디/비밀번호로 로그인

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
- **민감한 정보는 GitHub에 노출되지 않음**

## ⚠️ 중요 사항

- **SQL 스키마의 `your_username`과 `your_password`를 실제 사용할 값으로 변경하세요**
- **이 정보는 GitHub에 올라가지 않습니다**
- **Supabase에서만 직접 실행하여 데이터베이스를 설정하세요**
