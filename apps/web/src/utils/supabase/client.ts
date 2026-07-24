import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zmpeiobdilrgtuzggzuj.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcGVpb2JkaWxyZ3R1emdnenVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NTc2MTUsImV4cCI6MjA5OTEzMzYxNX0.GRniMpKh5WW65JOmQl8znK_dme06iE8o_nIaGBV7-BI';
  return createBrowserClient(url, anonKey);
}
