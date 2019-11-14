<template>
  <div class="body" v-if="event && event.organiserAddress && isAdmin">
    <h2>Admin page for {{event.eventName}}</h2>
    <table>
      <tr>
        <th>Event</th>
        <td>{{event.address}}</td>
      </tr>
      <tr>
        <th>Status</th>
        <td>{{event.stage}}</td>
      </tr>
      <tr>
        <th>Sign-up Fee</th>
        <td>{{signUpFee}} ETH</td>
      </tr>
      <tr>
        <th>Recipient Address</th>
        <td>{{event.recipientAddress}}</td>
      </tr>
      <tr>
        <th>Recipient Name</th>
        <td>{{event.recipientName}}</td>
      </tr>
      <tr>
        <th>OrganiserId</th>
        <td>{{event.organiserAddress}}</td>
      </tr>
      <tr>
        <th>Participant count</th>
        <td>{{event.participantCount}}</td>
      </tr>
      <tr>
        <th>Pledge count</th>
        <td>{{event.pledgeCount}}</td>
      </tr>
      <tr>
        <th>Amount raised so far</th>
        <td>{{raised}} ETH</td>
      </tr>
      <tr>
        <th>Target</th>
        <td>{{target}} ETH</td>
      </tr>
    </table>
    <AdminMenu />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AdminMenu from './AdminMenu';

export default {
  name: "AdminPage",
  components: {
    AdminMenu
  },
  data() {
    return {
      eventId: this.$route.params.eventId,
    };
  },
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadEvent");
    await this.$store.dispatch("loadParticipants");
  },
  computed: {
    ...mapState(['event', 'web3', 'participants']),
    isAdmin() {
      return this.event.organiserAddress.toLowerCase() === this.web3.account.toLowerCase();
    },
    signUpFee() {
      return web3.fromWei(this.event.signUpFee.toString(10), "ether");
    },
    raised() {
      return web3.fromWei(this.event.balance.toString(10), "ether");
    },
    target() {
      return web3.fromWei(this.event.target.toString(10), "ether");
    },
  },
};
</script>
<style>
</style>