/**
 * PU-03 Wizard con campos vacíos
 * PU-04 Latitud > 90 inválida
 *
 * Unidades bajo prueba:
 *  - src/mobile/modules/reports/presentation/viewmodels/report-create.viewmodel.ts
 *  - src/mobile/modules/reports/domain/entities/report.ts
 *  - src/mobile/modules/reports/domain/valueObjects/geo-location.ts
 */
import { describe, expect, it, jest } from '@jest/globals';
import { createNewReport } from '@/modules/reports/domain/entities/report';
import { InvalidReportError } from '@/modules/reports/domain/exceptions/report-errors';
import { createGeoLocation } from '@/modules/reports/domain/valueObjects/geo-location';
import {
  ReportCreateViewModel,
  type ReportCreateDeps,
} from '@/modules/reports/presentation/viewmodels/report-create.viewmodel';

function makeDeps(): ReportCreateDeps & { submit: jest.Mock } {
  const submit = jest.fn(async () => ({ id: 'r1', queued: false, mediaWarning: null }));
  return {
    db: { submit } as never,
    online: true,
    verdict: 'ok',
    profile: { walletAddress: '0x0000000000000000000000000000000000000001' } as never,
    user: { uid: 'u1' } as never,
    isGuest: false,
    onExit: jest.fn(),
    submit,
  };
}

describe('PU-03 wizard con campos vacíos', () => {
  it('no permite avanzar del paso 1 sin consentimiento', () => {
    const vm = new ReportCreateViewModel(makeDeps());
    expect(vm.canContinue).toBe(false);
  });

  it('no permite avanzar como identificado sin DNI de 8 dígitos', () => {
    const vm = new ReportCreateViewModel(makeDeps());
    vm.toggleConsent();
    vm.toggleAnonymous(); // pasa a identificado
    vm.setDni('123');
    expect(vm.canContinue).toBe(false);
  });

  it('no envía el reporte si no se eligió tipo de incidente', async () => {
    const deps = makeDeps();
    const vm = new ReportCreateViewModel(deps);
    vm.toggleConsent();
    await vm.send();
    expect(deps.submit).not.toHaveBeenCalled();
    expect(vm.getState().submitted).toBe(false);
  });

  it('el dominio rechaza un título vacío', () => {
    expect(() =>
      createNewReport({ category: 'pesca_ilegal', title: '   ', isAnonymous: true }),
    ).toThrow(InvalidReportError);
  });

  it('el dominio rechaza una categoría inexistente', () => {
    expect(() =>
      createNewReport({ category: 'no_existe' as never, title: 'X', isAnonymous: true }),
    ).toThrow(InvalidReportError);
  });
});

describe('PU-04 latitud > 90 inválida', () => {
  it('createGeoLocation(90.0001, 0) lanza InvalidReportError', () => {
    expect(() => createGeoLocation(90.0001, 0)).toThrow(InvalidReportError);
  });

  it('createNewReport propaga el error de ubicación', () => {
    expect(() =>
      createNewReport({
        category: 'basura_marina',
        title: 'Basura',
        isAnonymous: true,
        location: { latitude: 91, longitude: -77 },
      }),
    ).toThrow(/Latitud inválida/);
  });

  it('acepta los límites exactos (-90, 90, -180, 180)', () => {
    expect(createGeoLocation(90, 180)).toEqual({ latitude: 90, longitude: 180 });
    expect(createGeoLocation(-90, -180)).toEqual({ latitude: -90, longitude: -180 });
  });
});
