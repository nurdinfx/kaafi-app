const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../services/api/prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';

  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    if (content.includes('provider = "sqlite"')) {
      content = content.replace(/provider\s*=\s*["']sqlite["']/, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, content);
      console.log('[prepare-prisma] Configured schema.prisma for PostgreSQL');
    }
  } else if (dbUrl.startsWith('file:') || (!dbUrl && content.includes('provider = "postgresql"'))) {
    if (content.includes('provider = "postgresql"')) {
      content = content.replace(/provider\s*=\s*["']postgresql["']/, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, content);
      console.log('[prepare-prisma] Configured schema.prisma for SQLite');
    }
  }
}

