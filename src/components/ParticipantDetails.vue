<template>
  <div v-if="participant" class="body">
    <h2>{{participant.participantName}}</h2>
    <p>is taking part in <span>{{event.eventName}}</span> for <span>{{event.recipientName}}</span></p>
     <nav class="event-nav" v-if="event.address">
      <ul>
        <li><router-link :to="`/event/${event.address}`">Event details</router-link></li>
        <li><router-link :to="`/event/${event.address}/sign-up`" v-if="event.stage === 'open'">Sign-up for this event</router-link></li>
        <li><router-link :to="`/event/${event.address}/participants`">See who else has signed up</router-link></li>
      </ul>
    </nav>
   <p v-if="event.stage !== 'open'">This event is no longer open for pledges.</p>
  <div>
    <table>
      <tr>
        <th>Event Name</th>
        <td>{{event.eventName}}</td>
      </tr>
      <tr>
        <th>Participant Name</th>
        <td>{{participant.participantName}}</td>
      </tr>
      <tr>
        <th>Participant Address</th>
        <td>{{participant.participantAddress}}</td>
      </tr>
    </table>

    <p v-if="event.stage === 'open'">You can support <span>{{participant.participantName}}</span> by pledging to donate money to <span>{{event.recipientName}}</span> if they complete <span>{{event.eventName}}</span>.</p>
    <nav class="event-nav" v-if="event.stage === 'open'">
      <ul>
        <li>
          <router-link :to="`/event/${event.address}/participant/${participantIndex}/pledge`">
            Pledge to {{participant.participantName}}
          </router-link>
        </li>
        </ul>
    </nav>

  </div>

  </div>
</template>

<script>

export default {
  name: "EventDetails",
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.loadEvent();
    this.loadParticipant();
  },
  async mounted() {
  },
  data() {
    return {
      msg: "Participant details",
      eventId: this.$route.params.eventId,
      participantIndex: this.$route.params.participantIndex,
      event: {},
      participant: null,
      contract: null,
    };
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    },
  },
  methods: {
    async loadEvent() {
      const contract = this.$store.state.contract;
      const recipient = await contract.recipient();
      const organiser = await contract.organiser();
      const stage = await contract.closed() ? 'closed' : await contract.ended() ? 'ended' : 'open';
      this.event = {
        eventName: await contract.eventName(),
        address: contract.address,
        signUpFee: await contract.signUpFee(),
        recipientName: recipient[0],
        recipientAddress: recipient[1],
        organiserAddress: organiser,
        participantCount: await contract.participantCount(),
        pledgeCount: await contract.pledgeCount(),
        stage
      };
      console.log(this.event)
    },
    async loadParticipant() {
      const contract = this.$store.state.contract;
      const participantAddress = await contract.participantsIndex(this.participantIndex);
      this.participant = await contract.participants(participantAddress);
    },
  },
};
</script>

<style scoped>
span {
  font-weight: bold;
  font-style: italic;
}
</style>
