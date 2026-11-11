import { formatDuration } from '../format-duration';

describe('formatDuration', () => {
  it('formats 0 ms as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('formats 65 seconds as 01:05', () => {
    expect(formatDuration(65_000)).toBe('01:05');
  });

  it('truncates fractional seconds', () => {
    expect(formatDuration(1_999)).toBe('00:01');
  });
});