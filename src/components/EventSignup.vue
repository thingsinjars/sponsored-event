<template>
  <div class="body">
    <h1>{{ msg }}</h1>
    <nav class="event-nav">
      <ul>
        <li><router-link :to="`/event/${event.address}`">See event details</router-link></li>
        <li><router-link :to="`/event/${event.address}/participants`">See who else has signed up</router-link></li>
      </ul>
    </nav>
    <form
      v-if="event.address"
      @submit.prevent="signUp">
      <div>
        <h3>Event Address</h3>
        <p>{{event.address}}</p>
      </div>
      <div>
        <h3>Your address</h3>
        <p>{{web3.account}}</p>
      </div>

      <div>
        <label>Your name:</label>
        <input type="text" v-model="participantName">
        <p class="smalltext">This is the public name you want to sign up with.</p>
      </div>

      <button class="obviousbutton">Sign up</button>
    </form>
    <div v-else>
      <Loader :loading="loading"/>
    </div>
  </div>
</template>

<script>
import Loader from '@/components/Loader'
import { mapState } from 'vuex';

export default {
  name: "EventSignup",
  async beforeCreate() {
    await this.$store.dispatch("registerWeb3");
    await this.$store.dispatch("loadContract", this.eventId);
    await this.$store.dispatch("loadEvent");
    await this.$store.dispatch("loadGasPrice");
    this.loading = false;
  },
  components: {
    Loader,
  },
  data() {
    return {
      loading: true,
      msg: "Sign-up for this event",
      eventId: this.$route.params.eventId,
      participantName: "",
    };
  },
  computed: {
    ...mapState(['contract', 'event', 'web3', 'participants']),
  },
  methods: {
    async signUp() {
      if(this.participantName.trim() === "") {
        return;
      }
      this.loading = false;
      try {
        const tx = await this.$store.state.contract.signUpForEvent(
          this.participantName, {
            from: this.web3.account,
            value: this.event.signUpFee,
            gas: 150000,
            gasPrice: this.$store.state.gasPrice
          }
        );

        const log = tx.logs.filter(log => log.event === 'SignUpEvent')[0];
        this.$router.push(`/event/${log.address}/participant/${log.args.participantId.toNumber()}`);
        this.loading = false;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
</script>
