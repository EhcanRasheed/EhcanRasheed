import { registerAs } from '@nestjs/config';
export default registerAs('database', () => {
  // Support Render's DATABASE_URL (single connection string)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port || '5432',
      username: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'amnazia1122',
    database: process.env.DB_NAME || 'interview',
  };
});
