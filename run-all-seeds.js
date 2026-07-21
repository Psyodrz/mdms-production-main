const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from apps/api/.env.local
const envPath = path.join(__dirname, 'apps', 'api', '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading env from ${envPath}...`);
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

// Override passwords if not set (needed for seed.ts)
process.env.SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'MpDx5Vs8kW13bk!7';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MpDx5Vs8kW13bk!7';
process.env.CLIENT_PASSWORD = process.env.CLIENT_PASSWORD || 'MpDx5Vs8kW13bk!7';
process.env.TALENT_PASSWORD = process.env.TALENT_PASSWORD || 'MpDx5Vs8kW13bk!7';

const seeds = [
  { file: 'prisma/seed.ts', isTs: true },
  { file: 'prisma/seed-cms-content.js', isTs: false },
  { file: 'prisma/seed-command-center.js', isTs: false },
  { file: 'prisma/seed-featured-talents.ts', isTs: true },
  { file: 'prisma/seed-client-projects.ts', isTs: true },
  { file: 'prisma/seed-100-talents.ts', isTs: true }
];

console.log('Starting seed sequence targeting remote database...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Loaded (masked)' : 'Missing');

for (const seed of seeds) {
  const filePath = path.join(__dirname, seed.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Seed file not found: ${seed.file}`);
    continue;
  }

  console.log(`\n========================================`);
  console.log(`🌱 Running: ${seed.file}`);
  console.log(`========================================`);

  try {
    // Since ts-node runs inside apps/api context via --filter, we must use relative path from apps/api
    const relativePath = `../../${seed.file}`;
    const cmd = seed.isTs 
      ? `pnpm --filter @mdms/api exec ts-node --compiler-options "{\\\"module\\\":\\\"commonjs\\\"}" "${relativePath}"`
      : `node "${filePath}"`;
      
    execSync(cmd, { stdio: 'inherit', env: process.env });
    console.log(`✅ Completed: ${seed.file}`);
  } catch (error) {
    console.error(`❌ Error running seed ${seed.file}:`, error.message);
  }
}

console.log('\n🎉 All seed scripts executed!');
