import { PrismaClient, Role, PrescriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function makeCode() {
  return 'RX-' + randomUUID().split('-')[0].toUpperCase();
}

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Usuarios base ──────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: await hash('admin123'),
      name: 'Admin Principal',
      role: Role.admin,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr@test.com' },
    update: {},
    create: {
      email: 'dr@test.com',
      password: await hash('dr123'),
      name: 'Dr. Carlos Méndez',
      role: Role.doctor,
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      email: 'patient@test.com',
      password: await hash('patient123'),
      name: 'Laura Gómez',
      role: Role.patient,
    },
  });

  // ── Perfiles ───────────────────────────────────────────────
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: { userId: doctorUser.id, specialty: 'Medicina General' },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      birthDate: new Date('1990-05-15'),
    },
  });

  // ── Prescripciones de ejemplo ──────────────────────────────
  const prescriptions = [
    {
      status: PrescriptionStatus.pending,
      notes: 'Tomar con abundante agua',
      daysAgo: 1,
      items: [
        {
          name: 'Amoxicilina 500mg',
          dosage: '1 c/8h',
          quantity: 21,
          instructions: 'Después de comer',
        },
        {
          name: 'Ibuprofeno 400mg',
          dosage: '1 c/6h',
          quantity: 12,
          instructions: 'Con comida',
        },
      ],
    },
    {
      status: PrescriptionStatus.pending,
      notes: 'Control en 15 días',
      daysAgo: 3,
      items: [
        {
          name: 'Loratadina 10mg',
          dosage: '1 al día',
          quantity: 30,
          instructions: 'En ayunas',
        },
      ],
    },
    {
      status: PrescriptionStatus.consumed,
      notes: 'Tratamiento completado',
      daysAgo: 10,
      items: [
        {
          name: 'Paracetamol 500mg',
          dosage: '1 c/8h',
          quantity: 15,
          instructions: 'Si hay fiebre',
        },
        {
          name: 'Vitamina C 1g',
          dosage: '1 al día',
          quantity: 7,
          instructions: 'Con el desayuno',
        },
      ],
    },
    {
      status: PrescriptionStatus.consumed,
      notes: null,
      daysAgo: 20,
      items: [
        {
          name: 'Metformina 850mg',
          dosage: '1 c/12h',
          quantity: 60,
          instructions: 'Con alimentos',
        },
      ],
    },
    {
      status: PrescriptionStatus.pending,
      notes: 'Revisar presión arterial semanalmente',
      daysAgo: 0,
      items: [
        {
          name: 'Enalapril 10mg',
          dosage: '1 al día',
          quantity: 30,
          instructions: 'Misma hora',
        },
        {
          name: 'Hidroclorotiazida 25mg',
          dosage: '1 al día',
          quantity: 30,
          instructions: 'Por la mañana',
        },
      ],
    },
    {
      status: PrescriptionStatus.consumed,
      daysAgo: 30,
      notes: 'Esquema completo',
      items: [
        {
          name: 'Azitromicina 500mg',
          dosage: '1 al día',
          quantity: 3,
          instructions: 'Antes de dormir',
        },
      ],
    },
  ];

  for (const p of prescriptions) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - p.daysAgo);

    await prisma.prescription.create({
      data: {
        code: makeCode(),
        status: p.status,
        notes: p.notes,
        createdAt,
        consumedAt: p.status === PrescriptionStatus.consumed ? createdAt : null,
        authorId: doctor.id,
        patientId: patient.id,
        items: { create: p.items },
      },
    });
  }

  console.log('✅ Seed completado');
  console.log('   admin@test.com   / admin123');
  console.log('   dr@test.com      / dr123');
  console.log('   patient@test.com / patient123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
