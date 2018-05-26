const Datastore = require('nedb-promise');
const db = {
    // device: new Datastore({ filename: 'db/datafile', autoload: true }),
    // vendor: new Datastore({ filename: 'db/vendordatafile', autoload: true })
};

// const vendors = require('./vendor/vendors')(db.vendor);

// // Routes
// const ready = require('./ready')(db.device);
// const claim = require('./claim')(db.device, vendors);
// const claimed = require('./claimed')(db.device);

// const addVendor = require('./vendor/add')(vendors);
// const getVendor = require('./vendor/get')(vendors);
// const removeVendor = require('./vendor/remove')(vendors);

module.exports = { /*ready, claim, claimed, addVendor, getVendor, removeVendor*/ };