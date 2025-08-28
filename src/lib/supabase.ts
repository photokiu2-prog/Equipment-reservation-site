import { createClient } from '@supabase/supabase-js'

// Supabase 프로젝트 설정
// 이 값들은 Supabase 프로젝트 설정에서 가져와야 합니다
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 테이블 타입 정의
export interface Reservation {
  id: string
  name: string
  student_id: string
  room_number: string
  phone_number: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  created_at: string
}

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  created_at: string
}
