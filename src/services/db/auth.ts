import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { User, Role } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  kelurahan?: string;
  kecamatan?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  phone: string | null;
  isVerifiedReporter: boolean;
  contributionPoints: number;
  reputationLevel: string;
  createdAt: string;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    kelurahan: user.kelurahan,
    kecamatan: user.kecamatan,
    phone: user.phone,
    isVerifiedReporter: user.isVerifiedReporter,
    contributionPoints: user.contributionPoints,
    reputationLevel: user.reputationLevel,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Register a new citizen account.
 * Crucial rule from AGENTS.md: Public registration must ALWAYS assign role USER.
 */
export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau masuk.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      passwordHash,
      name: input.name.trim(),
      role: 'USER', // Always default to USER
      kelurahan: input.kelurahan,
      kecamatan: input.kecamatan,
      phone: input.phone,
      contributionPoints: 10, // Welcome points
    },
  });

  // Record initial welcome point transaction
  await prisma.pointTransaction.create({
    data: {
      userId: user.id,
      points: 10,
      activityType: 'USEFUL_DISCUSSION',
      idempotencyKey: `welcome-${user.id}`,
    },
  });

  return toSafeUser(user);
}

/**
 * Authenticate citizen with email and password.
 */
export async function authenticateUser(input: LoginInput): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });

  if (!user) {
    throw new Error('Email atau kata sandi tidak valid.');
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new Error('Email atau kata sandi tidak valid.');
  }

  return toSafeUser(user);
}

/**
 * Get user profile by ID.
 */
export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ? toSafeUser(user) : null;
}
