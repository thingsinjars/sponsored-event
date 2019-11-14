const SponsoredEvent = artifacts.require("SponsoredEvent");
module.exports = function(deployer) {
  deployer.deploy(SponsoredEvent);
};
