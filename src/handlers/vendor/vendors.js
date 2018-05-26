// Save or load vendor from DB
// A vendor exposes an addPermission call

const fetch = require('node-fetch');

module.exports = (db) => {

  async function add(vendorId, permissionsUrl) {
    return await db.insert({ vendorId, permissionsUrl });
  }

  async function get(vendorId) {
    return await db.findOne({ vendorId });
  }

  async function remove(vendorId) {
    return await db.remove({ vendorId });
  }

  function addPermission(vendorId, userId, deviceId, claimToken) {
    // call permission URL
    // claimToken is a short-lived token provided by the vendor 
    // to ensure the request is valid
    return get(vendorId)
      .then(doc => fetch(doc.permissionsUrl, {
        method: 'POST',
        body: JSON.stringify({
          vendorId,
          userId,
          deviceId,
          claimToken
        })
      })
      .catch(err => {
        throw new Error('Connection error to vendor permissionsUrl', permissionsUrl)
      }))
      .catch(err => {
        return new Error('Vendor Not Found', err);
      })
  }

  return {
    add,
    get,
    remove,
    addPermission
  };
};