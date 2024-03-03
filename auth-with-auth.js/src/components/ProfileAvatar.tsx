'use client';
import { useAuth } from '@/providers/AuthProvider';

export function ProfileAvatar() {
  const { session } = useAuth();

  if (!session?.user) return null;
  return (
    <img
      width={48}
      height={48}
      src={session.user.image ?? undefined}
      alt="avatar"
    />
  );
}
