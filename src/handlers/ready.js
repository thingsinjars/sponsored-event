// server generates 5 digit PIN
// server generates uuid
// server stores them in DB with 60 minute expiration
// return:
//     new PIN
//     deviceID

const uuidv4 = require('uuid/v4');

module.exports = (db) => {
  return async (request, h) => {
    let pin = ("" + Math.round(Math.random() * 100000)).padStart(5, "0");
    let deviceId = uuidv4();

    // TODO: check for PIN collisions
    await db.insert({ pin, deviceId });

    return { pin, deviceId };
  };
};