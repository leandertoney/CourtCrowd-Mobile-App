import {useEffect, useState, useCallback} from 'react';
import {supabase, CourtMessage} from '../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';

export interface MessageWithUser extends CourtMessage {
  user: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Hook to subscribe to real-time court messages
 */
export function useCourtMessages(courtId: string | null) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!courtId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const {data, error} = await supabase
        .from('court_messages')
        .select(
          `
          *,
          user:profiles (
            id,
            name,
            avatar_url
          )
        `,
        )
        .eq('court_id', courtId)
        .order('created_at', {ascending: true})
        .limit(100);

      if (error) throw error;

      setMessages((data as MessageWithUser[]) || []);
    } catch (error) {
      console.error('Error fetching court messages:', error);
    } finally {
      setLoading(false);
    }
  }, [courtId]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const subscribe = async () => {
      await fetchMessages();

      if (!courtId) return;

      // Subscribe to realtime changes
      channel = supabase
        .channel(`court-messages-${courtId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'court_messages',
            filter: `court_id=eq.${courtId}`,
          },
          async payload => {
            // Fetch the new message with user data
            const {data: newMessage} = await supabase
              .from('court_messages')
              .select(
                `
                *,
                user:profiles (
                  id,
                  name,
                  avatar_url
                )
              `,
              )
              .eq('id', payload.new.id)
              .single();

            if (newMessage) {
              setMessages(prev => [...prev, newMessage as MessageWithUser]);
            }
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [courtId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!courtId || !content.trim()) return {error: 'Invalid input'};

      setSending(true);

      try {
        const {
          data: {user},
        } = await supabase.auth.getUser();

        if (!user) {
          return {error: 'Not authenticated'};
        }

        const {error} = await supabase.from('court_messages').insert({
          court_id: courtId,
          user_id: user.id,
          content: content.trim(),
        });

        if (error) throw error;

        return {error: null};
      } catch (error: any) {
        console.error('Error sending message:', error);
        return {error: error.message || 'Failed to send message'};
      } finally {
        setSending(false);
      }
    },
    [courtId],
  );

  return {
    messages,
    loading,
    sending,
    sendMessage,
    refetch: fetchMessages,
  };
}
