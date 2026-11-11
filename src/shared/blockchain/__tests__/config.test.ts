import { isPointLedgerConfigured, POINT_LEDGER_ADDRESS } from '../config';

describe('blockchain config (sin env)', () => {
  it('isPointLedgerConfigured es false sin dirección configurada', () => {
    expect(isPointLedgerConfigured()).toBe(false);
  });

  it('POINT_LEDGER_ADDRESS es string', () => {
    expect(typeof POINT_LEDGER_ADDRESS).toBe('string');
  });
});