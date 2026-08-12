import { handleAuthSignup } from '@shared/gateway/municipal-signup';

// POST /api/auth/signup (dev local). En producción lo maneja el Worker (src/worker.ts).
export async function POST(request: Request) {
  return handleAuthSignup(request, {
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  });
}