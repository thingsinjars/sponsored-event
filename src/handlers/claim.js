// server generates 5 digit PIN
// server generates uuid
// server stores them in DB with 60 minute expiration
// return:
//     new PIN
//     deviceID

const uuidv4 = require('uuid/v4');

module.exports = (db, vendors) => {
  return async(request, h) => {
    const { pin, userId, vendorId, claimToken } = request.payload;

    const doc = await db.findOne({ pin });

    if (!doc) {
      // This device is unknown or its PIN has expired
      return h.response({ message: 'PIN is not valid' }).code(404);
    } else {
      if (doc.userId) {
        // This has already been claimed
        return h.response({ message: 'This has already been claimed' }).code(409);
      } else {
        // This has not been claimed yet
        // Update the local claim record and remove the pin
        await db.update({ deviceId: doc.deviceId }, { $set: { userId }, $unset: { pin: true } }, {});

        // If a vendorId is provided, make an external 'add permission' call
        if(vendorId) {
          vendors.addPermission(vendorId, userId, doc.deviceId, claimToken);
        }

        return { 'deviceId': doc.deviceId };
      }
    }
  };
};