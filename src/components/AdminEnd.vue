<template>
  <div class="body">
    <div v-if="event && event.organiserAddress && isAdmin">
      <h2>End {{event.eventName}}</h2>
      <p>This will automatically transfer any pledges made to participants who <a href="participants">completed the event</a> along with all sign-up fees.</p>
      <p>Pledges made to participants who did not complete the event will be marked as 'available' for the sponsor to reclaim them.</p>
      <form
        @submit.prevent=endEvent>
        <button class="obviousbutton">End event</button>
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
    async endEvent(event) {
      if(!this.isAdmin) {
        return
      }
      const contract = this.$store.state.contract;
      const tx = await contract.endEvent({
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