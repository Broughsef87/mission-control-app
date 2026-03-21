import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function syncPulse() {
  console.log('--- Mission Control Midnight Sync (Gabriel) ---');
  
  // 1. Sync Agent Actions from Recent Memory
  const memoryDir = '../memory';
  const today = new Date().toISOString().split('T')[0];
  const memoryFile = path.join(memoryDir, `${today}.md`);
  
  // We'll also check yesterday just in case
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  const yesterdayFile = path.join(memoryDir, `${yesterday}.md`);

  const processFile = async (filePath: string, dateStr: string) => {
    const memoryFilePath = path.join(process.cwd(), filePath);
    if (fs.existsSync(memoryFilePath)) {
      const content = fs.readFileSync(memoryFilePath, 'utf8');
      const agentMatches = Array.from(content.matchAll(/(?:-\s+\*\*(\w+)\s*\((.*?)\)\*\*:\s*(.*))|(?:##\s+(.*)\r?\n-\s+(.*))/g));
      console.log(`Found ${agentMatches.length} matches in ${filePath}`);
      for (const match of agentMatches) {
        const agentName = match[1];
        const role = match[2];
        const actionText = match[3];
        const projectTitle = match[4];
        const projectAction = match[5];
        
        const agent = agentName || 'System';
        const action = actionText || projectAction || 'LOG';
        const displayPath = projectTitle ? `[${projectTitle}] ${action}` : action;
        
        await prisma.agentAction.create({
          data: {
            agent,
            action: 'DEEP_WORK',
            path: displayPath.substring(0, 255),
            timestamp: new Date(dateStr)
          }
        });
        console.log(`Synced action for ${agent}: ${displayPath}`);
      }
    }
  };

  await processFile(yesterdayFile, yesterday);
  await processFile(memoryFile, today);

  // 2. Sync Projects from projects.json
  const projectsPath = './projects.json';
  if (fs.existsSync(projectsPath)) {
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    
    // Priority mapping for Prisma (String -> Int)
    const priorityMap: Record<string, number> = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4
    };

    for (const p of projects) {
      const priorityValue = typeof p.priority === 'string' 
        ? (priorityMap[p.priority.toUpperCase()] || 1)
        : (p.priority || 1);

      await prisma.project.upsert({
        where: { id: p.id || p.name },
        update: {
          status: p.status,
          description: p.description,
          priority: priorityValue
        },
        create: {
          id: p.id || p.name,
          name: p.name,
          status: p.status,
          description: p.description,
          priority: priorityValue
        }
      });
      console.log(`Synced project: ${p.name} (Priority: ${priorityValue})`);
    }
  }

  // 3. Sync External Status (Mocking for now as we don't have direct live probes in this script)
  const services = [
    { service: 'Tailscale', status: 'Unknown', message: 'Binary not found in path' },
    { service: 'Mission Control', status: 'Healthy', message: 'Sync script executed' }
  ];

  for (const s of services) {
    await prisma.externalStatus.create({
      data: s
    });
  }

  console.log('--- Sync Complete ---');
}

syncPulse()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
