import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ALLOWED_FIELD_TYPES = [
  'Text',
  'Number',
  'Date',
  'Dropdown',
  'Checkbox',
  'Radio',
  'FileUpload',
];

export const listCustomFields = async (entity) => {
  return prisma.customField.findMany({
    where: { entity },
    orderBy: [{ group: 'asc' }, { order: 'asc' }],
  });
};

export const createCustomField = async (input, userId) => {
  const currentMax = await prisma.customField.aggregate({
    where: { entity: input.entity },
    _max: { order: true },
  });

  const orderValue =
    typeof input.order === 'number' ? input.order : (currentMax._max.order ?? 0) + 1;

  return prisma.customField.create({
    data: {
      ...input,
      order: orderValue,
      validation: input.validation ?? null,
      defaultValue: input.defaultValue ?? null,
      group: input.group ?? null,
      createdBy: userId,
      updatedBy: userId,
    },
  });
};

export const updateCustomField = async (id, input, userId) => {
  return prisma.customField.update({
    where: { id },
    data: {
      ...input,
      validation: input.validation ?? undefined,
      defaultValue: input.defaultValue ?? undefined,
      group: typeof input.group === 'undefined' ? undefined : input.group,
      updatedBy: userId,
    },
  });
};

export const deleteCustomField = async (id) => {
  await prisma.customField.delete({ where: { id } });
};

export const reorderCustomFields = async (updates) => {
  if (!updates.length) return;

  const ops = updates.map(({ id, order, group }) =>
    prisma.customField.update({
      where: { id },
      data: {
        order,
        group: typeof group === 'undefined' ? undefined : group,
      },
    })
  );

  await prisma.$transaction(ops);
};

export const isPrismaUniqueError = (error) => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
};

export const isPrismaNotFoundError = (error) => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
};
