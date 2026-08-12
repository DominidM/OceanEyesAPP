import { handleAuthDelete } from '@shared/gateway/municipal-signup';

// POST /api/auth/delete (dev local). En producción lo maneja el Worker (src/worker.ts).
export async function POST(request: Request) {
  return handleAuthDelete(request, {
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  });
}