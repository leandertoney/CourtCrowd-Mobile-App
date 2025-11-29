// Supabase Edge Function: notify-arrival
// Sends silent push notifications when a followed user arrives at a court

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string
  court_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, court_id }: NotificationPayload = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the arriving user's info
    const { data: arrivingUser, error: userError } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user_id)
      .single()

    if (userError || !arrivingUser) {
      console.error('Error fetching user:', userError)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the court info
    const { data: court, error: courtError } = await supabase
      .from('courts')
      .select('name')
      .eq('id', court_id)
      .single()

    if (courtError || !court) {
      console.error('Error fetching court:', courtError)
      return new Response(JSON.stringify({ error: 'Court not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get all followers of this user who have push tokens
    const { data: followers, error: followError } = await supabase
      .from('follows')
      .select(`
        follower:users!follower_id (
          id,
          push_token
        )
      `)
      .eq('following_id', user_id)

    if (followError) {
      console.error('Error fetching followers:', followError)
      return new Response(JSON.stringify({ error: 'Failed to fetch followers' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Filter followers with valid push tokens
    const pushTokens = followers
      ?.map((f: any) => f.follower?.push_token)
      .filter((token: string | null) => token != null) as string[]

    if (!pushTokens || pushTokens.length === 0) {
      return new Response(JSON.stringify({ message: 'No followers with push tokens' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send silent push notifications via Expo Push API
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: null, // Silent push
      body: `${arrivingUser.name} arrived at ${court.name}`,
      data: {
        type: 'arrival',
        court_id,
        user_id,
        user_name: arrivingUser.name,
        court_name: court.name,
      },
      _contentAvailable: true, // iOS silent push
      priority: 'normal',
    }))

    const expoPushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const pushResult = await expoPushResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        notified: pushTokens.length,
        result: pushResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in notify-arrival:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
