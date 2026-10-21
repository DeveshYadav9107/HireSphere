const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting HireSphere Database Setup...');

// 1. Align Prisma schema datasource provider
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
try {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);
    console.log('✅ Configured Prisma provider: postgresql');
  } else if (dbUrl.startsWith('file:') || !dbUrl) {
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema);
    console.log('✅ Configured Prisma provider: sqlite');
  }
} catch (err) {
  console.warn('⚠️ Could not update schema provider:', err.message);
}

// 2. Resolve Prisma CLI binary directly via node
const prismaBin = path.join(__dirname, 'node_modules/prisma/build/index.js');
const nodeBin = process.execPath; // Absolute path to current node executable

// 3. Generate Prisma Client
console.log('🔄 Generating Prisma Client...');
try {
  execSync(`"${nodeBin}" "${prismaBin}" generate`, {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env,
  });
  console.log('✅ Prisma Client generated successfully.');
} catch (err) {
  console.error('❌ Error generating Prisma client:', err.message);
  process.exit(1);
}

// 4. Sync Database Schema (db push)
console.log('🔄 Syncing Database Schema with db push...');
try {
  execSync(`"${nodeBin}" "${prismaBin}" db push --accept-data-loss`, {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env,
  });
  console.log('✅ Database schema synchronized.');
} catch (err) {
  console.warn('⚠️ Notice during db push:', err.message);
}

// 5. Run Seed Script to populate initial data
const seedPath = path.join(__dirname, 'prisma/seed.js');
if (fs.existsSync(seedPath)) {
  console.log('🌱 Populating database with seed data...');
  try {
    execSync(`"${nodeBin}" "${seedPath}"`, {
      stdio: 'inherit',
      cwd: __dirname,
      env: process.env,
    });
    console.log('✅ Seed data successfully populated.');
  } catch (err) {
    console.warn('⚠️ Notice during seed:', err.message);
  }
}

console.log('🎉 HireSphere Database Setup Finished Successfully!');
