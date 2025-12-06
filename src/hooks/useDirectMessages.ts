import {useEffect, useState, useCallback, useRef} from 'react';
import {supabase} from '../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  otherUser: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

/**
 * Hook to fetch and manage all conversations for the current user
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        setConversations([]);
        return;
      }

      // Get all conversations where user is a participant
      const {data: participations, error: partError} = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (partError) throw partError;

      if (!participations || participations.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participations.map(p => p.conversation_id);
      const lastReadMap = new Map(
        participations.map(p => [p.conversation_id, p.last_read_at]),
      );

      // Get conversation details with other participants
      const {data: convData, error: convError} = await supabase
        .from('conversations')
        .select(
          `
          id,
          created_at,
          updated_at,
          conversation_participants!inner (
            user_id,
            users:user_id (
              id,
              name,
              avatar_url
            )
          )
        `,
        )
        .in('id', conversationIds)
        .order('updated_at', {ascending: false});

      if (convError) throw convError;

      // Get last message for each conversation
      const {data: lastMessages, error: msgError} = await supabase
        .from('direct_messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', {ascending: false});

      if (msgError) throw msgError;

      // Build last message map (take first one for each conversation)
      const lastMessageMap = new Map<
        string,
        {content: string; created_at: string; sender_id: string}
      >();
      lastMessages?.forEach(msg => {
        if (!lastMessageMap.has(msg.conversation_id)) {
          lastMessageMap.set(msg.conversation_id, {
            content: msg.content,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
          });
        }
      });

      // Count unread messages
      const unreadCounts = new Map<string, number>();
      lastMessages?.forEach(msg => {
        const lastRead = lastReadMap.get(msg.conversation_id);
        if (
          lastRead &&
          new Date(msg.created_at) > new Date(lastRead) &&
          msg.sender_id !== user.id
        ) {
          unreadCounts.set(
            msg.conversation_id,
            (unreadCounts.get(msg.conversation_id) || 0) + 1,
          );
        }
      });

      // Build conversation list
      const convList: Conversation[] = (convData || [])
        .map(conv => {
          const participants = conv.conversation_participants as any[];
          const otherParticipant = participants.find(
            (p: any) => p.user_id !== user.id,
          );

          if (!otherParticipant) return null;

          const otherUserData = otherParticipant.users;

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            otherUser: {
              id: otherUserData.id,
              name: otherUserData.name,
              avatar_url: otherUserData.avatar_url,
            },
            lastMessage: lastMessageMap.get(conv.id),
            unreadCount: unreadCounts.get(conv.id) || 0,
          };
        })
        .filter(Boolean) as Conversation[];

      setConversations(convList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const subscribe = async () => {
      await fetchConversations();

      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) return;

      // Subscribe to new messages to update conversation list
      channelRef.current = supabase
        .channel('conversations-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
          },
          () => {
            // Refetch conversations when any message changes
            fetchConversations();
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchConversations]);

  const startConversation = useCallback(async (otherUserId: string) => {
    try {
      const {data, error} = await supabase.rpc('get_or_create_conversation', {
        other_user_id: otherUserId,
      });

      if (error) throw error;

      return {conversationId: data as string, error: null};
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      return {conversationId: null, error: error.message};
    }
  }, []);

  return {
    conversations,
    loading,
    refetch: fetchConversations,
    startConversation,
  };
}

/**
 * Hook to manage messages in a specific conversation
 */
export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const {data, error} = await supabase
        .from('direct_messages')
        .select(
          `
          *,
          sender:sender_id (
            id,
            name,
            avatar_url
          )
        `,
        )
        .eq('conversation_id', conversationId)
        .order('created_at', {ascending: true});

      if (error) throw error;

      setMessages((data as DirectMessage[]) || []);

      // Mark as read
      await markAsRead();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from('conversation_participants')
        .update({last_read_at: new Date().toISOString()})
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationId]);

  useEffect(() => {
    const subscribe = async () => {
      await fetchMessages();

      if (!conversationId) return;

      // Subscribe to new messages
      channelRef.current = supabase
        .channel(`dm-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          async payload => {
            // Fetch the new message with user data
            const {data: newMessage} = await supabase
              .from('direct_messages')
              .select(
                `
                *,
                sender:sender_id (
                  id,
                  name,
                  avatar_url
                )
              `,
              )
              .eq('id', payload.new.id)
              .single();

            if (newMessage) {
              setMessages(prev => [...prev, newMessage as DirectMessage]);
              await markAsRead();
            }
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, fetchMessages, markAsRead]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return {error: 'Invalid input'};

      setSending(true);

      try {
        const {
          data: {user},
        } = await supabase.auth.getUser();

        if (!user) {
          return {error: 'Not authenticated'};
        }

        const {error} = await supabase.from('direct_messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
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
    [conversationId],
  );

  return {
    messages,
    loading,
    sending,
    sendMessage,
    refetch: fetchMessages,
    markAsRead,
  };
}
