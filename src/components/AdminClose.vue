<template>
  <div class="body">
    <div v-if="event && event.organiserAddress && isAdmin">
      <h2>Close {{event.eventName}}</h2>
      <p>Finalise and close the event transferring any remaining unclaimed funds to the recipient.</p>
      <form
        @submit.prevent=closeEvent>
        <button class="obviousbutton">Close event</button>
      </form>
    </div>
    <div v-else>
      <Loader :loading="loading" />
    </div>
    <AdminMenu />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Loader from '@/components/Loader';
import AdminMenu from './AdminMenu';

export default {
  name: "AdminEnd",
  components: {
    AdminMenu,
    Loader,
  },
  data() {
    return {
      loading: true,
      eventId: this.$route.params.eventId,
    };
  },
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadEvent");
    await this.$store.dispatch("loadGasPrice");
    this.loading = false;
  },
  computed: {
    ...mapState(['event', 'web3', 'participants']),
    isAdmin() {
      return this.event.organiserAddress.toLowerCase() === this.web3.account.toLowerCase();
    },
    checkedParticipants() {
      return this.participants.filter(participant => participant.status === 'completed')
                                                .map(participant => participant.address);
    },
  },
  methods: {
    async closeEvent(event) {
      if(!this.isAdmin) {
        return
      }
      const contract = this.$store.state.contract;
      const tx = await contract.closeEvent({
            from: this.$store.state.web3.account,
            gas: 150000,
            gasPrice: this.$store.state.gasPrice
      });
      await this.$store.dispatch("loadEvent");
    },
  },
};
</script>
<style>
</style>