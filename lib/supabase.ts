import { createClient } from '@supabase/supabase-js';

// توجه: این مقادیر را باید از پنل Supabase خود دریافت کنید
// برای استفاده واقعی، این مقادیر را در فایل .env قرار دهید
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface BettingUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  total_bets: number;
  correct_predictions: number;
  wrong_predictions: number;
  score: number;
}

export interface Bet {
  id: string;
  user_id: string;
  match_day: number;
  match_index: number;
  team1_index: number;
  team2_index: number;
  predicted_winner: number | null; // null for draw, team index for winner
  actual_winner: number | null;
  is_correct: boolean | null;
  created_at: string;
}
