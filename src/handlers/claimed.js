// client polls server with deviceId until the server returns 
//     userId of owner
// client stores 'claimed' status

// If the PIN expires, the server generates a new PIN
// return
//     new PIN

module.exports = (db) => {
  return async (request, h) => {
    const { deviceId } = request.payload;

    const doc = await db.findOne({ deviceId });

    if (!doc) {
      // This device is unknown or its PIN has expired
      return h.response('Unknown').code(404);
    } else {
      if (doc.userId) {
        // This has been claimed
        return { 'userId': doc.userId };
      } else {
        // This has not been claimed yet
        return h.response({}).code(412);
      }
    }
  };
};