const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const MAX_TOKENS_PER_REQUEST = 100;

export async function POST(request: Request) {
  let body: { tokens?: string[]; title?: string; message?: string; severity?: string; data?: Record<string, unknown> };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { tokens, title, message } = body;
  const safeTokens = (tokens ?? [])
    .map((t) => String(t ?? '').trim())
    .filter((t) => /^Expo(nent)?PushToken\[.+\]$/.test(t));
  const safeTitle = String(title ?? 'OceanEyes').trim();
  const safeMessage = String(message ?? '').trim();
  const isDanger = body.severity === 'danger';

  if (safeTokens.length === 0) {
    return new Response(JSON.stringify({ success: true, sent: 0, skipped: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const chunks: string[][] = [];
  for (let i = 0; i < safeTokens.length; i += MAX_TOKENS_PER_REQUEST) {
    chunks.push(safeTokens.slice(i, i + MAX_TOKENS_PER_REQUEST));
  }

  let sent = 0;
  try {
    for (const chunk of chunks) {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(
          chunk.map((to) => ({
            to,
            title: isDanger ? `⚠ ALERTA DE PELIGRO: ${safeTitle}` : safeTitle,
            body: safeMessage,
            sound: isDanger ? 'alarma_peligro.wav' : 'default',
            priority: isDanger ? 'high' : 'default',
            ttl: isDanger ? 300 : 3600,
            channelId: isDanger ? 'official-alerts' : 'oceaneyes',
            interruptionLevel: isDanger ? 'time-sensitive' : 'active',
            data: { kind: 'official-alert', severity: body.severity ?? 'info', ...(body.data ?? {}) } as Record<string, unknown>,
          })),
        ),
      });

      if (!res.ok) {
        console.error('Expo Push error:', res.status, await res.text());
        continue;
      }

      const result = (await res.json()) as { data?: Array<{ status?: string }> };
      sent += (result.data ?? []).filter((d) => d.status === 'ok').length;
    }

    return new Response(JSON.stringify({ success: true, sent, skipped: safeTokens.length - sent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Expo Push request failed:', err);
    return new Response(JSON.stringify({ error: 'Error de conexión con el servicio de push' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
