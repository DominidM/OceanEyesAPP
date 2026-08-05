import { useAuth } from '@/shared/firebase/auth-context';

export function useGuestStatus(): boolean {
  const { user } = useAuth();
  return !user;
}
