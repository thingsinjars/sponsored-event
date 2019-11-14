<template>
  <div class="admin-menu" v-if="event.organiserAddress && isAdmin">
    <h3><router-link :to="`/admin/${event.address}`">Event administration</router-link></h3>
    <ul>
      <li><router-link :to="`/event/${event.address}`">Event page</router-link></li>
      <li><router-link :to="`/admin/${event.address}/participants`">Mark participants as complete</router-link></li>
      <li><router-link :to="`/admin/${event.address}/end`">End the event</router-link></li>
      <li><router-link :to="`/admin/${event.address}/close`">Close the event</router-link></li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "AdminMenu",
  data() {
    return {
    };
  },
  async beforeCreate() {
    // await this.$store.dispatch("registerWeb3");
    // await this.$store.dispatch("loadContract", this.eventId);
    // this.loadEvent();
  },
  computed: {
    ...mapState(['event', 'web3']),
    isAdmin() {
      return this.event.organiserAddress.toLowerCase() === this.web3.account.toLowerCase();
    },
  },
};
</script>
<style>
.admin-menu {
  border: 1px solid #efefef;
  background: white;
  border-radius: 3px;
  margin: 0;
  padding: 1rem;
}
.admin-menu ul {
  list-style: none;
}

</style>