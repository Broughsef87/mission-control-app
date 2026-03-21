const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Generating mock pulse data...');

  const agents = ['Max', 'Charles', 'Isaac', 'Silas', 'Ollie', 'Gabriel'];
  const actions = ['READ', 'WRITE', 'EXEC', 'GIT_COMMIT'];
  const paths = [
    'production/forge-agency-website/src/app/page.tsx',
    'mission-control/prisma/schema.prisma',
    'production/dad-strength-app/src/lib/supabase.ts',
    'research/market-analysis-nap-squeeze.md',
    'mission-control/src/app/api/pulse/route.ts'
  ];

  for (let i = 0; i < 15; i++) {
    await prisma.agentAction.create({
      data: {
        agent: agents[Math.floor(Math.random() * agents.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        path: paths[Math.floor(Math.random() * paths.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      }
    });
  }

  for (const agent of agents) {
    await prisma.tokenLog.create({
      data: {
        agent,
        model: 'gemini-3-pro-preview',
        tokens: Math.floor(Math.random() * 50000) + 10000,
        cost: Math.random() * 0.5 + 0.1,
        timestamp: new Date()
      }
    });
  }

  const services = [
    { name: 'Vercel', status: 'Healthy', message: 'Production deployed' },
    { name: 'YouTube', status: 'Healthy', message: 'Channel stats updated' },
    { name: 'GitHub', status: 'Healthy', message: 'All repos synced' },
    { name: 'Supabase', status: 'Healthy', message: 'DB connection nominal' }
  ];

  for (const s of services) {
    await prisma.externalStatus.create({
      data: {
        service: s.name,
        status: s.status,
        message: s.message
      }
    });
  }

  console.log('Mock pulse data generated successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
