<template lang="jade">
  div
    h3 Auth state
    pre {{ authState }}
    p
      form(@submit.prevent="submitSignIn")
        div
          label
            | Username:
            input(type="text", :disabled="busy", v-model="username")
        div
          label
            | Password:
            input(type="text", :disabled="busy", v-model="password")
        div
          button(:disabled="busy", type="submit") Sign in
      form(@submit.prevent="submitSignOut")
        div
          button(:disabled="busy", type="submit") Sign out
      form(@submit.prevent="submitUpdate")
        div
          button(:disabled="busy", type="submit") Update
</template>

<style lang="sass">
</style>

<script>
  module.exports = {

    name: 'Auth',

    data: function() {
      return {
        username: '',
        password: '',
      };
    },

    computed: {
      authState: function() {
        return this.$store.state.auth;
      },
      busy: function() {
        return this.$store.state.auth.inProgress;
      },
    },

    methods: {
      submitSignIn: function() {
        return this.$store.dispatch('auth/login', { username: this.username, password: this.password });
      },
      submitSignOut: function() {
        return this.$store.dispatch('auth/logout');
      },
      submitUpdate: function() {
        return this.$store.dispatch('auth/update');
      },
    },

  };
</script>
