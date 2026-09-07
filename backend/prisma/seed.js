const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function splitEqually(amount, memberIds) {
  const n = memberIds.length;
  const totalCents = Math.round(round2(amount) * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents - baseCents * n;
  return memberIds.map((memberId, idx) => ({
    memberId,
    amount: (baseCents + (idx < remainderCents ? 1 : 0)) / 100,
  }));
}

async function main() {
  console.log('Seeding FairShare demo data...');

  const email = 'demo@fairshare.app';
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Demo user already exists — skipping seed.');
    console.log('(Delete backend/prisma/dev.db and re-run migrate + seed to start fresh.)');
    return;
  }

  const password = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({ data: { name: 'Demo User', email, password } });

  const group = await prisma.group.create({
    data: { name: 'Goa Trip', type: 'trip', currency: 'INR', createdBy: user.id },
  });

  // Member "A" is linked to the demo user's account; B–J are placeholder
  // group members (the app supports this the same way it would for anyone
  // added without their own login — see GroupMember.userId being nullable).
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const members = [];
  for (const n of names) {
    const member = await prisma.groupMember.create({
      data: {
        groupId: group.id,
        displayName: n,
        initial: n,
        userId: n === 'A' ? user.id : null,
      },
    });
    members.push(member);
  }
  const byName = Object.fromEntries(members.map((m) => [m.displayName, m]));
  const allIds = members.map((m) => m.id);

  // Concert Tickets — ₹12,000, paid by A, equal split among A–H (8 of 10 people)
  const concertIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((n) => byName[n].id);
  await prisma.expense.create({
    data: {
      groupId: group.id,
      title: 'Concert Tickets',
      amount: 12000,
      paidById: byName.A.id,
      splitType: 'equal',
      participants: { create: splitEqually(12000, concertIds) },
    },
  });

  // Food — ₹5,000, paid by H, advanced split:
  // Vegetarian (A, B) → ₹1,100 combined · Non-Vegetarian (C–J) → ₹3,900 combined
  const vegRows = splitEqually(1100, ['A', 'B'].map((n) => byName[n].id));
  const nonVegRows = splitEqually(
    3900,
    ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((n) => byName[n].id)
  );
  await prisma.expense.create({
    data: {
      groupId: group.id,
      title: 'Food',
      amount: 5000,
      paidById: byName.H.id,
      splitType: 'unequal',
      participants: { create: [...vegRows, ...nonVegRows] },
    },
  });

  // Hotel — ₹30,000 total (₹15,000/night × 2 nights), paid by J, split across all 10
  await prisma.expense.create({
    data: {
      groupId: group.id,
      title: 'Hotel',
      amount: 30000,
      paidById: byName.J.id,
      splitType: 'equal',
      participants: { create: splitEqually(30000, allIds) },
    },
  });

  // Flights — ₹12,000, paid by A, split equally across all 10
  await prisma.expense.create({
    data: {
      groupId: group.id,
      title: 'Flights',
      amount: 12000,
      paidById: byName.A.id,
      splitType: 'equal',
      participants: { create: splitEqually(12000, allIds) },
    },
  });

  console.log('Seed complete.');
  console.log('');
  console.log('Demo login:');
  console.log('  email:    demo@fairshare.app');
  console.log('  password: password123');
  console.log('');
  console.log('Group "Goa Trip" created with members A–J and 4 expenses (₹59,000 total).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
