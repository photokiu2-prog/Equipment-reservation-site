-- Supabase 데이터베이스 스키마
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

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

-- 기본 관리자 계정 추가 (실제 운영에서는 별도로 생성)
-- INSERT INTO admin_users (username, password_hash) 
-- VALUES ('your_username', 'your_hashed_password');

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
