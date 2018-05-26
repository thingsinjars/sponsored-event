// Create vendor
// NOTE: No authentication required

module.exports = (vendors) => {
  return async(request, h) => {
    const { vendorId, permissionsUrl } = request.payload;

    return vendors.add(vendorId, permissionsUrl);
  }
};