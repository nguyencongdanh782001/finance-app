import prisma from "@/lib/db";

export const recordAudit = async (data: {
  actorId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  previousValue?: unknown;
  newValue?: unknown;
}) =>
  prisma.auditLog.create({
    data: {
      actorId: data.actorId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      previousValue:
        data.previousValue === undefined
          ? undefined
          : JSON.parse(JSON.stringify(data.previousValue)),
      newValue:
        data.newValue === undefined
          ? undefined
          : JSON.parse(JSON.stringify(data.newValue)),
    },
  });
