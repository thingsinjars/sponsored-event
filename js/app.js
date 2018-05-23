App = {
  web3Provider: null,
  contracts: {},
  sponsoredEvent: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('SponsoredEvent.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var SponsoredEventArtifact = data;
      App.contracts.SponsoredEvent = TruffleContract(SponsoredEventArtifact);

      // Set the provider for our contract
      App.contracts.SponsoredEvent.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      // return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#loadButton', App.handleLoad);
    $(document).on('click', '.btn-create', App.handleCreate);
    $(document).on('click', '.btn-signup', App.handleSignUp);
    return App.initUi();
  },

  initUi: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      $('#myAccount').html(accounts[0]);
    });

  },

  showEventDetails: async function() {
    if(App.sponsoredEvent) {
      const eventAddress = await App.sponsoredEvent.address;
      const eventName = await App.sponsoredEvent.eventName();
      const recipient = await App.sponsoredEvent.recipient();
      const recipientName = recipient[0];
      const recipientAddress = recipient[1];
      $('#showEventId').html(eventAddress);
      $('#showEventName').html(eventName);
      $('#showRecipientAddress').html(recipientAddress);
      $('#showRecipientName').html(recipientName);
      $('#status').html('');
    } else {
      $('#status').html('No event found with that ID');
    }


    // var adoptionInstance;

    // App.contracts.Adoption.deployed().then(function(instance) {
    //   adoptionInstance = instance;

    //   return adoptionInstance.getAdopters.call();
    // }).then(function(adopters) {
    //   for (i = 0; i < adopters.length; i++) {
    //     if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //       $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //     }
    //   }
    // }).catch(err => {
    //   console.log(err.message);
    // });
  },

  loadEvent: (eventAddress) => {
    return App.contracts.SponsoredEvent.at(eventAddress)
      .then((instance) => {
        App.sponsoredEvent = instance;
        return App.sponsoredEvent;
      })
      .catch(err => {
        console.log(err.message);
      });
  },

  handleLoad: function(event) {
    event.preventDefault();
    return App.loadEvent($('#eventId').val())
      .then(sponsoredEvent => {
        App.showEventDetails();
      })

  },

  handleCreate: function(event) {
    event.preventDefault();

    $('#status').html('loading');
    App.contracts.SponsoredEvent.new(
      $('#eventName').val(), 
      $('#signUpFee').val(), 
      $('#recipientAddress').val(), 
      $('#recipientName').val()
      ).then((instance) => {
          return instance.address;
        })
        .then(eventAddress => {
          console.log('Address: ' + eventAddress);
          App.loadEvent(eventAddress)
            .then(sponsoredEvent => {
              $('#status').html('');
              App.showEventDetails();
            })
          return eventAddress;
        })
        .catch(function(err) {
          console.log(err.message);
        });
  },

  handleSignUp: (event) => {
    event.preventDefault();
    return App.loadEvent($('#eventId').val())
      .then(sponsoredEvent => {
        return sponsoredEvent.signUpForEvent(
          $('#participantName').val()
          )
          .then(participantId => {
            debugger;
            return participantId;
          })
          .catch(err => {
            console.log(err.message);
          });
      })
      .catch(err => {
        console.log(err.message);
      })


  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});