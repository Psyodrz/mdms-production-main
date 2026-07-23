import { createClient } from '@/utils/supabase/server';

export const auth = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
      role: user.user_metadata?.role?.toUpperCase(),
      user_metadata: user.user_metadata,
    },
    accessToken: session.access_token,
  };
};
