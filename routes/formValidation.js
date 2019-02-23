const express = require('express');
const router = express.Router();

const db = require('../models/db');
const User = require('../models/userSchema');

router.post('/unique-name', async (req, res, next) => {
    let resultJson = {};
    if( req.body.username ) {
        try {
            let existUser = await User.uniqueUsername(req.body.username);
            if(existUser) {
                resultJson.valid = false;
                resultJson.message = `${existUser.username} 已经被用啦~`;
            } else {
                resultJson.valid = true;
            }
            res.json(resultJson);
        } catch(err) {
            next(err);
        }
    }
});
  
router.post('/unique-email', async (req, res, next) => {
    let resultJson = {};
    if( req.body.email ) {
      try {
          let existUser = await User.uniqueEmail(req.body.email);
          if(existUser) {
              resultJson.valid = false;
              resultJson.message = `${existUser.email} 已经存在~`;
          } else {
              resultJson.valid = true;
          }
          res.json(resultJson);
      } catch(err) {
          next(err);
      }
    }
});

module.exports = router;