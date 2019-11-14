<template>
  <div class="body" v-if="event && event.organiserAddress && isAdmin">
    <h2>{{event.eventName}}</h2>
    <form 
     @submit.prevent="markComplete">
      <input 
        v-model="eventId"
      >
      <div>
        <table>
          <tr><th>Completed?</th><th>Name</th><th>Address</th></tr>
          <tr v-for="participant in participants" :key="participant.address">
            <td>
              <input
                v-model="checkedParticipants"
                :value="participant.address"
                type="checkbox"
                :disabled="participant.status === 'completed'"
                ></td>
            <td>{{ participant.name }}</td>
            <td>{{ participant.address }}</td>
          </tr>
        </table>
      </div>
      <button>Mark selected complete</button>
    </form>
    <AdminMenu />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AdminMenu from './AdminMenu';
export default {
  name: "AdminParticipants",
  components: {
    AdminMenu
  },
  data() {
    return {
      eventId: this.$route.params.eventId,
      checkedParticipants: [],
    };
  },
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadEvent");
    await this.$store.dispatch("loadParticipants");
    this.checkedParticipants = this.participants.filter(participant => participant.status === 'completed')
                                                .map(participant => participant.address);
    await this.$store.dispatch("loadGasPrice");
  },
  computed: {
    ...mapState(['event', 'web3', 'participants']),
    isAdmin() {
      return this.event.organiserAddress.toLowerCase() === this.web3.account.toLowerCase();
    },
  },
  methods: {
    async markComplete(event) {
      const contract = this.$store.state.contract;

      const tx = await contract.participantCompleted(
        this.checkedParticipants, {
          from: this.$store.state.web3.account,
          gas: 150000,
          gasPrice: this.$store.state.gasPrice
        }
      );
      await this.$store.dispatch("loadParticipants");
    },
  },
};
</script>
<style>
</style>