<template lang="jade">
  div
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

    name: 'App',

    // @NOTE: this will be called during SSR
    // @NOTE: this is a static method of the component, and can not access `this`,
    //        because the instance may not exist during SSR
    // @NOTE: the only way to share information between server and client
    //        is to pass it through the vuex store, so it's likely that
    //        only store actions will be called here
    // @NOTE: restrain from cross-origin requests, because it's awkward
    //        to perform them during ssr
    preFetch: function(store, route) {
      return Promise.resolve()
        .then(function() {
          return store.dispatch('auth/update');
        });
    },

  };
</script>
