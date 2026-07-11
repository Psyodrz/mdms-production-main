import { PrismaClient, FieldType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding talent categories...');

  // 1. Model Category
  const modelCategory = await prisma.talentCategory.upsert({
    where: { slug: 'model' },
    update: {},
    create: {
      slug: 'model',
      name: 'Model',
      description: 'Fashion, Editorial, Commercial, and Fitness Models',
    },
  });

  const modelFields = [
    { name: 'gender', label: 'Gender', type: FieldType.SELECT, options: ['Male', 'Female', 'Non-Binary', 'Other'], isRequired: true, order: 1 },
    { name: 'height', label: 'Height (cm)', type: FieldType.NUMBER, isRequired: true, order: 2 },
    { name: 'weight', label: 'Weight (kg)', type: FieldType.NUMBER, isRequired: true, order: 3 },
    { name: 'chest', label: 'Chest/Bust (inches)', type: FieldType.NUMBER, isRequired: false, order: 4 },
    { name: 'waist', label: 'Waist (inches)', type: FieldType.NUMBER, isRequired: false, order: 5 },
    { name: 'hips', label: 'Hips (inches)', type: FieldType.NUMBER, isRequired: false, order: 6 },
    { name: 'shoeSize', label: 'Shoe Size (UK/IN)', type: FieldType.NUMBER, isRequired: false, order: 7 },
    { name: 'eyeColor', label: 'Eye Color', type: FieldType.SELECT, options: ['Black', 'Brown', 'Blue', 'Green', 'Hazel', 'Grey'], isRequired: false, order: 8 },
    { name: 'hairColor', label: 'Hair Color', type: FieldType.SELECT, options: ['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'White', 'Other'], isRequired: false, order: 9 },
    { name: 'skinTone', label: 'Skin Tone', type: FieldType.SELECT, options: ['Fair', 'Medium', 'Olive', 'Brown', 'Dark'], isRequired: false, order: 10 },
  ];

  for (const field of modelFields) {
    await prisma.categoryField.upsert({
      where: {
        categoryId_name: {
          categoryId: modelCategory.id,
          name: field.name,
        }
      },
      update: {
        label: field.label,
        type: field.type,
        options: field.options || null,
        isRequired: field.isRequired,
        order: field.order,
      },
      create: {
        categoryId: modelCategory.id,
        name: field.name,
        label: field.label,
        type: field.type,
        options: field.options || null,
        isRequired: field.isRequired,
        order: field.order,
      }
    });
  }

  // 2. Actor Category
  const actorCategory = await prisma.talentCategory.upsert({
    where: { slug: 'actor' },
    update: {},
    create: {
      slug: 'actor',
      name: 'Actor',
      description: 'Film, TV, Theater, and Voice Actors',
    },
  });

  const actorFields = [
    { name: 'gender', label: 'Gender', type: FieldType.SELECT, options: ['Male', 'Female', 'Non-Binary', 'Other'], isRequired: true, order: 1 },
    { name: 'playingAgeMin', label: 'Playing Age Minimum', type: FieldType.NUMBER, isRequired: true, order: 2 },
    { name: 'playingAgeMax', label: 'Playing Age Maximum', type: FieldType.NUMBER, isRequired: true, order: 3 },
    { name: 'actingStyles', label: 'Acting Styles', type: FieldType.MULTISELECT, options: ['Method', 'Classical', 'Meisner', 'Stanislavski', 'Improv', 'Voice Over'], isRequired: false, order: 4 },
  ];

  for (const field of actorFields) {
    await prisma.categoryField.upsert({
      where: {
        categoryId_name: {
          categoryId: actorCategory.id,
          name: field.name,
        }
      },
      update: {
        label: field.label,
        type: field.type,
        options: field.options || null,
        isRequired: field.isRequired,
        order: field.order,
      },
      create: {
        categoryId: actorCategory.id,
        name: field.name,
        label: field.label,
        type: field.type,
        options: field.options || null,
        isRequired: field.isRequired,
        order: field.order,
      }
    });
  }

  console.log('✅ Talent categories and fields seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
