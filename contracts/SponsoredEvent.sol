/**
 * @title SponsoredEvent
 * @author Simon Madine
 * @notice
 */

pragma solidity ^0.4.24;

import './Depositable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/** @title SponsoredEvent */
contract SponsoredEvent is Ownable, Depositable {

  string public eventName;
  uint256 public signUpFee;
  address public organiser;
  Recipient public recipient;
  uint public participantCount = 0;

  // The number of pledges
  uint public pledgeCount = 0;

  // Whether the event has finished
  bool public ended = false;

  // Whether this contract is finished
  bool public closed = false;

  bool public cancelled = false;

  struct Recipient {
    string recipientName;
    address recipientAddress;
  }

  struct Pledge {
    address sponsorAddress;
    uint256 pledgeAmount;
    uint participantId;
    string sponsorName;
    bool paid;
  }

  struct Participant {
    string participantName;
    address participantAddress;
    bool completed;
    bool finalized;
  }

  // Events
  event CreateRecipient(address recipientAddress, string recipientName);
  event CreateEvent(string eventName, uint256 signUpFee);
  event SignUpEvent(address addr, uint256 value, uint participantId, string participantName);
  event NewPledge(uint pledgeId, address sponsorAddress, uint256 pledgeAmount, uint256 balance);
  event ParticipantCompletedEvent(uint participantId);
  event RecipientTransfer(address addr, uint256 pledgeAmount);
  event WithdrawEvent(address addr, bool returned, uint256 pledgeAmount);
  event Closure(uint256 finalAmount);
  event Cancellation();

  // Maintain list of all sponsors so they can be refunded if the event is cancelled
  mapping(uint => Pledge) public pledges;

  // Participant[] public participants;
  mapping (address => Participant) public participants;
  mapping (uint => address) public participantsIndex;

  /* Modifiers */
  modifier onlyActive {
    require(!ended && !closed, "event is not active");
    _;
  }

  modifier onlyEnded {
    require(ended, "event has not ended");
    _;
  }

  modifier onlyClosed {
    require(closed, "event has not closed");
    _;
  }

  modifier onlyUnclosed {
    require(!closed, "event is not open");
    _;
  }

  /**
   * @notice Creates a SponsoredEvent contract
   *
   * Each SponsoredEvent has:
   *
   *  - An organiser
   *  - A recipient
   *
   * @param _eventName Public name of the Sponsored Event
   * @param _signUpFee Fee paid by the participants to join
   * @param _recipientAddress where the money goes at the end
   * @param _recipientName Public name of the Recipient of the funds
   */
  constructor(string _eventName, uint256 _signUpFee, address _recipientAddress, string _recipientName) public {
    // Each event has a single organiser
    organiser = msg.sender;

    eventName = _eventName;
    signUpFee = _signUpFee;

    // Each event has a single recipient
    recipient = Recipient(_recipientName, _recipientAddress);
    emit CreateRecipient(_recipientAddress, _recipientName);
    emit CreateEvent(_eventName, _signUpFee);
  }

  /**
   * @notice Join an event by providing a name and transferring
   * the minimum sign-up fee
   *
   * @param _participantName Public name of the event participant
   */
  function signUpForEvent(string _participantName) public payable onlyActive returns (uint) {

    // Are they sending enough to cover the sign-up fee?
    require(msg.value >= signUpFee, "not enough to cover sign-up fee");

    // Continue only if the sender is not already registered
    require(!isRegistered(msg.sender), "already registered");

    // Transfer the sign-up fee from the participant to the event
    deposit();

    // Create participant lookups
    participantsIndex[participantCount] = msg.sender;
    participants[msg.sender] = Participant(_participantName, msg.sender, false, false);

    emit SignUpEvent(msg.sender, msg.value, participantCount, _participantName);

    // Increase the number of participants registered for this event
    participantCount++;

    // return the number of people registered
    return participantCount;
  }

  /**
   * @notice Transfer money from the sponsor to the contract
   *
   * @param _participantId Index of the participant in the participantIndex
   * @param _sponsorName Public name of the sponsor
   */
  function pledge(uint _participantId, string _sponsorName) public onlyActive payable {

    // Add a pledge to this SponsoredEvent's pledge list
    pledges[pledgeCount] = Pledge(msg.sender, msg.value, _participantId, _sponsorName, false);

    emit NewPledge(pledgeCount, msg.sender, msg.value, getContractBalance());

    // Increase the number of pledges
    pledgeCount++;
  }

  /**
   * @notice Mark the participant as having completed the event
   *
   * **NOTE: This version doesn't allow partial completion**
   *
   *  * modifier: `onlyOwner` Only the organiser of this event may call this
   *  * modifier: `onlyActive` Only events that have not ended
   *
   * @param _participantIds Array of participants who have completed the event
   */
  function participantCompleted(uint[] _participantIds) external onlyOwner onlyActive {
    for (uint i=0; i < _participantIds.length; i++) {
      address _addr = participantsIndex[_participantIds[i]];
      require(isRegistered(_addr), "account is not a participant");
      require(!hasCompleted(_addr), "account has already completed the event");
      participants[_addr].completed = true;
      emit ParticipantCompletedEvent(i);
    }
  }

  /**
   * @notice End the event
   *
   *  * Transfer valid funds and sign-up fees to recipient
   *  * Mark this event as ended
   *
   *  * modifier: `onlyOwner` Only the organiser of this event may call this
   *  * modifier: `onlyActive` Only events that have not ended
   */
  function endEvent() external onlyOwner onlyActive {
    transferToRecipient();
    ended = true;
  }

  /**
   * @notice Transfer the money to the recipient
   *
   *  - Transfer the balance of pledges given to 
   *    participants who completed the event
   *    to the intended recipient and end the event.
   *  - Mark the event as ended
   *
   *  * modifier: `onlyOwner` Only the organiser of this event may call this
   *  * modifier: `onlyActive` Only events that have not ended
   */
  function transferToRecipient() internal {
    uint256 transferAmount = 0;

    // For each pledge
    for (uint i = 0; i < pledgeCount; i++) {
      // Pledge storage thisPledge = pledges[pledgeIndex[i]];
      Pledge storage thisPledge = pledges[i];

      // If this pledge hasn't been paid yet
      if(!thisPledge.paid) {

        // If this participant has completed the event
        address participantAddress = participantsIndex[thisPledge.participantId];
        if(hasCompleted(participantAddress)) {
          transferAmount += thisPledge.pledgeAmount;
          thisPledge.paid = true;
        }
      }
    }

    // Also include the signup fee from each participant
    transferAmount += participantCount * signUpFee;

    // Transfer the total pledges + sign-up fees
    recipient.recipientAddress.transfer(transferAmount);

    emit RecipientTransfer(recipient.recipientAddress, transferAmount);
  }

  /**
   * @notice Reclaim pledge
   *
   * After the event has ended, if the participant did not
   * complete the event, the sponsor can reclaim the pledge
   * or send it to the recipient anyway
   *
   *  * modifier: `onlyEnded` This event must have passed
   *  * modifier: `onlyUnclosed` This contract is still open
   *
   * @param _returnPledge Should this be returned to the sponsor?
   */
  function sponsorReclaim(uint pledgeId, bool _returnPledge) external onlyEnded onlyUnclosed {
    Pledge storage thisPledge = pledges[pledgeId];

    // This can only be called by the original sponsor
    require(thisPledge.sponsorAddress == msg.sender, "pledges can only be reclaimed by the original sponsor");

    // Only if the pledge hasn't already been paid
    require(!thisPledge.paid, "already paid");

    address participantAddress = participantsIndex[thisPledge.participantId];
    Participant memory participant = participants[participantAddress];

    // If the participant didn't complete
    require(!participant.completed, "participant did not complete");

    // Mark this pledge as paid
    thisPledge.paid = true;

    if(_returnPledge) {
      // Return it to the sponsor
      thisPledge.sponsorAddress.transfer(thisPledge.pledgeAmount);
    } else {
      // Forward to the recipient
      recipient.recipientAddress.transfer(thisPledge.pledgeAmount);
    }
    emit WithdrawEvent(msg.sender, _returnPledge, thisPledge.pledgeAmount);
  }

  /**
   * @notice Transfers any outstanding funds and closes the contract
   *
   * Any funds remaining in the contract by the time this is called
   * will be transferred to the recipient regardless of the
   * participant's completion status
   * 
   *  * modifier: `onlyEnded` This event must have passed
   *  * modifier: `onlyUnclosed` This contract is still open
   */
  function closeEvent() public onlyOwner onlyEnded onlyUnclosed {
    uint256 finalPayout = getContractBalance();
    recipient.recipientAddress.transfer(finalPayout);
    emit Closure(finalPayout);
    closed = true;
  }

  /**
   * @notice Cancel the event
   *
   *  * Transfer all the pledged money back to the sponsors
   *  * Transfer the sign-up fee back to the participant
   * 
   *  * modifier: `onlyOwner` Only the organiser of this event may call this
   *  * modifier: `onlyActive` Only events that have not ended
   */
  function cancelEvent() public onlyOwner onlyActive {
    ended = true;
    cancelled = true;

    // For each pledge
    for (uint i = 0; i < pledgeCount; i++) {
      // Pledge storage thisPledge = pledges[pledgeIndex[i]];
      Pledge memory thisPledge = pledges[i];

      // Only if the pledge hasn't already been paid
      require(!thisPledge.paid, "already paid");

      // Return it to the sponsor
      thisPledge.sponsorAddress.transfer(thisPledge.pledgeAmount);
    }

    // For each participant
    for (i=0; i < participantCount; i++) {
      address _addr = participantsIndex[i];
      _addr.transfer(signUpFee);
    }

    emit Cancellation();
  }

  /* Helper */
  function isRegistered(address _addr) constant public returns (bool) {
    return participants[_addr].participantAddress != address(0);
  }

  function hasCompleted(address _addr) constant public returns (bool) {
    return isRegistered(_addr) && participants[_addr].completed;
  }

}
