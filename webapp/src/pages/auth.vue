<template lang="jade">
  div
    template(v-if="isAuthenticated")
      form(@submit.prevent="submitSignOut")
        p You are authenticated as <strong>{{ user.username }}</strong>.
        button(:disabled="inProgress", type="submit") Sign out

    template(v-else)
      form(@submit.prevent="submitSignIn")
        p You are not authenticated.
        div
          label
            | Username:
            input(type="text", :disabled="inProgress", v-model="username")
        div
          label
            | Password:
            input(type="password", :disabled="inProgress", v-model="password")
        div
          button(:disabled="inProgress", type="submit") Sign in
</template>

<style lang="sass">
</style>

<script>
  var utils = require('@/utils');

  module.exports = {

    name: 'Auth',

    route: {
      meta: {
        crumb: 'Auth',
      },
    },

    data: function() {
      return {
        username: '',
        password: '',
      };
    },

    computed: utils.merge([
      Vuex.mapGetters('auth', {
        inProgress: 'inProgress',
        isAuthenticated: 'isAuthenticated',
        user: 'user',
      }),
    ]),

    methods: utils.merge([
      Vuex.mapActions('auth', {
        doLogin: 'login',
        doLogout: 'logout',
      }),
      {
        submitSignIn: function() {
          this.doLogin({ username: this.username, password: this.password })
            .catch(console.warn);
        },
        submitSignOut: function() {
          this.doLogout()
            .catch(console.warn);
        },
      },
    ]),

  };
</script>
