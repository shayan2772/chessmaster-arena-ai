import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that need elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

// Database types
export interface User {
  id: string
  email: string
  username: string
  password?: string
  name?: string
  avatar?: string
  created_at: string
  updated_at: string
  subscription_id?: string
  subscription_status?: string
  games_played_this_month: number
  last_game_date?: string
}

export interface Game {
  id: string
  room_id: string
  status: string
  result?: string
  white_player_id?: string
  black_player_id?: string
  current_turn: string
  board_state: string
  moves: string
  created_at: string
  updated_at: string
  started_at?: string
  ended_at?: string
  video_room_url?: string
}