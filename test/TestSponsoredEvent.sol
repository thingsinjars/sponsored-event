pragma solidity ^0.4.21;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SponsoredEvent.sol";

contract TestSponsoredEvent {
  SponsoredEvent sponsoredEvent = SponsoredEvent(DeployedAddresses.SponsoredEvent());

  // Testing the adopt() function
  function testUserCanAdoptPet() public {
    uint returnedId = sponsoredEvent.create("Test Event", 0x0, "Recipient Name");

    uint expected = 8;

    Assert.equal(returnedId, expected, "Adoption of pet ID 8 should be recorded.");
  }
}