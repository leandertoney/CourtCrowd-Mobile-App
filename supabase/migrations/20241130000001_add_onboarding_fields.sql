-- Add onboarding preference columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS play_frequency TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_struggle TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS court_finding_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS heard_about_us TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_radius INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN users.play_frequency IS 'How often user plays: once_week, 2_3_week, 4_plus_week, just_starting';
COMMENT ON COLUMN users.primary_struggle IS 'Main pain point: courts_empty, courts_crowded, find_players, coordinate, dont_know_where, all';
COMMENT ON COLUMN users.court_finding_method IS 'How user finds courts: drive_around, group_chat, word_of_mouth, random_guess, hope';
COMMENT ON COLUMN users.heard_about_us IS 'Attribution: tiktok, instagram, friend, facebook, reddit, courts, other';
COMMENT ON COLUMN users.search_radius IS 'Preferred search radius in miles';
COMMENT ON COLUMN users.is_premium IS 'Whether user has active premium subscription';
COMMENT ON COLUMN users.premium_expires_at IS 'When premium subscription expires';
COMMENT ON COLUMN users.onboarding_completed_at IS 'When user completed onboarding flow';
