-- Conversations table for DMs between users
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversation participants (links users to conversations)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Direct messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON public.direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created ON public.direct_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can see their conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for conversation participants
CREATE POLICY "Users can see conversation participants"
  ON public.conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (user_id = auth.uid() OR true); -- Allow adding other users when creating

CREATE POLICY "Users can update their participation"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for direct messages
CREATE POLICY "Users can see messages in their conversations"
  ON public.direct_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.direct_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = direct_messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.direct_messages;
ALTER publication supabase_realtime ADD TABLE public.conversation_participants;

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id uuid)
RETURNS uuid AS $$
DECLARE
  conv_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();

  -- Check if conversation already exists
  SELECT cp1.conversation_id INTO conv_id
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = current_user_id
    AND cp2.user_id = other_user_id
    AND cp1.user_id != cp2.user_id;

  -- If not, create one
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations DEFAULT VALUES
    RETURNING id INTO conv_id;

    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES
      (conv_id, current_user_id),
      (conv_id, other_user_id);
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation timestamp when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS trigger AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message_update_conversation
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger to notify recipient of new message
CREATE OR REPLACE FUNCTION handle_new_direct_message()
RETURNS trigger AS $$
DECLARE
  sender_user RECORD;
  recipient RECORD;
BEGIN
  -- Get sender info
  SELECT name, avatar_url INTO sender_user
  FROM public.users
  WHERE id = NEW.sender_id;

  -- Notify all other participants
  FOR recipient IN
    SELECT cp.user_id, u.push_token
    FROM public.conversation_participants cp
    JOIN public.users u ON u.id = cp.user_id
    WHERE cp.conversation_id = NEW.conversation_id
      AND cp.user_id != NEW.sender_id
  LOOP
    -- Create in-app notification
    PERFORM notify_user(
      recipient.user_id,
      'new_message',
      COALESCE(sender_user.name, 'Someone') || ' sent you a message',
      LEFT(NEW.content, 100),
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'sender_name', sender_user.name,
        'sender_avatar', sender_user.avatar_url
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_direct_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_direct_message();
