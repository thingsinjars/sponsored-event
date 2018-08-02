* [Depositable](#depositable)
  * [getContractAddress](#function-getcontractaddress)
  * [getMyBalance](#function-getmybalance)
  * [getContractBalance](#function-getcontractbalance)
  * [getOnesBalance](#function-getonesbalance)
  * [deposit](#function-deposit)
* [SponsoredEvent](#sponsoredevent)
  * [closeEvent](#function-closeevent)
  * [participants](#function-participants)
  * [pledge](#function-pledge)
  * [signUpForEvent](#function-signupforevent)
  * [ended](#function-ended)
  * [registeredCount](#function-registeredcount)
  * [hasCompleted](#function-hascompleted)
  * [getContractAddress](#function-getcontractaddress)
  * [getMyBalance](#function-getmybalance)
  * [closed](#function-closed)
  * [recipient](#function-recipient)
  * [participantCompleted](#function-participantcompleted)
  * [getContractBalance](#function-getcontractbalance)
  * [renounceOwnership](#function-renounceownership)
  * [getOnesBalance](#function-getonesbalance)
  * [organiser](#function-organiser)
  * [eventName](#function-eventname)
  * [endEvent](#function-endevent)
  * [owner](#function-owner)
  * [signUpFee](#function-signupfee)
  * [cancelled](#function-cancelled)
  * [participantsIndex](#function-participantsindex)
  * [pledges](#function-pledges)
  * [isRegistered](#function-isregistered)
  * [pledgeCount](#function-pledgecount)
  * [deposit](#function-deposit)
  * [sponsorReclaim](#function-sponsorreclaim)
  * [transferOwnership](#function-transferownership)
  * [ErrorEvent](#event-errorevent)
  * [CreateRecipient](#event-createrecipient)
  * [CreateEvent](#event-createevent)
  * [SignUpEvent](#event-signupevent)
  * [NewPledge](#event-newpledge)
  * [ParticipantCompletedEvent](#event-participantcompletedevent)
  * [RecipientTransfer](#event-recipienttransfer)
  * [WithdrawEvent](#event-withdrawevent)
  * [Closure](#event-closure)
  * [OwnershipRenounced](#event-ownershiprenounced)
  * [OwnershipTransferred](#event-ownershiptransferred)
* [Ownable](#ownable)
  * [renounceOwnership](#function-renounceownership)
  * [owner](#function-owner)
  * [transferOwnership](#function-transferownership)
  * [OwnershipRenounced](#event-ownershiprenounced)
  * [OwnershipTransferred](#event-ownershiptransferred)

# Depositable


## *function* getContractAddress

Depositable.getContractAddress() `view` `32a2c5d0`





## *function* getMyBalance

Depositable.getMyBalance() `view` `4c738909`





## *function* getContractBalance

Depositable.getContractBalance() `view` `6f9fb98a`





## *function* getOnesBalance

Depositable.getOnesBalance(addr) `view` `7e1a380f`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | addr | undefined |


## *function* deposit

Depositable.deposit() `payable` `d0e30db0`






---
# SponsoredEvent


## *function* closeEvent

SponsoredEvent.closeEvent() `nonpayable` `03dc5326`

Transfers any outstanding funds and closes the contract.

Any funds remaining in the contract by the time this is called will be transferred to the recipient regardless of the participant's completion status    


modifier: onlyEnded This event must have passed modifier: onlyUnclosed This contract is still open**





## *function* participants

SponsoredEvent.participants() `view` `09e69ede`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* |  | undefined |


## *function* pledge

SponsoredEvent.pledge(_participantId, _sponsorName) `payable` `0da1cdf3`

**Transfer money from the sponsor to the contract**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _participantId | Index of the participant in the participantIndex |
| *string* | _sponsorName | Public name of the sponsor |


## *function* signUpForEvent

SponsoredEvent.signUpForEvent(_participantName) `payable` `10d26d44`

**Join an event by providing a name and transferring the minimum sign-up fee**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *string* | _participantName | Public name of the event participant |


## *function* ended

SponsoredEvent.ended() `view` `12fa6feb`





## *function* registeredCount

SponsoredEvent.registeredCount() `view` `210ff9bb`





## *function* hasCompleted

SponsoredEvent.hasCompleted(_addr) `view` `31f29250`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _addr | undefined |


## *function* getContractAddress

SponsoredEvent.getContractAddress() `view` `32a2c5d0`





## *function* getMyBalance

SponsoredEvent.getMyBalance() `view` `4c738909`





## *function* closed

SponsoredEvent.closed() `view` `597e1fb5`





## *function* recipient

SponsoredEvent.recipient() `view` `66d003ac`





## *function* participantCompleted

SponsoredEvent.participantCompleted(_participantIds) `nonpayable` `676bf2dc`

**Mark the participant as having completed the event   * NOTE: This version doesn't allow partial completion   * modifier: onlyOwner Only the organiser of this event may call this modifier: onlyActive Only events that have not ended**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256[]* | _participantIds | Array of participants who have completed the event |


## *function* getContractBalance

SponsoredEvent.getContractBalance() `view` `6f9fb98a`





## *function* renounceOwnership

SponsoredEvent.renounceOwnership() `nonpayable` `715018a6`

**Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.**

> Allows the current owner to relinquish control of the contract.




## *function* getOnesBalance

SponsoredEvent.getOnesBalance(addr) `view` `7e1a380f`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | addr | undefined |


## *function* organiser

SponsoredEvent.organiser() `view` `7e537486`





## *function* eventName

SponsoredEvent.eventName() `view` `8043c9c0`





## *function* endEvent

SponsoredEvent.endEvent() `nonpayable` `86ec6177`

**End the event - Transfer valid funds and sign-up fees to recipient - Mark this event as ended   * modifier: onlyOwner Only the organiser of this event may call this modifier: onlyActive Only events that have not ended**





## *function* owner

SponsoredEvent.owner() `view` `8da5cb5b`





## *function* signUpFee

SponsoredEvent.signUpFee() `view` `9278b587`





## *function* cancelled

SponsoredEvent.cancelled() `view` `9a82a09a`





## *function* participantsIndex

SponsoredEvent.participantsIndex() `view` `9b25cacb`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


## *function* pledges

SponsoredEvent.pledges() `view` `ac124081`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


## *function* isRegistered

SponsoredEvent.isRegistered(_addr) `view` `c3c5a547`

**Cancel the event   * Transfer all the pledged money back to the sponsors Transfer the sign-up fee back to the participant**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _addr | undefined |


## *function* pledgeCount

SponsoredEvent.pledgeCount() `view` `c6d6c183`





## *function* deposit

SponsoredEvent.deposit() `payable` `d0e30db0`





## *function* sponsorReclaim

SponsoredEvent.sponsorReclaim(pledgeId, _returnPledge) `nonpayable` `e532a10e`

**Reclaim pledge   * After the event has ended, if the participant did not complete the event, the sponsor can reclaim the pledge or send it to the recipient anyway   * modifier: onlyEnded This event must have passed modifier: onlyUnclosed This contract is still open**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | pledgeId | undefined |
| *bool* | _returnPledge | Should this be returned to the sponsor? |


## *function* transferOwnership

SponsoredEvent.transferOwnership(_newOwner) `nonpayable` `f2fde38b`

> Allows the current owner to transfer control of the contract to a newOwner.

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | The address to transfer ownership to. |



## *event* ErrorEvent

SponsoredEvent.ErrorEvent(errorMessage) `6222dc10`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *string* | errorMessage | not indexed |

## *event* CreateRecipient

SponsoredEvent.CreateRecipient(recipientAddress, recipientName) `fa862726`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | recipientAddress | not indexed |
| *string* | recipientName | not indexed |

## *event* CreateEvent

SponsoredEvent.CreateEvent(eventName, signUpFee) `e0c2754c`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *string* | eventName | not indexed |
| *uint256* | signUpFee | not indexed |

## *event* SignUpEvent

SponsoredEvent.SignUpEvent(addr, value, participantId, participantName) `5a193c25`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | addr | not indexed |
| *uint256* | value | not indexed |
| *uint256* | participantId | not indexed |
| *string* | participantName | not indexed |

## *event* NewPledge

SponsoredEvent.NewPledge(pledgeId, sponsorAddress, pledgeAmount, balance) `2ca6d0fe`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | pledgeId | not indexed |
| *address* | sponsorAddress | not indexed |
| *uint256* | pledgeAmount | not indexed |
| *uint256* | balance | not indexed |

## *event* ParticipantCompletedEvent

SponsoredEvent.ParticipantCompletedEvent(participantId) `1add32da`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | participantId | not indexed |

## *event* RecipientTransfer

SponsoredEvent.RecipientTransfer(addr, pledgeAmount) `51722200`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | addr | not indexed |
| *uint256* | pledgeAmount | not indexed |

## *event* WithdrawEvent

SponsoredEvent.WithdrawEvent(addr, returned, pledgeAmount) `27edbb55`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | addr | not indexed |
| *bool* | returned | not indexed |
| *uint256* | pledgeAmount | not indexed |

## *event* Closure

SponsoredEvent.Closure(finalAmount) `20d18480`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | finalAmount | not indexed |

## *event* OwnershipRenounced

SponsoredEvent.OwnershipRenounced(previousOwner) `f8df3114`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | previousOwner | indexed |

## *event* OwnershipTransferred

SponsoredEvent.OwnershipTransferred(previousOwner, newOwner) `8be0079c`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | previousOwner | indexed |
| *address* | newOwner | indexed |


---
# Ownable


## *function* renounceOwnership

Ownable.renounceOwnership() `nonpayable` `715018a6`

**Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.**

> Allows the current owner to relinquish control of the contract.




## *function* owner

Ownable.owner() `view` `8da5cb5b`





## *function* transferOwnership

Ownable.transferOwnership(_newOwner) `nonpayable` `f2fde38b`

> Allows the current owner to transfer control of the contract to a newOwner.

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | The address to transfer ownership to. |


## *event* OwnershipRenounced

Ownable.OwnershipRenounced(previousOwner) `f8df3114`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | previousOwner | indexed |

## *event* OwnershipTransferred

Ownable.OwnershipTransferred(previousOwner, newOwner) `8be0079c`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | previousOwner | indexed |
| *address* | newOwner | indexed |


---