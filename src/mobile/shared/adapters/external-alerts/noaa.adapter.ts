import type { ExternalAlertDTO, ExternalAlertSource } from './types';

const NOAA_ALERTS_URL = 'https://api.weather.gov/alerts/active?event=Tsunami%20Warning&status=actual&message_type=Alert&limit=20';

const PACIFIC_KEYWORDS = ['pacific', 'pacifico', 'peru', 'chile', 'ecuador', 'south america', 'america del sur', 'hawaii', 'guam', 'samoa'];

function mentionsPacific(text: string): boolean {
  const lower = text.toLowerCase();
  return PACIFIC_KEYWORDS.some((kw) => lower.includes(kw));
}

export function createNoaaAdapter(): ExternalAlertSource {
  return {
    sourceName: 'noaa',
    async fetch(): Promise<ExternalAlertDTO[]> {
      try {
        const res = await fetch(NOAA_ALERTS_URL, {
          headers: { 'User-Agent': '(OceanEyesApp, contact@oceaneyes.app)' },
        });
        if (!res.ok) return [];
        const json = (await res.json()) as { features: any[] };
        const results: ExternalAlertDTO[] = [];

        for (const f of json.features ?? []) {
          const props = f.properties ?? {};
          const headline = String(props.headline ?? '');
          const description = String(props.description ?? '').slice(0, 400);
          const areaDesc = String(props.areaDesc ?? '');
          const id = String(props.id ?? '');

          if (!id) continue;
          const combinedText = `${headline} ${areaDesc} ${description}`;
          if (!mentionsPacific(combinedText)) continue;

          let coords: { latitude: number; longitude: number } | undefined;
          if (f.geometry?.type === 'Point' && Array.isArray(f.geometry.coordinates)) {
            const [lng, lat] = f.geometry.coordinates;
            coords = { latitude: lat, longitude: lng };
          }

          results.push({
            externalId: `noaa_${id}`,
            title: headline || 'Alerta de Tsunami (NOAA)',
            message: description || 'El Pacific Tsunami Warning Center ha emitido una alerta de tsunami para la region del Pacifico.',
            severity: 'danger',
            source: 'noaa',
            coordinates: coords,
            radiusKm: 500,
            rawTimestamp: new Date(props.effective ?? props.sent ?? Date.now()),
          });
        }
        return results;
      } catch {
        return [];
      }
    },
  };
}
