<template lang="jade">
  div(:id="APP_ID")
    h3 Crumbs
    pre {{ $crumbs }}
    ul
      li: router-link(to="/") Dashboard
      li: router-link(to="/auth") Auth
      li
        router-link(to="/reports") Reports
        ul
          li(v-for="io in 5")
            router-link(:to="{ name: 'report', params: { reportId: io } }") Report \#{{ io }}
    router-view
</template>

<style lang="sass">
</style>

<script>
  module.exports = {

    name: 'DefaultLayout',

    data: function() {
      return {
        APP_ID: process.env.APP_ID, // @IMPORTANT
      };
    },

  };
</script>
