-- Notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Function to send push notification (to be called by edge function or trigger)
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for friend arrival notifications
CREATE OR REPLACE FUNCTION handle_court_presence_insert()
RETURNS trigger AS $$
DECLARE
  arriving_user RECORD;
  follower RECORD;
  court_record RECORD;
BEGIN
  -- Get the arriving user's info
  SELECT name, avatar_url INTO arriving_user
  FROM public.users
  WHERE id = NEW.user_id;

  -- Get court info
  SELECT name INTO court_record
  FROM public.courts
  WHERE id = NEW.court_id;

  -- Notify all followers of this user who have push enabled
  FOR follower IN
    SELECT f.follower_id, u.push_token
    FROM public.follows f
    JOIN public.users u ON u.id = f.follower_id
    WHERE f.following_id = NEW.user_id
      AND u.push_token IS NOT NULL
  LOOP
    -- Create in-app notification
    PERFORM notify_user(
      follower.follower_id,
      'friend_arrived',
      COALESCE(arriving_user.name, 'A friend') || ' just arrived!',
      COALESCE(arriving_user.name, 'Someone you follow') || ' is now at ' || COALESCE(court_record.name, 'a court'),
      jsonb_build_object(
        'court_id', NEW.court_id,
        'user_id', NEW.user_id,
        'court_name', court_record.name,
        'user_name', arriving_user.name,
        'user_avatar', arriving_user.avatar_url
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for presence inserts
DROP TRIGGER IF EXISTS on_court_presence_insert ON public.court_presence;
CREATE TRIGGER on_court_presence_insert
  AFTER INSERT ON public.court_presence
  FOR EACH ROW
  EXECUTE FUNCTION handle_court_presence_insert();

-- Trigger for new follower notifications
CREATE OR REPLACE FUNCTION handle_new_follow()
RETURNS trigger AS $$
DECLARE
  follower_user RECORD;
BEGIN
  -- Get follower info
  SELECT name, avatar_url INTO follower_user
  FROM public.users
  WHERE id = NEW.follower_id;

  -- Create notification for the followed user
  PERFORM notify_user(
    NEW.following_id,
    'new_follower',
    'New follower!',
    COALESCE(follower_user.name, 'Someone') || ' started following you',
    jsonb_build_object(
      'user_id', NEW.follower_id,
      'user_name', follower_user.name,
      'user_avatar', follower_user.avatar_url
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new follows
DROP TRIGGER IF EXISTS on_new_follow ON public.follows;
CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_follow();
