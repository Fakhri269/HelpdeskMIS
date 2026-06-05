import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding master data...')

  // 1. Master SLA
  const slas = [
    { priority: 'Low', hours: 72 },
    { priority: 'Medium', hours: 24 },
    { priority: 'High', hours: 4 },
    { priority: 'Critical', hours: 1 },
  ]
  for (const sla of slas) {
    await prisma.masterSLA.upsert({
      where: { priority: sla.priority },
      update: {},
      create: sla,
    })
  }

  // 2. Master Kategori
  const categories = [
    'Perbaikan Komputer',
    'Jaringan/Internet',
    'Software/Aplikasi',
    'Data/Akses/Password',
    'Hardware Peripheral',
    'Printer/Scanner',
    'GIS/Peta',
    'Lainnya',
  ]
  for (const cat of categories) {
    await prisma.masterKategori.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    })
  }

  // 3. Roles
  const roles = [
    { name: 'superadmin', description: 'Super Administrator' },
    { name: 'user', description: 'User Cabang/Unit' },
    { name: 'helpdesk_manager', description: 'Manajer MIS' },
    { name: 'helpdesk_asmen', description: 'Asisten Manajer MIS' },
    { name: 'helpdesk_staff', description: 'Staff MIS' },
  ]
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }

  // 4. Unit Kerja
  const unitCabang = await prisma.unitKerja.upsert({
    where: { name: 'Cabang' },
    update: {},
    create: { name: 'Cabang' },
  })
  const unitPusat = await prisma.unitKerja.upsert({
    where: { name: 'Pusat' },
    update: {},
    create: { name: 'Pusat' },
  })

  // 5. Sub Unit Kerja
  const subUnits = [
    'Sub Unit Hardware dan Jaringan',
    'Sub Unit Software dan Database',
    'Sub Unit GIS',
  ]
  for (const sub of subUnits) {
    await prisma.subUnitKerja.upsert({
      where: { name_unitKerjaId: { name: sub, unitKerjaId: unitPusat.id } },
      update: {},
      create: { name: sub, unitKerjaId: unitPusat.id },
    })
  }

  // 6. Superadmin User
  const superadminRole = await prisma.role.findUnique({ where: { name: 'superadmin' } })
  if (superadminRole) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10)
    await prisma.user.upsert({
      where: { email: 'superadmin@tirtakahuripan.com' },
      update: {},
      create: {
        name: 'Super Administrator',
        email: 'superadmin@tirtakahuripan.com',
        password: hashedPassword,
        roleId: superadminRole.id,
        unitKerjaId: unitPusat.id,
        position: 'Superadmin',
      },
    })
  }

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
