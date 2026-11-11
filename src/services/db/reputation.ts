import type { Prisma } from '@prisma/client';
import { ReputationLevel, ActivityType } from '@prisma/client';

/**
 * Determine reputation level from total contribution points.
 * Thresholds:
 * Bronze:   < 100
 * Silver:   100 - 299
 * Gold:     300 - 999
 * Diamond:  1000+
 */
export function calculateReputationLevel(points: number): ReputationLevel {
  if (points >= 1000) return ReputationLevel.DIAMOND;
  if (points >= 300) return ReputationLevel.GOLD;
  if (points >= 100) return ReputationLevel.SILVER;
  return ReputationLevel.BRONZE;
}

/**
 * Helper to award points and recalculate reputation level atomically within a transaction.
 */
export async function awardPointsAndUpdateLevel(
  tx: Prisma.TransactionClient,
  userId: string,
  points: number,
  activityType: ActivityType,
  referenceId?: string,
  idempotencyKey?: string,
) {
  const key = idempotencyKey || `tx-${userId}-${activityType}-${referenceId || Date.now()}`;

  const existing = await tx.pointTransaction.findUnique({
    where: { idempotencyKey: key },
  });
  if (existing) return;

  // 1. Create Point Transaction ledger record
  await tx.pointTransaction.create({
    data: {
      userId,
      points,
      activityType,
      referenceId,
      idempotencyKey: key,
    },
  });

  // 2. Fetch current points and calculate new total
  const currentUser = await tx.user.findUnique({
    where: { id: userId },
    select: { contributionPoints: true },
  });

  const newPoints = (currentUser?.contributionPoints ?? 0) + points;
  const newLevel = calculateReputationLevel(newPoints);

  // 3. Update User points and reputation tier
  await tx.user.update({
    where: { id: userId },
    data: {
      contributionPoints: newPoints,
      reputationLevel: newLevel,
    },
  });
}
