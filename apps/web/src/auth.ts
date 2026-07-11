import { createClient } from '@/utils/supabase/server';

export const auth = async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name,
      role: session.user.user_metadata?.role?.toUpperCase(),
    },
    accessToken: session.access_token,
  };
};
