/**
 * Mapeo de las 9 categorías de la app a las 3 que acepta PointLedger.
 * Unidad bajo prueba: src/shared/blockchain/category-map.ts
 */
import { describe, expect, it } from '@jest/globals';

import { REPORT_CATEGORIES } from '@/modules/reports/domain/valueObjects/report-category';
import { ON_CHAIN_POINTS, toOnChainCategory } from '@shared/blockchain/category-map';

const CONTRACT_CATEGORIES = ['pesca_ilegal', 'basura_marina', 'variacion_mar'];

const EXPECTED: [string, string, number][] = [
  ['pesca_ilegal', 'pesca_ilegal', 100],
  ['embarcacion_sospechosa', 'pesca_ilegal', 100],
  ['basura_marina', 'basura_marina', 50],
  ['derrame_hidrocarburos', 'basura_marina', 50],
  ['redes_fantasmas', 'basura_marina', 50],
  ['variacion_mar', 'variacion_mar', 30],
  ['marea_roja', 'variacion_mar', 30],
  ['fauna_herida', 'variacion_mar', 30],
  ['otro', 'variacion_mar', 30],
];

describe('mapeo de categorías on-chain', () => {
  it('cubre exactamente las 9 categorías de la app', () => {
    expect(EXPECTED.map(([app]) => app).sort()).toEqual(Object.keys(REPORT_CATEGORIES).sort());
  });

  it.each(EXPECTED)('%s → %s (%i pts on-chain)', (app, onChain, points) => {
    const mapped = toOnChainCategory(app);
    expect(mapped).toBe(onChain);
    expect(CONTRACT_CATEGORIES).toContain(mapped);
    expect(ON_CHAIN_POINTS[mapped]).toBe(points);
  });

  it('rechaza una categoría desconocida en lugar de enviarla al contrato', () => {
    expect(() => toOnChainCategory('no_existe')).toThrow(/sin equivalente on-chain/);
  });
});
