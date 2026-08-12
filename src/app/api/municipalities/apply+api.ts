import { handleMunicipalityApply } from '@shared/gateway/municipal-signup';

// POST /api/municipalities/apply (dev local). En producción lo maneja el Worker (src/worker.ts).
export async function POST(request: Request) {
  return handleMunicipalityApply(request, {
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  });
}