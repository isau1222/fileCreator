<template lang="jade">
  div I am report \#{{ $route.params.reportId }}
</template>

<script>
  module.exports = {

    name: 'Report',

    route: {
      meta: {
        crumb: function(route) {
          return 'Report #' + route.params.reportId;
        },
      },
    },

  };
</script>
