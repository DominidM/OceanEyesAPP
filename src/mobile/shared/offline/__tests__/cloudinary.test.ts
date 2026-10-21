jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
  },
}));

import { isCloudinaryConfigured } from '../cloudinary';

describe('cloudinary config (sin env)', () => {
  it('isCloudinaryConfigured es false sin variables de entorno', () => {
    expect(isCloudinaryConfigured()).toBe(false);
  });
});