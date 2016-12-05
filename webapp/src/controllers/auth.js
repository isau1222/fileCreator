module.exports = {
  name: 'Auth',
  template: [
    '<div>',
      '<h3>Auth state</h3>',
      '<pre>{{ authState }}</pre>',
      '<p>',
        '<form @submit.prevent="submitSignIn">',
          '<div><label>Username: <input type="text" :disabled="busy" v-model="username"></label></div>',
          '<div><label>Password: <input type="text" :disabled="busy" v-model="password"></label></div>',
          '<div><button :disabled="busy" type="submit">Sign in</button></div>',
        '</form>',
        '<form @submit.prevent="submitSignOut">',
          '<div><button :disabled="busy" type="submit">Sign out</button></div>',
        '</form>',
        '<form @submit.prevent="submitUpdate">',
          '<div><button :disabled="busy" type="submit">Update</button></div>',
        '</form>',
      '</p>',
    '</div>',
  ].join(''),
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
