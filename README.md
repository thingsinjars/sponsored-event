Sponsorship Contract
===

Manage funds and charity pledges through a smart contract. This can be used to manage, collect and distribute donations for any kind of charity event – sponsored walk, climb, run, pogo-stick marathon, etc.

No more chasing people for money after the event. No need to worry about how or whether the money makes it to the charity. Partial completion (e.g. making it half-way around a course, only eating 0.5 million baked beans...) results in partial donation with the remainder returning to the original sponsor.

This contract also allows cancellation and withdrawal from the event. In that case, the participant's initial sign-up fee is transferred to the receiving charity but any pledges are returned to the sponsor.

Key Concepts
===

The Event
---

An event for charity where *someone* must complete all or part of *something*. In exchange *someone else* pledges to give money to a *recipient*.

The Recipient
---

The charity or body receiving the funds at the end. They don't need to do anything except have an account capable of receiving the pledges.

The Organiser
---

The organiser creates the event specifying the name, date, description and designating the recipient account. This account is the owner of the SponsorshipEvent.

The Participant
---

The person actually taking part in the event. This person signs up for the event and commits to taking part. They are given a unique URL which The Sponsor can use to pledge money. Participants are charged a sign-up fee.

The Sponsor
---

The source of the funds. This party has promised to donate money to The Recipient if The Participant takes part in The Event. They can include a message along with their pledge.

Cancellation
---

If the event is cancelled, all money is automatically returned to The Sponsor.

Withdrawal
---

If The Participant withdraws, all money is automatically returned to The Sponsor.

Partial Completion
---

If The Participant completes x% of the event, x% of the pledge is given to The Recipient.



Order of Events
---

Organiser creates Event 
    (name, recipientName, recipientAddress) 
        -> EventId

Participant creates EventParticipant for EventId
    (EventId, participantName, participantAddress, entranceFee)
        -> EventParticipantId

Sponsor creates Sponsorship
    (amount, EventParticipantId, eventId)
        -> SponsorshipId

Organiser confirms completion of Participant 
    (EventParticipantId, percentage) or (EventId, ParticipantAddress, percentage)
        -> Event = getEvent(EventParticipantId.eventId)
        -> Lookup all sponsorshipId where EventParticipantId
        -> foreach Sponsorship
             transfer(percentage of Sponsorship.amount, Event.recipientAddress)
        -> transfer(entranceFee, Event.recipientAddress)


Developing
===

Start Ganache

Use this passphrase:

    circle cage glove rookie note valve naive garlic bacon suffer screen runway

MetaMask password:

    circlecage

After starting and connecting MetaMask, reset the account in Metamask

    MetaMask > Menu > Settings > Reset Account

Start Truffle:

    truffle console --network development