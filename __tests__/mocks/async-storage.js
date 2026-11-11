// AsyncStorage en memoria para pruebas unitarias.
const store = new Map();

module.exports = {
  __esModule: true,
  default: {
    getItem: async (key) => (store.has(key) ? store.get(key) : null),
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
    clear: async () => store.clear(),
  },
  __store: store,
};
