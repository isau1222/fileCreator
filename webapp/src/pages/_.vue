<template lang="jade">
  h3 404, Not found!
</template>

<script>
  module.exports = {

    name: 'Error404',

    route: {
      meta: {
        crumb: 'Error',
        status: 404,
      },
    },

  };
</script>
