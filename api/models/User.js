/**
 * User.js
 *
 * @description :: User.
 */

module.exports = {
  attributes: {
    username: {
      type: 'string',
      unique: true,
      required: true,
      minLength: 3,
    },
    passports : {
      collection: 'Passport',
      via: 'user',
    },
  },
};
