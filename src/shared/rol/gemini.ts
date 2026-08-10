// ============================================================
// Gemini · Cliente mínimo usado por la API local y el Worker.
//  - modelo gemini-flash-latest
//  - key en header "x-goog-api-key" (no en la URL)
//  - rotación entre varias keys separadas por coma
//  - ante fallos reintenta todas las keys con backoff
// La API key vive solo en el servidor, nunca en el navegador.
// ============================================================

export const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const splitGeminiKeys = (raw?: string): string[] =>
  (raw ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

class GeminiError extends Error {
  readonly status?: number;
  constructor(status: number | undefined, message: string) {
    super(message);
    this.status = status;
  }
}

export async function callGemini(
  prompt: string,
  apiKeys: string[],
  wantJson: boolean,
  model: string,
  maxTokens = 2048,
  temperature = 0.9,
): Promise<string> {
  let currentKeyIndex = 0;
  let lastErr: unknown = null;

  const attempt = async (apiKey: string): Promise<string> => {
    const url = `${BASE}/models/${model}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }], role: 'user' }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(wantJson ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new GeminiError(res.status, `Gemini ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  };

  // Pase 1: rotación simple por todas las keys (sin espera).
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    try {
      const text = await attempt(apiKey);
      if (text.trim()) return text.trim();
    } catch (e) {
      lastErr = e;
    }
  }

  // Pase 2: backoff y reintento.
  for (let retry = 1; retry <= 2; retry++) {
    await sleep(2000 + retry * 1000);
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      try {
        const text = await attempt(apiKey);
        if (text.trim()) return text.trim();
      } catch (e) {
        lastErr = e;
      }
    }
  }

  throw lastErr ?? new Error('Gemini no devolvió texto.');
}
