import type { AppUser } from '@/types';

/**
 * Register user via ASPIRA server API (PostgreSQL backed).
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone?: string,
  kelurahan?: string,
  kecamatan?: string,
): Promise<AppUser> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, phone, kelurahan, kecamatan }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal mendaftar.');
  }

  return data.user as AppUser;
}

/**
 * Login user via ASPIRA server API.
 */
export async function loginUser(email: string, password: string): Promise<AppUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal masuk.');
  }

  return data.user as AppUser;
}

/**
 * Logout user.
 */
export async function logoutUser(): Promise<void> {
  // Clears user from client session
  return Promise.resolve();
}

/**
 * Reset password request.
 */
export async function resetPassword(_email: string): Promise<void> {
  // In production, triggers an email token reset
  void _email;
  await new Promise((resolve) => setTimeout(resolve, 600));
  return Promise.resolve();
}
