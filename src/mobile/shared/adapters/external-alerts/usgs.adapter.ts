import type { ExternalAlertDTO, ExternalAlertSource } from './types';

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';

const PERU_BBOX = { minLat: -18, maxLat: -3, minLng: -81, maxLng: -69 };

function insidePeruCoast(lat: number, lng: number): boolean {
  return lat >= PERU_BBOX.minLat && lat <= PERU_BBOX.maxLat && lng >= PERU_BBOX.minLng && lng <= PERU_BBOX.maxLng;
}

export function createUsgsAdapter(): ExternalAlertSource {
  return {
    sourceName: 'usgs',
    async fetch(): Promise<ExternalAlertDTO[]> {
      try {
        const res = await fetch(USGS_URL);
        if (!res.ok) return [];
        const json = (await res.json()) as { features: any[] };
        const results: ExternalAlertDTO[] = [];

        for (const f of json.features ?? []) {
          const props = f.properties;
          const coords = f.geometry?.coordinates;
          if (!props || !coords) continue;
          const [lng, lat] = coords;
          if (!insidePeruCoast(lat, lng)) continue;

          const mag = props.mag ?? 0;
          const tsunami = props.tsunami ?? 0;

          if (tsunami === 1 || mag >= 6.0) {
            const severity = tsunami === 1 ? 'danger' : 'warning';
            results.push({
              externalId: `usgs_${props.ids ?? props.code ?? Date.now()}`,
              title: tsunami === 1
                ? `Alerta de tsunami: sismo M${mag.toFixed(1)}`
                : `Sismo fuerte M${mag.toFixed(1)} cerca de la costa`,
              message: tsunami === 1
                ? `El USGS reporta un sismo M${mag.toFixed(1)} con riesgo de tsunami en ${props.place}.`
                : `Sismo de magnitud ${mag.toFixed(1)} registrado en ${props.place}. Evalua riesgo de tsunami.`,
              severity,
              source: 'usgs',
              coordinates: { latitude: lat, longitude: lng },
              radiusKm: Math.round(mag * 50),
              rawTimestamp: new Date(props.time),
            });
          }
        }
        return results;
      } catch {
        return [];
      }
    },
  };
}
