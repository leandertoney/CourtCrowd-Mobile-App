# Court Crowd Supabase Environment Setup

## DEV ENVIRONMENT (court-crowd-dev)
1. Create Supabase project
2. Run /supabase/migrations/001_schema.sql
3. Enable Realtime on:
   - court_presence
   - court_messages
4. Deploy Edge Function:
   supabase/functions/notify-arrival
5. Add SERVICE_ROLE KEY to project settings (for dev only)
6. Update .env.dev with URL + anon key

## PROD ENVIRONMENT (court-crowd-prod)
1. Create Supabase project
2. Apply SAME schema as dev
3. Deploy SAME edge function
4. Enable SAME realtime tables
5. Use production anon key in .env.prod
6. NEVER log, debug, or mutate prod data manually

After both environments are live:
- Use `eas build --profile development` for dev builds
- Use `eas build --profile production` for production builds
