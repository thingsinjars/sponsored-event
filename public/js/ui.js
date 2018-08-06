Object.assign(App, {
  initUI: function() {
    return App.loadAccount()
      .then(accounts => $('.myAccount').html(accounts[0]))
  },

  setStage(stage) {
    $(`.stage`).removeClass('active');
    $(`.stage-${stage}`).addClass('active');
  },

  showEventDetails: async function() {
    if (App.sponsoredEvent) {
      const eventAddress = App.sponsoredEvent.address;
      const eventEnded = await App.sponsoredEvent.ended();
      const eventClosed = await App.sponsoredEvent.closed();
      const signUpFee = await App.sponsoredEvent.signUpFee();
      const eventName = await App.sponsoredEvent.eventName();
      const recipient = await App.sponsoredEvent.recipient();
      const organiserId = await App.sponsoredEvent.owner();
      const eventBalance = await App.sponsoredEvent.getContractBalance();
      const registeredCount = await App.sponsoredEvent.registeredCount();
      const pledgeCount = await App.sponsoredEvent.pledgeCount();
      const recipientName = recipient[0];
      const recipientAddress = recipient[1];

      $('.showEventId').html(eventAddress);

      const stage = eventClosed ? 'closed' : eventEnded ? 'ended' : 'open';
      $('.showEventStatus').html(stage);
      App.setStage(stage);

      $('.showSignUpFee').html(web3.fromWei(signUpFee, 'ether').toNumber() + ' Ether');
      $('.showEventName').html(eventName);
      $('.showRecipientAddress').html(recipientAddress);
      $('.showRecipientName').html(recipientName);
      $('.showOrganiserId').html(organiserId);
      $('.showEventBalance').html(web3.fromWei(eventBalance, "ether").toNumber() + ' Ether');
      $('.showParticipantCount').html(registeredCount.toNumber());
      $('.showPledgeCount').html(pledgeCount.toNumber());
      App.status();
    } else {
      App.status('No event found with that ID', true);
    }
  },

  showAllParticipants: async function() {
    if (App.sponsoredEvent) {
      const count = (await App.sponsoredEvent.registeredCount()).toNumber();
      const list = $('#participantList');
      const formList = $('#participantFormList');
      for (let i = 0; i < count; i++) {
        const participantAddress = await App.sponsoredEvent.participantsIndex(i);
        const participantDetails = await App.sponsoredEvent.participants(participantAddress);

        list.append(`<li><a href="participant/${i}">${participantDetails[0]}</a></li>`);
        if (participantDetails[2]) {
          // participant has already completed
          formList.append(`<div class="checkbox"> <label> <input type="checkbox" disabled="disabled" name="participants"> ${participantDetails[0]} (completed)</label> </div>`);
        } else {
          formList.append(`<div class="checkbox"> <label> <input type="checkbox" class="check" name="participants" value="${i}"> ${participantDetails[0]}</label> </div>`);
        }
      }
      $("#checkAll").click(function() {
        $(".check").prop('checked', $(this).prop('checked'));
      });
    }
  },

  showParticipantDetails: async(participantId) => {
    if (App.sponsoredEvent) {
      const participantAddress = await App.sponsoredEvent.participantsIndex(participantId);
      const participantDetails = await App.sponsoredEvent.participants(participantAddress);

      $('.showParticipantName').html(participantDetails[0]);
      $('.showParticipantAddress').html(participantAddress);
    }
  }
});