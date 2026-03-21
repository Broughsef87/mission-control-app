import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const projectsPath = path.join(process.cwd(), 'projects.json')
  if (fs.existsSync(projectsPath)) {
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'))
    for (const p of projects) {
      await prisma.project.create({
        data: {
          name: p.name,
          status: p.status,
          description: p.description,
        }
      })
    }
    console.log('Seeded projects from JSON.')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
