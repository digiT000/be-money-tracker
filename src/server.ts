import dotenv from 'dotenv';
import app from './app';
import prisma from './lib/prisma';

dotenv.config();

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log('Press Ctrl+C to stop the server.');

  console.log('--- Database Connection Test ---');
  // Optional: A simple check to see if Prisma can reach the DB on startup
  prisma
    .$connect()
    .then(() => console.log('Prisma connected to database successfully!'))
    .catch((e) => console.error('Prisma failed to connect on startup:', e));
  console.log('--- Server Started ---');
});

// Graceful shutdown: Disconnect Prisma Client when the application exits
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma Client disconnected. Server shutting down.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Prisma Client disconnected. Server shutting down.');
  process.exit(0);
});
