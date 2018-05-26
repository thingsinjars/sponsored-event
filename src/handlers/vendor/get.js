// Create vendor
// NOTE: No authentication required

module.exports = (vendors) => {
  return async(request, h) => {
    const { vendorId } = request.params;

    return vendors.get(vendorId);
  }
};