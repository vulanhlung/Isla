import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Created: ${user.createdAt}`);
    });
  } catch (error) {
    console.error('Error checking users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();