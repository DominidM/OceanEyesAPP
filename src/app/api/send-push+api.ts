import { handleSendPush } from '@shared/gateway/send-push';

// Ruta de desarrollo (expo start --web). En producción la atiende src/worker.ts con la misma lógica.
export async function POST(request: Request) {
  return handleSendPush(request, {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  });
}
