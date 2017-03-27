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

    roles: { type: 'array' },

    // @TODO: serialization for public use

    // @TODO: serialization for session

  },

  // @TODO: beforeCreate/beforeUpdate validation of roles

};
