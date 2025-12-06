-- Leaderboard and Radar Geofencing Preparation
-- Migration: 20241206

-- =====================================================
-- 1. Add Radar-related fields to court_presence
-- =====================================================

-- Add entry_method to track how user checked in
ALTER TABLE public.court_presence
ADD COLUMN IF NOT EXISTS entry_method TEXT DEFAULT 'manual';

-- Add radar_event_id for Radar SDK integration
ALTER TABLE public.court_presence
ADD COLUMN IF NOT EXISTS radar_event_id TEXT;

-- Add duration tracking
ALTER TABLE public.court_presence
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Add exit timestamp for calculating duration
ALTER TABLE public.court_presence
ADD COLUMN IF NOT EXISTS exited_at TIMESTAMPTZ;

-- =====================================================
-- 2. Add DUPR rating field to users (if not exists)
-- =====================================================

-- The dupr field already exists in schema, but let's add dupr_id for future verification
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dupr_id TEXT;

-- Add location fields for profile display
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS state TEXT;

-- =====================================================
-- 3. Create User Stats Table for Leaderboard
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_checkins INTEGER DEFAULT 0,
  total_play_minutes INTEGER DEFAULT 0,
  checkins_today INTEGER DEFAULT 0,
  checkins_week INTEGER DEFAULT 0,
  checkins_month INTEGER DEFAULT 0,
  play_minutes_today INTEGER DEFAULT 0,
  play_minutes_week INTEGER DEFAULT 0,
  play_minutes_month INTEGER DEFAULT 0,
  longest_session_minutes INTEGER DEFAULT 0,
  favorite_court_id UUID REFERENCES public.courts(id),
  streak_days INTEGER DEFAULT 0,
  last_checkin_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- User stats are publicly viewable (for leaderboard)
CREATE POLICY "User stats are viewable by everyone"
  ON public.user_stats FOR SELECT
  USING (true);

-- Users can only update their own stats (via triggers mostly)
CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow inserting own stats
CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. Create indexes for leaderboard queries
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_stats_checkins_week ON public.user_stats(checkins_week DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_checkins_month ON public.user_stats(checkins_month DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_checkins ON public.user_stats(total_checkins DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_play_minutes_week ON public.user_stats(play_minutes_week DESC);

-- =====================================================
-- 5. Function to update user stats on check-in
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_checkin_stats()
RETURNS TRIGGER AS $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (
    user_id,
    total_checkins,
    checkins_today,
    checkins_week,
    checkins_month,
    last_checkin_date,
    streak_days
  )
  VALUES (
    NEW.user_id,
    1,
    1,
    1,
    1,
    current_date_val,
    1
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_checkins = user_stats.total_checkins + 1,
    checkins_today = CASE
      WHEN user_stats.last_checkin_date = current_date_val THEN user_stats.checkins_today + 1
      ELSE 1
    END,
    checkins_week = CASE
      WHEN user_stats.last_checkin_date >= week_start THEN user_stats.checkins_week + 1
      ELSE 1
    END,
    checkins_month = CASE
      WHEN user_stats.last_checkin_date >= month_start THEN user_stats.checkins_month + 1
      ELSE 1
    END,
    streak_days = CASE
      WHEN user_stats.last_checkin_date = current_date_val - INTERVAL '1 day' THEN user_stats.streak_days + 1
      WHEN user_stats.last_checkin_date = current_date_val THEN user_stats.streak_days
      ELSE 1
    END,
    last_checkin_date = current_date_val,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for check-in stats
DROP TRIGGER IF EXISTS on_court_presence_insert ON public.court_presence;
CREATE TRIGGER on_court_presence_insert
  AFTER INSERT ON public.court_presence
  FOR EACH ROW EXECUTE FUNCTION public.handle_checkin_stats();

-- =====================================================
-- 6. Function to update play time on checkout
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_checkout_stats()
RETURNS TRIGGER AS $$
DECLARE
  session_duration INTEGER;
BEGIN
  -- Calculate duration if exited_at is being set
  IF NEW.exited_at IS NOT NULL AND OLD.exited_at IS NULL THEN
    session_duration := EXTRACT(EPOCH FROM (NEW.exited_at - NEW.entered_at)) / 60;

    -- Update the duration on presence record
    NEW.duration_minutes := session_duration;

    -- Update user stats with play time
    UPDATE public.user_stats
    SET
      total_play_minutes = total_play_minutes + session_duration,
      play_minutes_today = CASE
        WHEN last_checkin_date = CURRENT_DATE THEN play_minutes_today + session_duration
        ELSE session_duration
      END,
      play_minutes_week = CASE
        WHEN last_checkin_date >= DATE_TRUNC('week', CURRENT_DATE)::DATE THEN play_minutes_week + session_duration
        ELSE session_duration
      END,
      play_minutes_month = CASE
        WHEN last_checkin_date >= DATE_TRUNC('month', CURRENT_DATE)::DATE THEN play_minutes_month + session_duration
        ELSE session_duration
      END,
      longest_session_minutes = GREATEST(longest_session_minutes, session_duration),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for checkout stats
DROP TRIGGER IF EXISTS on_court_presence_update ON public.court_presence;
CREATE TRIGGER on_court_presence_update
  BEFORE UPDATE ON public.court_presence
  FOR EACH ROW EXECUTE FUNCTION public.handle_checkout_stats();

-- =====================================================
-- 7. Function to reset daily/weekly/monthly stats
-- =====================================================

CREATE OR REPLACE FUNCTION public.reset_periodic_stats()
RETURNS void AS $$
BEGIN
  -- Reset today's stats at midnight
  UPDATE public.user_stats
  SET
    checkins_today = 0,
    play_minutes_today = 0
  WHERE last_checkin_date < CURRENT_DATE;

  -- Reset weekly stats on Monday
  IF EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN
    UPDATE public.user_stats
    SET
      checkins_week = 0,
      play_minutes_week = 0
    WHERE last_checkin_date < DATE_TRUNC('week', CURRENT_DATE)::DATE;
  END IF;

  -- Reset monthly stats on 1st
  IF EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
    UPDATE public.user_stats
    SET
      checkins_month = 0,
      play_minutes_month = 0
    WHERE last_checkin_date < DATE_TRUNC('month', CURRENT_DATE)::DATE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. Enable realtime for user_stats (for live leaderboard)
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;

-- =====================================================
-- 9. Create view for leaderboard queries
-- =====================================================

CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
  us.user_id,
  u.name,
  u.nickname,
  u.avatar_url,
  u.dupr,
  us.total_checkins,
  us.checkins_today,
  us.checkins_week,
  us.checkins_month,
  us.total_play_minutes,
  us.play_minutes_today,
  us.play_minutes_week,
  us.play_minutes_month,
  us.streak_days,
  us.longest_session_minutes
FROM public.user_stats us
JOIN public.users u ON us.user_id = u.id
ORDER BY us.total_checkins DESC;
