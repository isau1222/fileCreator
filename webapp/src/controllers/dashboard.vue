<template lang="jade">
  div
    template(v-if="inProgress") Loading...
    template(v-else)
      h3(v-if="isAuthenticated") Welcome, <strong>{{ user.username }}</strong>!
      h3(v-else) Welcome, anonymous!
</template>

<script>
  module.exports = {

    name: 'Dashboard',

    computed: Vuex.mapGetters({
      inProgress: 'auth/inProgress',
      user: 'auth/user',
      isAuthenticated: 'auth/isAuthenticated',
    }),

  };
</script>
