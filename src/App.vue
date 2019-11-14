<template>
  <div id="app">
    <MainNav />
    <div id="main">
      <router-view/>
    </div>
    <AccountInfo/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AccountInfo from './components/AccountInfo';
import MainNav from './components/MainNav';

export default {
  name: 'App',
  components: {
    AccountInfo,
    MainNav,
  },
  computed: {
    ...mapState(['web3']),
  },
}
</script>

<style>
</style>
