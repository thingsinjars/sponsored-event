Object.assign(App, {
  initUI: () => {
    return App.loadAccount()
      .then(accounts => $('.myAccount').html(accounts[0]))
  },


  setStage(stage) {
    $('.stage').removeClass('active');
    $(`.stage-${stage}`).addClass('active');
    $('#stage-widget').removeClass('loading');
  },

  showEventDetails: async () => {
    if (App.sponsoredEvent) {
      const eventAddress = App.sponsoredEvent.address;
      const eventEnded = await App.sponsoredEvent.ended();
      const eventClosed = await App.sponsoredEvent.closed();
      const signUpFee = await App.sponsoredEvent.signUpFee();
      const eventName = await App.sponsoredEvent.eventName();
      const recipient = await App.sponsoredEvent.recipient();
      const organiserId = await App.sponsoredEvent.owner();
      const eventBalance = await App.sponsoredEvent.getContractBalance();
      const recipientReceivedTotal = await App.sponsoredEvent.recipientReceivedTotal();
      const participantCount = await App.sponsoredEvent.participantCount();
      const pledgeCount = await App.sponsoredEvent.pledgeCount();
      const recipientName = recipient[0];
      const recipientAddress = recipient[1];

      $('.showEventId').html(eventAddress);

      const stage = eventClosed ? 'closed' : eventEnded ? 'ended' : 'open';
      $('.showEventStatus').html(stage);
      App.setStage(stage);
      App.showAdmin(organiserId);

      $('.showSignUpFee').html(web3.fromWei(signUpFee, 'ether').toNumber() + ' Ether');
      $('.showEventName').html(eventName);
      $('.showRecipientAddress').html(recipientAddress);
      $('.showRecipientName').html(recipientName);
      $('.showOrganiserId').html(organiserId);
      $('.showEventBalance').html(web3.fromWei(eventBalance, "ether").toNumber() + ' Ether');
      $('.showEventTransferred').html(web3.fromWei(recipientReceivedTotal, "ether").toNumber() + ' Ether');
      $('.showParticipantCount').html(participantCount.toNumber());
      $('.showPledgeCount').html(pledgeCount.toNumber());
      App.status();
    } else {
      App.status('No event found with that ID', true);
    }
  },

  // Helper to make UI nicer
  showAdmin: async(eventOwner) => {
    const owner = await App.sponsoredEvent.owner();
    const accounts = await App.loadAccount();
    if(owner === accounts[0]) {
      $('.admin').removeClass('admin');
    }
  },

  showAllParticipants: async () => {
    if (App.sponsoredEvent) {
      const count = (await App.sponsoredEvent.participantCount()).toNumber();
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
      $('#checkAll').click((e) => {
        $('.check').prop('checked', $(e.target).prop('checked'));
      });
    }
  },

  showParticipantDetails: async (participantId) => {
    if (App.sponsoredEvent) {
      const participantAddress = await App.sponsoredEvent.participantsIndex(participantId);
      const participantDetails = await App.sponsoredEvent.participants(participantAddress);

      $('.showParticipantName').html(participantDetails[0]);
      $('.showParticipantAddress').html(participantAddress);
    }
  },

});
