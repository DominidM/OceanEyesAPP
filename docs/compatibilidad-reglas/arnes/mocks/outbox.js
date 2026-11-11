module.exports = {
  enqueueReport: async () => ({ id: 'pending-1' }),
  updatePendingReport: async (id, changes) => { (global.__outboxUpdates ||= []).push({ id, changes }); },
};
