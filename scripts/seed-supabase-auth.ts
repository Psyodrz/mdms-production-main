import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_PROJECT_ID 
  ? `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co` 
  : '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const usersToSeed = [
  {
    email: 'superadmin@mpproduction.com',
    password: 'Admin@123',
    role: 'super_admin',
    full_name: 'Super Admin',
  },
  {
    email: 'admin@mpproduction.com',
    password: 'Admin@123',
    role: 'admin',
    full_name: 'Studio Admin',
  },
  {
    email: 'client@example.com',
    password: 'Admin@123',
    role: 'client',
    full_name: 'Demo Client',
  },
  {
    email: 'talent@example.com',
    password: 'Admin@123',
    role: 'model',
    full_name: 'Demo Model',
  },
];

async function seed() {
  console.log('🌱 Seeding Supabase Auth Users...');

  for (const u of usersToSeed) {
    // 1. Check if user already exists in Supabase Auth to avoid duplicates
    // We can't directly check email existence cleanly with the admin API without listUsers,
    // so we'll just try to create and catch the error if they exist.
    
    console.log(`Creating user: ${u.email} [Role: ${u.role}]`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        role: u.role,
        full_name: u.full_name,
      },
    });

    if (error) {
      if (error?.message?.includes('already exists')) {
        console.log(`⚠️  User ${u.email} already exists in Supabase Auth.`);
      } else {
        console.error(`❌ Failed to create ${u.email}:`, error);
      }
    } else {
      console.log(`✅ Successfully created ${u.email} (ID: ${data.user.id})`);
    }
  }

  console.log('✨ Supabase Auth Seeding Complete!');
}

seed();
