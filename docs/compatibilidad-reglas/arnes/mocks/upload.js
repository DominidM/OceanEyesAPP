// Cloudinary / Storage: la subida real no pasa por firestore.rules; se prueba aparte (storage.rules).
const url = (o) => `https://res.cloudinary.com/demo/${o.reportId}/${o.mediaId}`;
module.exports = {
  uploadReportMedia: async (o) => url(o),
  uploadMediaToStorage: async (o) => url(o),
  stageMedia: async (uri) => uri,
};
