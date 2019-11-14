<template>
  <div v-if="participant" class="body">
    <h2>Support {{ participant.participantName }}</h2>
    <nav class="event-nav" v-if="event.address">
      <ul>
        <li>
          <router-link :to="`/event/${event.address}`"
            >Event details</router-link
          >
        </li>
        <li>
          <router-link :to="`/event/${event.address}/sign-up`"
            >Sign-up for this event</router-link
          >
        </li>
        <li>
          <router-link :to="`/event/${event.address}/participants`"
            >See who else has signed up</router-link
          >
        </li>
      </ul>
    </nav>

    <div class="column column-80">
      <table>
        <tr>
          <th>Event Name</th>
          <td>{{ event.eventName }}</td>
        </tr>
        <tr>
          <th>Participant Name</th>
          <td>{{ participant.participantName }}</td>
        </tr>
        <tr>
          <th>Participant Address</th>
          <td>{{ participant.participantAddress }}</td>
        </tr>
      </table>

      <form @submit.prevent="pledge">
        <label for="sponsorName">Event ID</label>
        <input v-model="event.address" />
        <label for="sponsorName">Participant Index</label>
        <input v-model="participantIndex" />
        <div>
          <label for="sponsorName">Your Name</label>
          <input
            v-model="sponsorName"
          />
          <p class="small"><small id="sponsorNameHelp"
                      >This is the name that will appear next to the pledge.</small
                    ></p>
        </div>
        <div>
          <label for="sponsorAmount">Pledge amount</label>
          <input 
            v-model.number="pledgeAmount"
            :precision="2"
            />
          <p class="small"><small id="sponsorAmountHelp"
                      >The amount (in Ether) to sponsor the particpant for. Must be
                      greater than zero.</small
                    ></p>
        </div>
        <button type="submit" class="obviousbutton">Pledge</button>
      </form>
    </div>
  </div>
</template>

<script>

export default {
  name: "Pledge",
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadGasPrice");
    await this.loadEvent();
    this.loadParticipant();
  },
  async mounted() {},
  data() {
    return {
      msg: "Participant details",
      eventId: this.$route.params.eventId,
      participantIndex: this.$route.params.participantIndex,
      event: {},
      participant: null,
      contract: null,
      sponsorName: "Test Sponsor Name",
      pledgeAmount: 0.02
    };
  },
  computed: {
    web3() {
      return this.$store.state.web3;
    }
  },
  methods: {
    async loadEvent() {
      const contract = this.$store.state.contract;
      const recipient = await contract.recipient();
      const organiser = await contract.organiser();
      const stage = (await contract.closed())
        ? "closed"
        : (await contract.ended())
        ? "ended"
        : "open";
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
      console.log(this.event);
    },
    async loadParticipant() {
      const contract = this.$store.state.contract;
      const participantAddress = await contract.participantsIndex(
        this.participantIndex
      );
      this.participant = await contract.participants(participantAddress);
    },
    async pledge() {
      const contract = this.$store.state.contract;
      try {
        const tx = await contract.pledge(this.participantIndex, this.sponsorName, {
          from: this.$store.state.web3.account,
          value: web3.toWei(this.pledgeAmount, 'ether'),
          gas: 150000,
          gasPrice: this.$store.state.gasPrice
        })
        this.$router.push(`/event/${contract.address}`);
      } catch (err) {
        throw new Error(err);
      }
    }
  }
};
</script>

<style scoped>
  span {
  font-weight: bold;
  font-style: italic;
}
</style>
