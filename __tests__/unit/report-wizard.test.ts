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

describe('Descripción del reporte', () => {
  it('send() incluye la descripción recortada en el comando', async () => {
    const deps = makeDeps();
    const vm = new ReportCreateViewModel(deps);
    vm.continueIncident({
      incident: { id: 'pesca_ilegal', label: 'Pesca ilegal' },
      description: '  Dos lanchas con redes de arrastre a 200 m de la orilla  ',
      audio: null,
    });

    await vm.send();

    expect(deps.submit).toHaveBeenCalledTimes(1);
    const [command] = deps.submit.mock.calls[0] as unknown as [{ description?: string; title: string }];
    expect(command.title).toBe('Pesca ilegal');
    expect(command.description).toBe('Dos lanchas con redes de arrastre a 200 m de la orilla');
  });

  it('send() omite la descripción vacía', async () => {
    const deps = makeDeps();
    const vm = new ReportCreateViewModel(deps);
    vm.continueIncident({ incident: { id: 'basura_marina', label: 'Basura' }, description: '   ', audio: null });

    await vm.send();

    const [command] = deps.submit.mock.calls[0] as unknown as [{ description?: string }];
    expect(command.description).toBeUndefined();
  });

  it('el dominio rechaza descripciones de más de 500 caracteres', () => {
    expect(() =>
      createNewReport({ category: 'otro', title: 'X', description: 'a'.repeat(501), isAnonymous: true }),
    ).toThrow(/500 caracteres/);
    expect(createNewReport({ category: 'otro', title: 'X', description: 'a'.repeat(500), isAnonymous: true }).description).toHaveLength(500);
  });
});
