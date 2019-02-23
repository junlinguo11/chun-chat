const jwt = require('express-jwt');
module.exports.jwt = jwt({
    secret: 'junlinguoisthebest',
    userProperty: 'payload',
    getToken: (req) => {
      if (req.cookies && req.cookies.awesome) {
        return req.cookies.awesome;
      } else {
        return null;
      }
    }
  });