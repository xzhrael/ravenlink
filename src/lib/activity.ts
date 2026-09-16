import { prisma } from "@/lib/prisma";

export type ActivityLogType =
  | "USER_REGISTERED"
  | "LINK_CREATED"
  | "USER_DELETED_BY_ADMIN"
  | "USER_SELF_DELETED";

export interface CreateActivityLogParams {
  type: ActivityLogType;
  title: string;
  subtitle?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Log a platform activity to the ActivityLog table.
 * Non-blocking and catches errors so main operations are not interrupted.
 */
export async function recordActivityLog(params: CreateActivityLogParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        type: params.type,
        title: params.title,
        subtitle: params.subtitle || null,
        actorId: params.actorId || null,
        actorName: params.actorName || null,
        targetId: params.targetId || null,
        targetName: params.targetName || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
    return null;
  }
}
