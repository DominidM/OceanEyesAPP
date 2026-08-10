import type { ReportCategory } from '@/shared/firebase/types';

import type { MapReport } from './map-report';

export type MapCell = { lat: number; lng: number; count: number; maxCount: number };

export type MapCluster = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  reports: MapReport[];
};

const CELL_SIZE_DEG = 0.02;

export const HEAT_COLORS = ['#134E5E', '#0E7490', '#0891B2', '#F59E0B', '#EA580C', '#DC2626'];

export function buildHeatCells(
  reports: MapReport[],
): { cells: MapCell[]; activeCategories: ReportCategory[] } {
  const buckets = new Map<string, { lat: number; lng: number; count: number; categories: Set<ReportCategory> }>();

  for (const report of reports) {
    const key = `${Math.round(report.latitude / CELL_SIZE_DEG)}:${Math.round(report.longitude / CELL_SIZE_DEG)}`;
    const cell = buckets.get(key) ?? {
      lat: Math.round(report.latitude / CELL_SIZE_DEG) * CELL_SIZE_DEG,
      lng: Math.round(report.longitude / CELL_SIZE_DEG) * CELL_SIZE_DEG,
      count: 0,
      categories: new Set<ReportCategory>(),
    };
    cell.count += 1;
    cell.categories.add(report.category);
    buckets.set(key, cell);
  }

  const cells: MapCell[] = [];
  const activeCategories = new Set<ReportCategory>();
  for (const cell of buckets.values()) {
    for (const category of cell.categories) activeCategories.add(category);
    cells.push({ lat: cell.lat, lng: cell.lng, count: cell.count, maxCount: 0 });
  }

  const maxCount = cells.reduce((acc, c) => Math.max(acc, c.count), 1);
  for (const cell of cells) cell.maxCount = maxCount;

  return { cells, activeCategories: Array.from(activeCategories) };
}

export function heatColor(count: number, maxCount: number): string {
  if (maxCount <= 1) return HEAT_COLORS[Math.min(HEAT_COLORS.length - 1, count - 1)];
  const idx = Math.min(
    HEAT_COLORS.length - 1,
    Math.floor((count / maxCount) * HEAT_COLORS.length),
  );
  return HEAT_COLORS[idx];
}

export function buildClusters(reports: MapReport[], clusterSizeDeg = CELL_SIZE_DEG * 2): MapCluster[] {
  const buckets = new Map<string, { lat: number; lng: number; items: MapReport[] }>();

  for (const report of reports) {
    const key = `${Math.round(report.latitude / clusterSizeDeg)}:${Math.round(report.longitude / clusterSizeDeg)}`;
    const bucket = buckets.get(key) ?? {
      lat: Math.round(report.latitude / clusterSizeDeg) * clusterSizeDeg,
      lng: Math.round(report.longitude / clusterSizeDeg) * clusterSizeDeg,
      items: [],
    };
    bucket.items.push(report);
    buckets.set(key, bucket);
  }

  const clusters: MapCluster[] = [];
  for (const bucket of buckets.values()) {
    if (bucket.items.length === 1) continue;
    clusters.push({
      id: `${bucket.lat}:${bucket.lng}`,
      lat: bucket.lat,
      lng: bucket.lng,
      count: bucket.items.length,
      reports: bucket.items,
    });
  }
  return clusters;
}