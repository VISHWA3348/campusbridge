import { PrismaClient } from '@prisma/client';

const getSanitizedDbUrl = (url) => {
  if (!url) return url;
  try {
    const prefix = 'postgresql://';
    if (!url.startsWith(prefix)) return url;
    
    const remainder = url.slice(prefix.length);
    const firstColonIdx = remainder.indexOf(':');
    if (firstColonIdx === -1) return url;
    
    const lastAtIdx = remainder.lastIndexOf('@');
    if (lastAtIdx === -1 || lastAtIdx <= firstColonIdx) return url;
    
    const user = remainder.slice(0, firstColonIdx);
    const rawPassword = remainder.slice(firstColonIdx + 1, lastAtIdx);
    const rest = remainder.slice(lastAtIdx);
    
    let encodedPassword = rawPassword;
    if (rawPassword.includes('@') || rawPassword.includes(':') || rawPassword.includes('/') || rawPassword.includes('?') || rawPassword.includes('#')) {
      if (!rawPassword.includes('%')) {
        encodedPassword = encodeURIComponent(rawPassword);
      }
    }
    
    // Check if it is a pooler URL (contains pooler.supabase.com or port 6543, or user has a project suffix)
    if (user.includes('.') && (url.includes('pooler.supabase.com') || url.includes(':6543'))) {
      const parts = user.split('.');
      const mainUser = parts[0]; // postgres
      const projectId = parts[1]; // oukaipvuibsgchpwkwzu
      
      const slashIdx = rest.indexOf('/', 1); // find slash after the '@'
      let dbNameAndOptions = '/postgres?sslmode=require';
      if (slashIdx !== -1) {
        dbNameAndOptions = rest.slice(slashIdx);
      }
      
      const directHost = `db.${projectId}.supabase.co:5432`;
      console.log(`[DB CONFIG] Converting pooler URL to direct connection: db.${projectId}.supabase.co:5432`);
      return `${prefix}${mainUser}:${encodedPassword}@${directHost}${dbNameAndOptions}`;
    }
    
    return `${prefix}${user}:${encodedPassword}${rest}`;
  } catch (e) {
    console.error('Failed to sanitize DATABASE_URL:', e.message);
    return url;
  }
};

const databaseUrl = getSanitizedDbUrl(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ['error'],
});

// Auto-reconnect on connection drop (important for Render + Supabase)
async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$connect();
      console.log('◇ Prisma connected to database');
      return;
    } catch (err) {
      console.error(`◆ DB connection attempt ${i}/${retries} failed:`, err.message);
      if (i < retries) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Could not connect to database after multiple retries.');
}

export { connectWithRetry, databaseUrl };
export default prisma;

