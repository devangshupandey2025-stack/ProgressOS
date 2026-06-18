import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const email = 'demo@progressos.dev';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Demo user already exists — skipping creation.');
    console.log('Username: demo');
    return;
  }

  const user = await prisma.user.create({
    data: {
      clerkId: 'demo_clerk_id',
      email,
      name: 'Demo User',
      username: 'demo',
      totalXP: 12450,
      currentStreak: 23,
      longestStreak: 45,
      leetcodeUsername: 'demouser_lc',
      codeforcesHandle: 'demouser_cf',
      githubUsername: 'demouser_gh',
    },
  });

  const activities = [
    // DSA activities — daily LeetCode for 30 days
    ...Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i));
      return { userId: user.id, title: 'LeetCode Daily Challenge', category: 'DSA', xp: 45, hours: 1.5, createdAt: d };
    }),
    // DSA contests
    ...Array.from({ length: 4 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (89 - i * 21));
      return { userId: user.id, title: 'Weekly Contest', category: 'DSA', xp: 120, hours: 2, createdAt: d };
    }),
    // Project work
    ...Array.from({ length: 8 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (59 - i * 7));
      return { userId: user.id, title: `Project Sprint — Feature #${i + 1}`, category: 'PROJECT', xp: 80, hours: 3, createdAt: d };
    }),
    // Open source contributions
    ...Array.from({ length: 5 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (44 - i * 9));
      return { userId: user.id, title: `Open Source PR — ${['bugfix', 'docs', 'feature', 'refactor', 'test'][i]}`, category: 'OPEN_SOURCE', xp: 60, hours: 2, createdAt: d };
    }),
    // Core CS study
    ...Array.from({ length: 10 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (69 - i * 7));
      return { userId: user.id, title: `Core CS — ${['OS', 'DBMS', 'Networks', 'OOP', 'System Design', 'SQL', 'Linux', 'Git', 'Docker', 'CI/CD'][i]}`, category: 'ACADEMICS', xp: 35, hours: 1.5, createdAt: d };
    }),
  ];

  for (const act of activities) {
    await prisma.activity.create({ data: act });
  }

  const goals = [
    { userId: user.id, source: 'LEETCODE', title: 'Reach 500 LeetCode Solved', target: 500, current: 458, unit: 'solved', deadline: new Date('2026-08-01') },
    { userId: user.id, source: 'CODEFORCES', title: 'Reach 1600 (Expert)', target: 1600, current: 1540, unit: 'rating', deadline: new Date('2026-09-01') },
    { userId: user.id, source: 'GITHUB', title: '100 GitHub Contributions', target: 100, current: 72, unit: 'contributions', deadline: new Date('2026-07-15') },
    { userId: user.id, source: 'CUSTOM', title: 'Complete 8 Projects', target: 8, current: 6, unit: 'projects', deadline: new Date('2026-12-01') },
  ];

  for (const g of goals) {
    await prisma.goal.create({ data: g });
  }

  console.log('✅ Demo user created with 57 activities, 4 goals.');
  console.log('   Username: demo');
  console.log('   LeetCode Solved: 458');
  console.log('   Codeforces Rating: 1540');
  console.log('   Total XP: 12,450');
  console.log('   Longest Streak: 45 days');
}

seed()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
