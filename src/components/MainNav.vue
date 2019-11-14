<template>
  <nav class="mainnav">
    <div>
      <router-link
        :to="'/'"
        class="logo">SponsoredBlock</router-link>
    </div>
    <div>
      <router-link
        :to="'/about'"
        >About</router-link>
    </div>
    <div>
      <router-link
        :to="'/create'"
        >Start Fundraising</router-link>
    </div>
    <div v-if="!web3.isInjected" class="sign-in" @click="connect">Sign in</div>
  </nav>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "MainNav",
  data() {
    return {
    };
  },
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    // await this.$store.dispatch("loadContract", this.eventId);
    // this.loadEvent();
  },
  computed: {
    ...mapState(['web3']),
  },
  methods: {
    async connect() {
      this.$store.dispatch("registerWeb3");
    },
  },
};
</script>
<style>
</style>