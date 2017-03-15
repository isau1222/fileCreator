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

    name: 'App',

    data: function() {
      return {
        APP_ID: process.env.APP_ID, // @IMPORTANT
      };
    },

    // @NOTE: this will be called during SSR
    // @NOTE: this is a static method of the component, and can not access `this`,
    //        because the instance may not exist during SSR
    // @NOTE: the only way to share information between server and client
    //        is to pass it through the vuex store, so it's likely that
    //        only store actions will be called here
    // @NOTE: restrain from cross-origin requests, because it's awkward
    //        to perform them during ssr
    // @NOTE: this preFetch should fetch all the data necessary for resolving
    //        router guards
    // @NOTE: in most components preFetch has a signature of `(store, route)`,
    //        but for the root component preFetch happens before the router is
    //        ignited, so it only gets `(store)`
    preFetch: function(store) {
      return Promise.resolve()
        .then(function() {
          return store.dispatch('auth/update');
        });
    },

  };
</script>
