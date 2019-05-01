const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const user = require('../controllers/user');
const chatRoom = require('../controllers/chatRoom');
const verify = require('../jwt');

router.get('/', verify.jwt, user.getLoginUserInfo);

router.post('/', [
    check('username').exists().withMessage('Username is required'),
    check('gender').exists().withMessage('Gender is required'),
    check('email').exists().withMessage('Email is required').isEmail().withMessage('Email is not valid'),
    check('mobile').custom((value) => /^1[34578]\d{9}$/.test(value)).withMessage('mobile is not valid'),
    check('password').exists().withMessage('Password is required').custom((value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)).withMessage('Password is not valid'),
    check('confirmPassword').exists().withMessage('confirmPassword is required').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
    check('recaptchaResponse').exists().withMessage('recaptcha is required'),
], user.createNewUser);

passport.use(new LocalStrategy(
    user.loginStrategy
));

router.post('/login', user.login);

router.post('/avatar', verify.jwt, user.updateAvatar);

router.post('/status', verify.jwt, user.updateStatus);

router.get('/friends', verify.jwt, user.getFriendsList);

router.get('/chat-rooms', verify.jwt, chatRoom.getChatRooms);

router.get('/old-messages', verify.jwt, chatRoom.getOldMessages);

router.post('/search', verify.jwt, user.searchFriends);

router.delete('/chat-room/:id', verify.jwt, chatRoom.deleteChatRoom);

router.post('/logout', verify.jwt, user.logout);

module.exports = router;