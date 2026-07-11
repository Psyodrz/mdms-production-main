/**
 * Creates the core accounts in BOTH Supabase Auth (so they can log in through
 * the website) and Prisma (with matching ids + roles). Idempotent.
 * Run: node prisma/seed-supabase-auth-users.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

const projectId = process.env.SUPABASE_PROJECT_ID;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (projectId ? `https://${projectId}.supabase.co` : undefined);
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error('SUPABASE URL / SERVICE_ROLE_KEY missing in env');

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// Passwords are read from the environment — never hardcode secrets in source.
const requireEnv = (key) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};
const ACCOUNTS = [
  { email: 'superadmin@mpproduction.com', password: requireEnv('SUPER_ADMIN_PASSWORD'), role: 'super_admin', firstName: 'Super', lastName: 'Admin' },
  { email: 'admin@mpproduction.com',      password: requireEnv('ADMIN_PASSWORD'),       role: 'admin',       firstName: 'Studio', lastName: 'Admin' },
  { email: 'client@example.com',          password: requireEnv('CLIENT_PASSWORD'),      role: 'client',      firstName: 'Demo',   lastName: 'Client' },
  { email: 'talent@example.com',          password: requireEnv('TALENT_PASSWORD'),      role: 'talent',      firstName: 'Demo',   lastName: 'Talent' },
];

async function findAuthUserByEmail(email) {
  // Paginate through auth users to find an existing match.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureAuthUser(acc) {
  const meta = { role: acc.role, full_name: `${acc.firstName} ${acc.lastName}` };
  const existing = await findAuthUserByEmail(acc.email);
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, { password: acc.password, email_confirm: true, user_metadata: meta });
    return existing.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({ email: acc.email, password: acc.password, email_confirm: true, user_metadata: meta });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  for (const acc of ACCOUNTS) {
    const authId = await ensureAuthUser(acc);
    const role = acc.role.toUpperCase();

    // Reconcile Prisma: make the Prisma user id match the Supabase auth id so
    // token.sub resolves to the same record (FKs cascade on id update).
    const byEmail = await prisma.user.findUnique({ where: { email: acc.email } });
    if (byEmail && byEmail.id !== authId) {
      await prisma.user.update({ where: { email: acc.email }, data: { id: authId } });
    }
    await prisma.user.upsert({
      where: { id: authId },
      update: { role, isActive: true, firstName: acc.firstName, lastName: acc.lastName },
      create: { id: authId, email: acc.email, firstName: acc.firstName, lastName: acc.lastName, role, isActive: true },
    });
    console.log(`✅ ${acc.email} → Supabase Auth + Prisma (${role}) id=${authId}`);
  }
  console.log('\n🎉 Auth users integrated. Log in at /login with the credentials below.');
  ACCOUNTS.forEach((a) => console.log(`   ${a.email} / ${a.password}  [${a.role}]`));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
